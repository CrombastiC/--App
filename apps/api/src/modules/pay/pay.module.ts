import { Module } from '@nestjs/common';
import { PayController } from './pay.controller';
import { PayService } from './pay.service';
import { AlipayService } from '../../common/pay/alipay.service';

@Module({
  controllers: [PayController],
  providers: [PayService, AlipayService],
  exports: [PayService],
})
export class PayModule {}
