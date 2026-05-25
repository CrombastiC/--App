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

  // 3. 初始化奖品
  const existingPrizeCount = await prisma.lotteryPrize.count();
  if (existingPrizeCount > 0) {
    console.log(`⚠️  已存在 ${existingPrizeCount} 个奖品，跳过初始化`);
    return;
  }

  for (const prize of prizeData) {
    await prisma.lotteryPrize.create({ data: prize });
    console.log(`  ✅ ${prize.prizeName} (积分: ${prize.prizeIntegral}, 库存: ${prize.stock})`);
  }

  console.log(`\n🎉 成功初始化 ${prizeData.length} 个奖品！`);

  // 4. 初始化礼品卡
  const existingCardCount = await prisma.giftCard.count();
  if (existingCardCount > 0) {
    console.log(`⚠️  已存在 ${existingCardCount} 张礼品卡，跳过初始化`);
    return;
  }

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

main()
  .catch((e) => {
    console.error('❌ 种子数据初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
