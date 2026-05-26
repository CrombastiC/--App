import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// 九宫格奖品配置
const prizeData = [
  {
    prizeName: 'iPhone 16 Pro',
    prizeImage: 'https://img.icons8.com/3d-fluency/94/iphone-16-pro.png',
    prizeIntegral: 0,
    prizeValue: 8999,
    stock: 1,
    sortOrder: 0,
  },
  {
    prizeName: '华为 MatePad',
    prizeImage: 'https://img.icons8.com/3d-fluency/94/tablet.png',
    prizeIntegral: 0,
    prizeValue: 3999,
    stock: 2,
    sortOrder: 4,
  },
  {
    prizeName: '积分 ×50',
    prizeImage: 'https://img.icons8.com/3d-fluency/94/coins.png',
    prizeIntegral: 50,
    prizeValue: null,
    stock: 9999,
    sortOrder: 1,
  },
  {
    prizeName: '积分 ×100',
    prizeImage: 'https://img.icons8.com/3d-fluency/94/money.png',
    prizeIntegral: 100,
    prizeValue: null,
    stock: 9999,
    sortOrder: 2,
  },
  {
    prizeName: '积分 ×200',
    prizeImage: 'https://img.icons8.com/3d-fluency/94/gift.png',
    prizeIntegral: 200,
    prizeValue: null,
    stock: 9999,
    sortOrder: 3,
  },
  {
    prizeName: '积分 ×500',
    prizeImage: 'https://img.icons8.com/3d-fluency/94/treasure-chest.png',
    prizeIntegral: 500,
    prizeValue: null,
    stock: 9999,
    sortOrder: 5,
  },
  {
    prizeName: '积分 ×30',
    prizeImage: 'https://img.icons8.com/3d-fluency/94/star.png',
    prizeIntegral: 30,
    prizeValue: null,
    stock: 9999,
    sortOrder: 6,
  },
  {
    prizeName: '积分 ×80',
    prizeImage: 'https://img.icons8.com/3d-fluency/94/diamond.png',
    prizeIntegral: 80,
    prizeValue: null,
    stock: 9999,
    sortOrder: 7,
  },
  {
    prizeName: '积分 ×150',
    prizeImage: 'https://img.icons8.com/3d-fluency/94/crown.png',
    prizeIntegral: 150,
    prizeValue: null,
    stock: 9999,
    sortOrder: 8,
  },
];

// 菜品分类
const categoryData = [
  { classifyName: '热销推荐', icon: 'fire', sortOrder: 0 },
  { classifyName: '主食', icon: 'rice', sortOrder: 1 },
  { classifyName: '炒菜', icon: 'pot', sortOrder: 2 },
  { classifyName: '汤品', icon: 'soup', sortOrder: 3 },
  { classifyName: '饮品', icon: 'cup', sortOrder: 4 },
  { classifyName: '甜品', icon: 'cake', sortOrder: 5 },
];

// 管理员账号
const ADMIN_PHONE = '13800000000';
const ADMIN_PASSWORD = 'admin123';

async function main() {
  // 1. 初始化管理员
  const existingAdmin = await prisma.user.findUnique({
    where: { phone: ADMIN_PHONE },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await prisma.user.create({
      data: {
        phone: ADMIN_PHONE,
        username: '管理员',
        password: hashedPassword,
        role: 'admin',
      },
    });
    console.log(`✅ 管理员账号创建成功: ${ADMIN_PHONE} / ${ADMIN_PASSWORD}`);
  } else if (existingAdmin.role !== 'admin') {
    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: { role: 'admin' },
    });
    console.log(`✅ 已将 ${ADMIN_PHONE} 升级为管理员`);
  } else {
    console.log(`⚠️  管理员账号已存在: ${ADMIN_PHONE}`);
  }

  // 2. 初始化菜品分类
  const existingCatCount = await prisma.foodCategory.count();
  if (existingCatCount === 0) {
    for (const cat of categoryData) {
      await prisma.foodCategory.create({ data: cat });
      console.log(`  ✅ 分类: ${cat.classifyName}`);
    }
    console.log(`🎉 成功初始化 ${categoryData.length} 个菜品分类`);
  } else {
    console.log(`⚠️  已存在 ${existingCatCount} 个分类，跳过初始化`);
  }

  // 3. 初始化充值选项
  const existingMoneyCount = await prisma.moneyOption.count();
  if (existingMoneyCount === 0) {
    const moneyOptionData = [
      { money: 50, giveMoney: 0, sortOrder: 0 },
      { money: 100, giveMoney: 5, sortOrder: 1 },
      { money: 200, giveMoney: 15, sortOrder: 2 },
      { money: 500, giveMoney: 50, sortOrder: 3 },
      { money: 1000, giveMoney: 120, sortOrder: 4 },
      { money: 2000, giveMoney: 300, sortOrder: 5 },
    ];
    for (const opt of moneyOptionData) {
      await prisma.moneyOption.create({ data: opt });
      console.log(`  ✅ 充值选项: ¥${opt.money} (送¥${opt.giveMoney})`);
    }
    console.log(`🎉 成功初始化 ${moneyOptionData.length} 个充值选项`);
  } else {
    console.log(`⚠️  已存在 ${existingMoneyCount} 个充值选项，跳过初始化`);
  }

  // 4. 初始化奖品
  const existingPrizeCount = await prisma.lotteryPrize.count();
  if (existingPrizeCount > 0) {
    console.log(`⚠️  已存在 ${existingPrizeCount} 个奖品，跳过初始化`);
  } else {
    for (const prize of prizeData) {
      await prisma.lotteryPrize.create({ data: prize });
      console.log(`  ✅ ${prize.prizeName} (积分: ${prize.prizeIntegral}, 库存: ${prize.stock})`);
    }
    console.log(`\n🎉 成功初始化 ${prizeData.length} 个奖品！`);
  }

  // 5. 初始化积分商城商品
  const existingCommodityCount = await prisma.commodity.count();
  if (existingCommodityCount === 0) {
    const commodityData = [
      {
        commodityName: '拿铁咖啡兑换券',
        commodityImage: 'https://img.icons8.com/3d-fluency/94/coffee.png',
        commodityIntegral: 200,
        stock: 100,
        sortOrder: 0,
      },
      {
        commodityName: '芒果布丁',
        commodityImage: 'https://img.icons8.com/3d-fluency/94/pudding.png',
        commodityIntegral: 150,
        stock: 50,
        sortOrder: 1,
      },
      {
        commodityName: '5元代金券',
        commodityImage: 'https://img.icons8.com/3d-fluency/94/voucher.png',
        commodityIntegral: 300,
        stock: 200,
        sortOrder: 2,
      },
      {
        commodityName: '10元代金券',
        commodityImage: 'https://img.icons8.com/3d-fluency/94/discount.png',
        commodityIntegral: 500,
        stock: 100,
        sortOrder: 3,
      },
      {
        commodityName: '精美餐具套装',
        commodityImage: 'https://img.icons8.com/3d-fluency/94/tableware.png',
        commodityIntegral: 800,
        stock: 30,
        sortOrder: 4,
      },
      {
        commodityName: '定制马克杯',
        commodityImage: 'https://img.icons8.com/3d-fluency/94/mug.png',
        commodityIntegral: 1000,
        stock: 20,
        sortOrder: 5,
      },
    ];
    for (const commodity of commodityData) {
      await prisma.commodity.create({ data: commodity });
      console.log(`  ✅ 积分商品: ${commodity.commodityName} (${commodity.commodityIntegral}积分, 库存${commodity.stock})`);
    }
    console.log(`🎉 成功初始化 ${commodityData.length} 个积分商品`);
  } else {
    console.log(`⚠️  已存在 ${existingCommodityCount} 个积分商品，跳过初始化`);
  }

  // 6. 初始化抽奖中奖记录（围观大奖 + 中奖播报）
  const existingRecordCount = await prisma.lotteryRecord.count();
  if (existingRecordCount === 0) {
    // 创建几个模拟用户用于中奖展示
    const mockUsers = [
      { phone: '13900001111', username: '张三', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan' },
      { phone: '13900002222', username: '李四', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisi' },
      { phone: '13900003333', username: '王五', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangwu' },
      { phone: '13900004444', username: '赵六', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhaoliu' },
      { phone: '13900005555', username: '小美', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=xiaomei' },
      { phone: '13900006666', username: '阿杰', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ajie' },
      { phone: '13900007777', username: '大熊', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=daxiong' },
      { phone: '13900008888', username: '小红', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=xiaohong' },
    ];

    const hashedMockPwd = await bcrypt.hash('123456', 10);
    const createdUsers: { id: string }[] = [];
    for (const u of mockUsers) {
      const existing = await prisma.user.findUnique({ where: { phone: u.phone } });
      if (existing) {
        createdUsers.push(existing);
      } else {
        const user = await prisma.user.create({
          data: { phone: u.phone, username: u.username, avatar: u.avatar, password: hashedMockPwd },
        });
        createdUsers.push(user);
      }
    }

    // 查询已有的奖品
    const prizes = await prisma.lotteryPrize.findMany({ orderBy: { sortOrder: 'asc' } });
    const bigPrizes = prizes.filter(p => p.prizeIntegral === 0); // 大奖
    const pointPrizes = prizes.filter(p => p.prizeIntegral > 0); // 积分奖

    if (prizes.length > 0 && createdUsers.length > 0) {
      const records: { userId: string; prizeId: string; costIntegral: number; createdAt: Date }[] = [];
      const now = Date.now();

      // 生成 20 条中奖记录（混合大奖和积分奖）
      for (let i = 0; i < 20; i++) {
        const user = createdUsers[i % createdUsers.length];
        // 每 5 条出一个大奖，其余为积分奖
        const isBig = i % 5 === 0 && bigPrizes.length > 0;
        const prize = isBig
          ? bigPrizes[i % bigPrizes.length]
          : pointPrizes[i % pointPrizes.length];
        // 时间递减，每条间隔 10-30 分钟
        const createdAt = new Date(now - i * (10 + Math.random() * 20) * 60 * 1000);

        records.push({
          userId: user.id,
          prizeId: prize.id,
          costIntegral: 200,
          createdAt,
        });
      }

      await prisma.lotteryRecord.createMany({ data: records });
      console.log(`  ✅ 中奖记录: ${records.length} 条`);
      console.log(`🎉 成功初始化 ${records.length} 条抽奖中奖记录`);
    }
  } else {
    console.log(`⚠️  已存在 ${existingRecordCount} 条中奖记录，跳过初始化`);
  }

  // 7. 初始化礼品卡
  const existingCardCount = await prisma.giftCard.count();
  if (existingCardCount > 0) {
    console.log(`⚠️  已存在 ${existingCardCount} 张礼品卡，跳过初始化`);
  } else {
    const giftCardData = [
      { code: 'GIFT-100-ABCD', amount: 100, expiresAt: new Date('2027-12-31') },
      { code: 'GIFT-50-EFGH', amount: 50, expiresAt: new Date('2027-12-31') },
      { code: 'GIFT-200-IJKL', amount: 200, expiresAt: new Date('2027-12-31') },
      { code: 'GIFT-500-MNOP', amount: 500, expiresAt: new Date('2027-12-31') },
    ];
    for (const card of giftCardData) {
      await prisma.giftCard.create({ data: card });
      console.log(`  ✅ 礼品卡: ${card.code} (面额: ¥${card.amount})`);
    }
    console.log(`\n🎉 成功初始化 ${giftCardData.length} 张礼品卡！`);
  }
}

main()
  .catch((e) => {
    console.error('❌ 种子数据初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
