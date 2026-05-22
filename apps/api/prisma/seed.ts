import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 九宫格奖品配置
// prizeIntegral: 0 = 实物大奖, > 0 = 积分奖励
const prizeData = [
  // ---- 大奖（prizeIntegral = 0）----
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
  // ---- 积分奖励（prizeIntegral > 0）----
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

async function main() {
  console.log('🌱 开始初始化九宫格奖品数据...');

  // 清空旧数据（可选，保留抽奖记录则不删）
  const existingCount = await prisma.lotteryPrize.count();
  if (existingCount > 0) {
    console.log(`⚠️  已存在 ${existingCount} 个奖品，跳过初始化`);
    console.log('💡 如需重新初始化，请先清空 lottery_prizes 表');
    return;
  }

  for (const prize of prizeData) {
    await prisma.lotteryPrize.create({ data: prize });
    console.log(`  ✅ ${prize.prizeName} (积分: ${prize.prizeIntegral}, 库存: ${prize.stock})`);
  }

  console.log(`\n🎉 成功初始化 ${prizeData.length} 个奖品！`);
  console.log(`  📦 大奖: ${prizeData.filter(p => p.prizeIntegral === 0).length} 个`);
  console.log(`  💰 积分奖励: ${prizeData.filter(p => p.prizeIntegral > 0).length} 个`);
}

main()
  .catch((e) => {
    console.error('❌ 种子数据初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
