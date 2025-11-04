import { LuckyRollData, LuckyRollDataResponse, pointsService, WinningInfo } from '@/services/points.service';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, Image, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconButton } from 'react-native-paper';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 圆的配置数据
const CIRCLE_SIZE = 12;

// 每条边上的5个圆配置 [橙色实心, 白色空心, 浅色实心, 白色空心, 橙色实心]
const borderCircles = [
  { type: 'solid', color: 'rgb(227, 120, 21)' }, // 角落 - 橙色
  { type: 'hollow' }, // 空心白色
  { type: 'solid', color: 'rgb(255, 247, 232)' }, // 中间 - 浅色
  { type: 'hollow' }, // 空心白色
  { type: 'solid', color: 'rgb(227, 120, 21)' }, // 角落 - 橙色
];

// 抽奖转动路径（包含所有9个格子）
// 路径：0 → 1 → 2 → 5 → 4 → 3 → 6 → 7 → 8 → 循环
// 布局：0 1 2
//       3 4 5
//       6 7 8
const LOTTERY_PATH = [0, 1, 2, 5, 4, 3, 6, 7, 8];

const RECORDS_PER_PAGE = 5;

export default function LuckyRollScreen() {
  const [luckyRollData, setLuckyRollData] = useState<LuckyRollData[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1); // 当前高亮的格子索引
  const [isRolling, setIsRolling] = useState<boolean>(false); // 是否正在抽奖
  const timerRef = useRef<number | null>(null);
  const [currentPoints, setCurrentPoints] = useState<number>(0);
  const [freeDrawCount, setFreeDrawCount] = useState<number>(0);
  
  // 围观大奖数据
  const [bigPrizeData, setBigPrizeData] = useState<WinningInfo[]>([]);
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState<number>(1);
  const totalPages = Math.ceil(bigPrizeData.length / RECORDS_PER_PAGE);
  
  // 获取当前页的记录
  const getCurrentPageRecords = () => {
    const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
    const endIndex = startIndex + RECORDS_PER_PAGE;
    return bigPrizeData.slice(startIndex, endIndex);
  };
  
  //初始化数据
  useEffect(() => {
    getLuckyRollData();
    fetchBigPrizeData();
  }, []);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const getLuckyRollData = async () => {
    const [error, result] = await pointsService.getLuckyRollData();
    if (error) {
      console.error('获取抽奖数据失败:', error);
      return;
    }
    const data = (result as LuckyRollDataResponse)?.data?.prizeList;
    setCurrentPoints(result?.data?.userIntegral || 0);
    setFreeDrawCount(result?.data?.luckyDrawCount || 0);
    if (data && Array.isArray(data)) {
      setLuckyRollData(data);
      console.log('抽奖数据:', data);
    }
  }

  // 开始抽奖动画
  const startLottery = () => {
    if (isRolling) return; // 如果正在抽奖，不响应

    // 判断是否免费抽奖
    const costIntegral = freeDrawCount > 0 ? 0 : 200;

    // 如果不是免费抽奖，检查积分是否足够
    if (freeDrawCount <= 0 && currentPoints < 200) {
      alert('积分不足，无法抽奖');
      return;
    }

    setIsRolling(true);
    setCurrentIndex(-1);

    let step = 0; // 当前步数
    let speed = 100; // 初始速度（毫秒）
    const totalSteps = 30; // 总共转动的步数（至少转3圈多）
    const targetIndex = Math.floor(Math.random() * LOTTERY_PATH.length); // 随机中奖位置

    const animate = async () => {
      step++;
      const pathIndex = step % LOTTERY_PATH.length;
      setCurrentIndex(LOTTERY_PATH[pathIndex]);

      // 逐渐减速
      if (step > totalSteps - 8) {
        speed += 50; // 最后几步明显减速
      } else if (step > totalSteps / 2) {
        speed += 20; // 中间逐渐减速
      }

      // 检查是否到达目标位置
      if (step >= totalSteps && pathIndex === targetIndex) {
        // 抽奖结束
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }

        // 调用接口兑换奖品，根据是否免费抽奖传入不同的积分值
        const finalIndex = LOTTERY_PATH[targetIndex];
        const [error, result] = await pointsService.exchangePrize(luckyRollData[finalIndex]._id, costIntegral);

        setTimeout(() => {
          setIsRolling(false);

          // 检查接口是否报错
          if (error) {
            alert(`兑换失败：${error}`);
            return;
          }

          // 接口没报错才提示结果
          const prize = luckyRollData[finalIndex];
          alert(`恭喜你抽中了：${prize?.prizeName || '奖品'}`);

          // 更新积分和免费次数
          getLuckyRollData();
        }, 300);
        return;
      }

      // 继续动画
      timerRef.current = setTimeout(animate, speed) as unknown as number;
    };

    animate();
  };

  // 渲染九宫格项
  const renderGridItem = (index: number) => {
    const item = luckyRollData[index];
    const isHighlighted = currentIndex === index; // 判断是否高亮

    if (!item) {
      return (
        <View key={index} style={styles.gridItem}>
          <Text style={styles.gridItemText}>加载中...</Text>
        </View>
      );
    }

    return (
      <View
        key={index}
        style={[
          styles.gridItem,
          isHighlighted && styles.gridItemHighlighted
        ]}
      >
        <Image
          source={{ uri: item.prizeImage }}
          style={styles.gridItemImage}
          resizeMode="contain"
        />
        <Text style={styles.gridItemText} numberOfLines={1}>
          {item.prizeName}
        </Text>
      </View>
    );
  }

  //获取围观大奖数据
  const fetchBigPrizeData = async () => {
    const [error, result] = await pointsService.getWinningRecords(true);
    if (error) {
      console.error('获取围观大奖数据失败:', error);
      return;
    }
    console.log('获取围观大奖数据成功:', result.data);
    setBigPrizeData(result.data);
  };

  return (
    <ImageBackground
      source={require('@/assets/images/rollBackground.png')}
      style={styles.container}
      resizeMode="stretch"
      imageStyle={styles.backgroundImage}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>
              <Text style={styles.blueText}>掘金福利</Text>
              <Text style={styles.orangeText}>限量抽</Text>
            </Text>
            <Text style={styles.subTitleText}>惊喜大奖等你来拿！</Text>
          </View>
          <View>
            {/* 积分显示圆角矩形 */}
            <View style={styles.pointsContainer}>
              <Text style={styles.pointsText}>当前积分: {currentPoints}</Text>
            </View>
          </View>
          {/* 抽奖容器 */}
          <View style={styles.luckyRollContainer}>
          {/* 九宫格包装器 - 包含边框和九宫格 */}
          <View style={styles.gridWrapper}>
            {/* 上边框 - 5个圆 */}
            <View style={styles.upperBorder}>
              {borderCircles.map((circle, index) => (
                <View
                  key={`top-${index}`}
                  style={[
                    styles.circle,
                    circle.type === 'hollow' ? styles.hollowCircle : { backgroundColor: circle.color },
                  ]}
                />
              ))}
            </View>

            {/* 右边框 - 5个圆 */}
            <View style={styles.rightBorder}>
              {borderCircles.map((circle, index) => (
                <View
                  key={`right-${index}`}
                  style={[
                    styles.circle,
                    circle.type === 'hollow' ? styles.hollowCircle : { backgroundColor: circle.color },
                  ]}
                />
              ))}
            </View>

            {/* 下边框 - 5个圆 */}
            <View style={styles.lowerBorder}>
              {borderCircles.map((circle, index) => (
                <View
                  key={`bottom-${index}`}
                  style={[
                    styles.circle,
                    circle.type === 'hollow' ? styles.hollowCircle : { backgroundColor: circle.color },
                  ]}
                />
              ))}
            </View>

            {/* 左边框 - 5个圆 */}
            <View style={styles.leftBorder}>
              {borderCircles.map((circle, index) => (
                <View
                  key={`left-${index}`}
                  style={[
                    styles.circle,
                    circle.type === 'hollow' ? styles.hollowCircle : { backgroundColor: circle.color },
                  ]}
                />
              ))}
            </View>

            {/* 抽奖九宫格 */}
            <View style={styles.luckyRollGrid}>
              {/* 第一行 */}
              <View style={styles.rowContainer}>
                {renderGridItem(0)}
                {renderGridItem(1)}
                {renderGridItem(2)}
              </View>
              {/* 第二行 */}
              <View style={styles.rowContainer}>
                {renderGridItem(3)}
                {renderGridItem(4)}
                {renderGridItem(5)}
              </View>
              {/* 第三行 */}
              <View style={styles.rowContainer}>
                {renderGridItem(6)}
                {renderGridItem(7)}
                {renderGridItem(8)}
              </View>
            </View>
          </View>

          {/* 底部按钮区域 */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.singleDrawButton,
                isRolling && styles.buttonDisabled
              ]}
              onPress={startLottery}
              disabled={isRolling}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>单抽</Text>
                {freeDrawCount > 0 ? (
                  <View style={styles.freeRow}>
                    <Text
                      style={styles.freeDrawSubText}
                      numberOfLines={1}
                      adjustsFontSizeToFit={true}
                      minimumFontScale={0.7}
                    >
                      免费抽奖次数：{freeDrawCount}次
                    </Text>
                  </View>
                ) : (
                  <View style={styles.costRow}>
                    <Image source={require('@/assets/images/积分.png')} style={styles.costIcon} />
                    <Text style={styles.buttonSubText}>200</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.multiDrawButton, isRolling && styles.buttonDisabled]}
              onPress={() => handlePress('multi')}
              disabled={isRolling}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>十连抽</Text>
                <View style={styles.costRow}>
                  <Image source={require('@/assets/images/积分.png')} style={styles.costIcon} />
                  <Text style={styles.buttonSubText}>2000</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* 围观大奖区域 */}
        <View style={styles.winRecordsContainer}>
          <Text style={styles.winRecordsTitle}>一围观大奖一</Text>
          
          {/* 中奖记录列表 */}
          <View style={styles.recordsList}>
            {getCurrentPageRecords().map((record) => (
              <View key={record._id} style={styles.recordItem}>
                <View style={styles.recordLeft}>
                  {/* 奖品图片 */}
                  <View style={styles.recordImage}>
                    <Image 
                      source={record.prizeImage ? { uri: record.prizeImage } : require('@/assets/images/积分.png')} 
                      style={styles.prizeImage}
                    />
                  </View>
                  <View style={styles.recordInfo}>
                    <Text style={styles.congratsText}>恭喜 </Text>
                    {record.userAvatar && (
                      <Image 
                        source={{ uri: record.userAvatar }} 
                        style={styles.inlineAvatar}
                      />
                    )}
                    <Text style={styles.usernameText} numberOfLines={1} ellipsizeMode="tail">
                      {record.username}
                    </Text>
                    <Text style={styles.congratsText}> 抽中 </Text>
                    <Text style={styles.prizeText} numberOfLines={1} ellipsizeMode="tail">
                      {record.prizeName}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* 分页器 */}
          <View style={styles.pagination}>
            <IconButton
              icon="chevron-left"
              iconColor="#fff"
              size={24}
              onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              style={[
                styles.paginationArrow,
                currentPage === 1 && styles.paginationArrowDisabled
              ]}
            />
            
            <View style={styles.pageNumbers}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <TouchableOpacity
                  key={page}
                  style={[
                    styles.pageNumber,
                    currentPage === page && styles.pageNumberActive
                  ]}
                  onPress={() => setCurrentPage(page)}
                >
                  <Text style={[
                    styles.pageNumberText,
                    currentPage === page && styles.pageNumberTextActive
                  ]}>
                    {page}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <IconButton
              icon="chevron-right"
              iconColor="#fff"
              size={24}
              onPress={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              style={[
                styles.paginationArrow,
                currentPage === totalPages && styles.paginationArrowDisabled
              ]}
            />
          </View>
        </View>
      </View>
      </ScrollView>
    </ImageBackground>
  );
}

async function handlePress(type: string) {
  // 十连抽逻辑
  console.log(`${type === 'single' ? '单抽' : '十连抽'}按钮被点击`);

  if (type === 'multi') {
    // 十连抽，扣除2000积分
    alert('十连抽功能开发中，敬请期待！');
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(44, 104, 255)', // 添加背景色,防止图片未覆盖区域显示空白
  },
  backgroundImage: {
    // 可以根据需要调整图片的位置和缩放
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  titleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 30, // 添加左右内边距，防止文字被裁剪
  },
  titleText: {
    fontSize: 35,
    fontWeight: '900',
    fontStyle: 'italic', // 添加斜体效果
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    includeFontPadding: false, // Android 优化
    textAlign: 'center', // 文字居中
  },
  subTitleText: {
    fontSize: 18,
    color: '#fff',
    marginTop: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    includeFontPadding: false, // Android 优化
    textAlign: 'center', // 文字居中
  },
  blueText: {
    color: 'rgba(249, 237, 208)', // 蓝色
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  orangeText: {
    color: 'rgba(248, 201, 81)', // 橙色
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  pointsContainer: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(28, 118, 252)',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // Android 阴影
  },
  pointsText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgb(229, 241, 190)',
  },
  // 抽奖区域
  luckyRollContainer: {
    marginTop: 40,
    width: SCREEN_WIDTH * 0.9,
    backgroundColor: 'rgba(250, 214, 139)',
    borderRadius: 20,
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 10,
    alignItems: 'center',
    shadowColor: 'rgba(252, 190, 102, 0.5)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // Android 阴影
  },
  // 九宫格包装器 - 用于定位边框和九宫格
  gridWrapper: {
    width: '100%',
    aspectRatio: 1, // 保持正方形
    marginBottom: 20,
    position: 'relative',
  },
  luckyRollGrid: {
    position: 'absolute',
    top: CIRCLE_SIZE / 2,
    left: CIRCLE_SIZE / 2,
    right: CIRCLE_SIZE / 2,
    bottom: CIRCLE_SIZE / 2,
    backgroundColor: 'rgba(227, 120, 21, 0.9)',
    borderRadius: 15,
    padding: 10,
    gap: 6,
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 6,
    flex: 1,
  },
  gridItem: {
    flex: 1,
    backgroundColor: 'rgb(253, 243, 243)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  // 高亮状态的格子
  gridItemHighlighted: {
    backgroundColor: 'rgb(255, 215, 0)',
    borderWidth: 3,
    borderColor: 'rgb(255, 255, 255)',
    shadowColor: 'rgb(255, 215, 0)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
    transform: [{ scale: 1.05 }],
  },
  gridItemImage: {
    width: 40,
    height: 40,
    marginBottom: 4,
  },
  gridItemText: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgb(210, 95, 0)',
    textAlign: 'center',
  },
  // 上边框 - 横向5个圆
  upperBorder: {
    position: 'absolute',
    top: -CIRCLE_SIZE / 2,
    left: -CIRCLE_SIZE / 2,
    right: -CIRCLE_SIZE / 2,
    flexDirection: 'row',
    alignItems: 'center',
    height: CIRCLE_SIZE,
    justifyContent: 'space-between',
  },
  // 右边框 - 纵向5个圆
  rightBorder: {
    position: 'absolute',
    right: -CIRCLE_SIZE / 2,
    top: -CIRCLE_SIZE / 2,
    bottom: -CIRCLE_SIZE / 2,
    flexDirection: 'column',
    alignItems: 'center',
    width: CIRCLE_SIZE,
    justifyContent: 'space-between',
  },
  // 下边框 - 横向5个圆
  lowerBorder: {
    position: 'absolute',
    bottom: -CIRCLE_SIZE / 2,
    left: -CIRCLE_SIZE / 2,
    right: -CIRCLE_SIZE / 2,
    flexDirection: 'row',
    alignItems: 'center',
    height: CIRCLE_SIZE,
    justifyContent: 'space-between',
  },
  // 左边框 - 纵向5个圆
  leftBorder: {
    position: 'absolute',
    left: -CIRCLE_SIZE / 2,
    top: -CIRCLE_SIZE / 2,
    bottom: -CIRCLE_SIZE / 2,
    flexDirection: 'column',
    alignItems: 'center',
    width: CIRCLE_SIZE,
    justifyContent: 'space-between',
  },
  // 通用圆样式
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
  },
  // 空心圆样式
  hollowCircle: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#fff',
  },
  // 底部按钮容器
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    gap: 15,
  },
  // 单抽按钮
  singleDrawButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 140, 50)',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: 'rgba(255, 100, 0, 0.5)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
    minHeight: 48,
  },

  // 十连抽按钮
  multiDrawButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 140, 50)',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: 'rgba(255, 100, 0, 0.5)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
    minHeight: 48,
  },
  // 按钮内容容器
  buttonContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    width: '100%',
  },
  // 按钮文字
  buttonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },
  // 按钮副文字（积分）
  buttonSubText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },
  // 积分行
  costRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 20,
  },
  // 积分图标
  costIcon: {
    width: 20,
    height: 20,
  },
  // 免费次数行保持高度与积分行一致
  freeRow: {
    minHeight: 20,
    justifyContent: 'center',
  },
  // 免费抽奖副文字
  freeDrawSubText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '400',
    opacity: 0.9,
  },
  // 按钮禁用状态
  buttonDisabled: {
    opacity: 0.5,
  },
  // 国观大奖容器
  winRecordsContainer: {
    marginTop: 30,
    width: SCREEN_WIDTH * 0.9,
    backgroundColor: 'rgba(53, 107, 255, 0.95)',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'rgba(255, 165, 0, 0.8)',
    padding: 20,
    paddingBottom: 15,
    shadowColor: 'rgba(255, 165, 0, 0.5)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
    height: 480,
    position: 'relative',
  },
  winRecordsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  recordsList: {
    gap: 12,
    flex: 1,
    marginBottom: 60,
  },
  recordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  recordLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  recordImage: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  prizeImage: {
    width: 40,
    height: 40,
  },
  recordInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordFullText: {
    fontSize: 14,
    color: '#fff',
  },
  inlineAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  congratsText: {
    fontWeight: '500',
    fontSize: 14,
    color: '#fff',
  },
  avatarText: {
    fontSize: 16,
  },
  usernameText: {
    fontWeight: '600',
    fontSize: 14,
    color: '#fff',
    maxWidth: 50,
  },
  prizeText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    flex: 1,
  },
  // 分页器
  pagination: {
    position: 'absolute',
    bottom: 15,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  paginationArrow: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    margin: 0,
  },
  paginationArrowDisabled: {
    opacity: 0.3,
  },
  pageNumbers: {
    flexDirection: 'row',
    gap: 8,
  },
  pageNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageNumberActive: {
    backgroundColor: 'rgba(255, 165, 0, 0.9)',
  },
  pageNumberText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  pageNumberTextActive: {
    fontWeight: 'bold',
  },
});
