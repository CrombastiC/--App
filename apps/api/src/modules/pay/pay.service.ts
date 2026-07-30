import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../prisma/prisma.service";
import { AlipayService } from "../../common/pay/alipay.service";
import type { CreatePayDto } from "./dto/create-pay.dto";
import * as nanoid from "nanoid";
import dayjs from "dayjs";
import type { Request } from "express";

/**
 * 支付宝异步通知 body 结构
 */
interface AlipayNotifyBody {
  out_trade_no: string;
  trade_no: string;
  gmt_payment: string;
  body: string;
  total_amount: string;
  trade_status: string;
}

/**
 * 自定义通知 payload（存在 body 字段中）
 */
interface NotifyPayload {
  orderId: string;
  userId: string;
}

function isAlipayNotifyBody(value: unknown): value is AlipayNotifyBody {
  if (typeof value !== "object" || value === null) return false;
  const body = value as Record<string, unknown>;
  return (
    typeof body.out_trade_no === "string" &&
    typeof body.trade_no === "string" &&
    typeof body.gmt_payment === "string" &&
    typeof body.body === "string" &&
    typeof body.total_amount === "string" &&
    typeof body.trade_status === "string"
  );
}

function isNotifyPayload(value: unknown): value is NotifyPayload {
  if (typeof value !== "object" || value === null) return false;
  const payload = value as Record<string, unknown>;
  return (
    typeof payload.orderId === "string" && typeof payload.userId === "string"
  );
}

@Injectable()
export class PayService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly alipayService: AlipayService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 生成商户订单号
   */
  private createTradeNo(): string {
    const prefix = "OF";
    return `${prefix}-${nanoid.nanoid(12)}`;
  }

  /**
   * 创建支付订单并生成支付链接/签名串
   *
   * @param createPayDto 支付参数
   * @param userId 当前用户ID
   * @returns 支付URL（网页）或签名串（App）
   */
  async create(createPayDto: CreatePayDto, userId: string) {
    // 验证订单是否存在且属于当前用户
    const order = await this.prisma.order.findFirst({
      where: {
        id: createPayDto.orderId,
        userId,
      },
    });

    if (!order) {
      throw new NotFoundException("订单不存在");
    }

    if (order.status === "paid") {
      throw new BadRequestException("该订单已支付");
    }

    if (order.status === "cancelled") {
      throw new BadRequestException("该订单已取消");
    }

    if (Math.abs(createPayDto.totalAmount - order.payAmount) > 0.01) {
      throw new BadRequestException("支付金额与订单金额不一致");
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // 1. 创建支付记录
      const outTradeNo = this.createTradeNo();
      await tx.paymentRecord.create({
        data: {
          userId,
          orderId: createPayDto.orderId,
          outTradeNo,
          amount: createPayDto.totalAmount,
          subject: createPayDto.subject,
          body: createPayDto.body,
        },
      });

      // 2. 生成支付宝支付参数
      const expireTime = dayjs().add(15, "minute");
      const bizContent = {
        out_trade_no: outTradeNo,
        total_amount: createPayDto.totalAmount.toFixed(2),
        subject: createPayDto.subject,
        body: JSON.stringify({
          orderId: createPayDto.orderId,
          userId,
        }),
        product_code: "FAST_INSTANT_TRADE_PAY",
        time_expire: expireTime.format("YYYY-MM-DD HH:mm:ss"),
      };

      const notifyUrl = `${this.configService.get<string>("ALIPAY_NOTIFY_URL")}/api/pay/notify`;

      const payType = createPayDto.payType || "page";

      if (payType === "app") {
        // 移动端 App 支付：返回签名串，由 App 调用支付宝 SDK
        const signedStr = this.alipayService
          .getAlipaySdk()
          .sdkExec("alipay.trade.app.pay", {
            bizContent,
            notify_url: notifyUrl,
          });

        return {
          payString: signedStr, // 移动端支付签名串
          outTradeNo,
          timeExpire: expireTime.valueOf(),
        };
      }

      // 默认网页支付：返回支付页面 URL
      const payUrl = this.alipayService
        .getAlipaySdk()
        .pageExecute("alipay.trade.page.pay", "GET", {
          bizContent,
          notify_url: notifyUrl,
        });

      return {
        payUrl, // Web/H5 支付页面 URL
        outTradeNo,
        timeExpire: expireTime.valueOf(),
      };
    });

    return result;
  }

  /**
   * 支付宝异步通知处理
   *
   * 支付宝回调流程：
   * 1. 验签（由 alipay-sdk 自动处理）
   * 2. 更新支付记录状态
   * 3. 更新订单状态为已支付
   */
  async notify(req: Request) {
    const notifyBody = req.body as unknown;

    if (!isAlipayNotifyBody(notifyBody)) {
      throw new BadRequestException("无效的支付宝通知参数");
    }

    const signatureValid = this.alipayService
      .getAlipaySdk()
      .checkNotifySignV2(notifyBody);
    if (!signatureValid) {
      throw new BadRequestException("支付宝通知验签失败");
    }

    if (!["TRADE_SUCCESS", "TRADE_FINISHED"].includes(notifyBody.trade_status)) {
      return true;
    }

    const payload = JSON.parse(notifyBody.body) as unknown;
    if (!isNotifyPayload(payload)) {
      throw new BadRequestException("支付宝通知业务参数无效");
    }

    const paymentRecord = await this.prisma.paymentRecord.findUnique({
      where: { outTradeNo: notifyBody.out_trade_no },
    });
    if (
      !paymentRecord ||
      paymentRecord.orderId !== payload.orderId ||
      paymentRecord.userId !== payload.userId ||
      Math.abs(paymentRecord.amount - Number(notifyBody.total_amount)) > 0.01
    ) {
      throw new BadRequestException("支付宝通知订单信息不匹配");
    }

    await this.prisma.$transaction(async (tx) => {
      // 1. 更新支付记录
      await tx.paymentRecord.update({
        where: { outTradeNo: notifyBody.out_trade_no },
        data: {
          tradeNo: notifyBody.trade_no,
          tradeStatus: "TRADE_SUCCESS",
          payTime: dayjs(notifyBody.gmt_payment).toDate(),
        },
      });

      // 2. 更新订单状态
      await tx.order.update({
        where: { id: payload.orderId },
        data: { status: "paid" },
      });
    });

    return true;
  }

  /**
   * 查询订单支付状态
   */
  async queryPayStatus(orderId: string, userId: string) {
    const paymentRecord = await this.prisma.paymentRecord.findFirst({
      where: {
        orderId,
        userId,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!paymentRecord) {
      throw new NotFoundException("未找到支付记录");
    }

    return {
      outTradeNo: paymentRecord.outTradeNo,
      tradeNo: paymentRecord.tradeNo,
      tradeStatus: paymentRecord.tradeStatus,
      amount: paymentRecord.amount,
      payTime: paymentRecord.payTime,
    };
  }
}
