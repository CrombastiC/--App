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

const storeData = [
  {
    id: 'store-shanghai-zhonghai',
    name: '黛西餐厅（中海大厦店）',
    city: '上海市',
    address: '静安区江场三路134号',
    phone: '18339658260',
    businessHours: '10:00-22:00',
    averageWaitMinutes: 8,
    sortOrder: 1,
  },
  {
    id: 'store-shanghai-jingan',
    name: '黛西餐厅（静安大悦城店）',
    city: '上海市',
    address: '静安区西藏北路166号',
    phone: '18878006788',
    businessHours: '10:00-22:00',
    averageWaitMinutes: 7,
    sortOrder: 2,
  },
  {
    id: 'store-shanghai-pudong',
    name: '黛西餐厅（浦东世纪汇店）',
    city: '上海市',
    address: '浦东新区世纪大道1192号',
    phone: '18878006789',
    businessHours: '10:30-21:30',
    averageWaitMinutes: 10,
    sortOrder: 3,
  },
  {
    id: 'store-hangzhou-hubin',
    name: '黛西餐厅（杭州湖滨店）',
    city: '杭州市',
    address: '上城区湖滨路28号',
    phone: '18878006790',
    businessHours: '10:00-22:00',
    averageWaitMinutes: 8,
    sortOrder: 4,
  },
];

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

  // 6. 初始化礼品卡
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

  // 7. 初始化排队门店（可重复执行）
  for (const store of storeData) {
    await prisma.store.upsert({
      where: { id: store.id },
      update: store,
      create: store,
    });
  }
  console.log(`🎉 已同步 ${storeData.length} 家排队门店`);
}

main()
  .catch((e) => {
    console.error('❌ 种子数据初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
