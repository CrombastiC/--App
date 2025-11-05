import { LuckyRollData, LuckyRollDataResponse, pointsService, WinningInfo } from '@/services/points.service';
import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconButton } from 'react-native-paper';
import { CircleBorder, LotteryButton, LotteryResultModal } from './_components/_index';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 圆的配置数据
const CIRCLE_SIZE = 12;

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

  // 抽奖结果弹窗状态
  const [showResultModal, setShowResultModal] = useState<boolean>(false);
  const [resultPrizes, setResultPrizes] = useState<any[]>([]);
  const [isMultiResult, setIsMultiResult] = useState<boolean>(false);

  // 抽奖次数统计(用于保底机制)
  const [drawCount, setDrawCount] = useState<number>(0);
  
  // 距离上次大奖的抽数
  const [drawsSinceLastBigPrize, setDrawsSinceLastBigPrize] = useState<number>(0);

  // 围观大奖数据
  const [bigPrizeData, setBigPrizeData] = useState<WinningInfo[]>([]);

  // 中奖播报数据
  const [broadcastMessages, setBroadcastMessages] = useState<WinningInfo[]>([]);
  const [displayMessages, setDisplayMessages] = useState<WinningInfo[]>([]); // 用于显示的循环数据
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<any>(null);

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
    fetchBroadcastData();
  }, []);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, []);

  // 自动滚动效果 - 弹幕式丝滑滚动
  useEffect(() => {
    if (broadcastMessages.length > 0) {
      // 创建循环数据：原始数据重复多次，实现无缝循环
      const loopedMessages = [
        ...broadcastMessages,
        ...broadcastMessages,
        ...broadcastMessages,
        ...broadcastMessages,
      ];
      setDisplayMessages(loopedMessages);

      // 等待渲染完成后开始滚动
      setTimeout(() => {
        startSmoothScroll();
      }, 100);

      return () => {
        if (animationRef.current) {
          animationRef.current.stop();
        }
      };
    }
  }, [broadcastMessages]);

  // 启动平滑滚动
  const startSmoothScroll = () => {
    const itemHeight = 40;
    const totalHeight = broadcastMessages.length * itemHeight;

    // 使用 Animated.loop 实现无缝循环
    scrollY.setValue(0);

    animationRef.current = Animated.loop(
      Animated.timing(scrollY, {
        toValue: totalHeight,
        duration: broadcastMessages.length * 1500, // 每条消息显示约2秒 数值越大越慢
        useNativeDriver: true,
        easing: (t) => t, // 线性插值，确保匀速
      })
    );

    animationRef.current.start();
  };

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

  /**
   * 根据新的概率规则选择奖品
   * @param isGuaranteed 是否触发保底
   * @returns 中奖奖品的索引
   */
  const getWeightedRandomPrize = (isGuaranteed: boolean = false): number => {
    // 分离大奖和积分奖励
    const bigPrizes = luckyRollData
      .map((prize, index) => ({ prize, index }))
      .filter(item => item.prize.prizeIntegral === 0);
    
    const pointPrizes = luckyRollData
      .map((prize, index) => ({ prize, index }))
      .filter(item => item.prize.prizeIntegral !== 0);

    // 如果触发保底，必定返回大奖
    if (isGuaranteed && bigPrizes.length > 0) {
      const randomBigPrize = bigPrizes[Math.floor(Math.random() * bigPrizes.length)];
      return randomBigPrize.index;
    }

    // 平时单抽：1%概率大奖，99%积分
    const random = Math.random();
    if (random < 0.01 && bigPrizes.length > 0) {
      // 1%概率抽到大奖
      const randomBigPrize = bigPrizes[Math.floor(Math.random() * bigPrizes.length)];
      return randomBigPrize.index;
    } else {
      // 99%概率抽到积分
      if (pointPrizes.length > 0) {
        const randomPointPrize = pointPrizes[Math.floor(Math.random() * pointPrizes.length)];
        return randomPointPrize.index;
      }
    }

    // 保底：如果没有对应类型的奖品，随机返回一个
    return Math.floor(Math.random() * luckyRollData.length);
  };

  /**
   * 检查是否触发保底机制
   * @returns 是否应该给大奖
   */
  const checkGuarantee = (): boolean => {
    // 每80抽必定包含一个大奖
    if (drawsSinceLastBigPrize >= 79) {
      return true;
    }
    
    // 每80抽有50%概率包含额外大奖（在40-79抽之间）
    if (drawsSinceLastBigPrize >= 40 && drawsSinceLastBigPrize < 79) {
      return Math.random() < 0.5;
    }

    return false;
  };

  // 开始抽奖动画
  const startLottery = () => {
    if (isRolling) return; // 如果正在抽奖,不响应

    // 判断是否免费抽奖
    const costIntegral = freeDrawCount > 0 ? 0 : 200;

    // 如果不是免费抽奖,检查积分是否足够
    if (freeDrawCount <= 0 && currentPoints < 200) {
      alert('积分不足,无法抽奖');
      return;
    }

    setIsRolling(true);
    setCurrentIndex(-1);

    // 检查是否触发保底
    const isGuaranteed = checkGuarantee();
    
    // 根据保底机制和概率计算中奖位置
    const targetPrizeIndex = getWeightedRandomPrize(isGuaranteed);

    let step = 0; // 当前步数
    let speed = 100; // 初始速度(毫秒)
    const totalSteps = 30; // 总共转动的步数(至少转3圈多)
    const targetIndex = LOTTERY_PATH.indexOf(targetPrizeIndex); // 在路径中找到目标位置

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

        // 调用接口兑换奖品,根据是否免费抽奖传入不同的积分值
        const finalIndex = LOTTERY_PATH[targetIndex];
        const [error, result] = await pointsService.exchangePrize(luckyRollData[finalIndex]._id, costIntegral);

        setTimeout(() => {
          setIsRolling(false);

          // 检查接口是否报错
          if (error) {
            alert(`兑换失败:${error}`);
            return;
          }

          // 接口没报错才提示结果 - 使用弹窗展示
          const prize = luckyRollData[finalIndex];
          setResultPrizes([prize]);
          setIsMultiResult(false);
          setShowResultModal(true);

          // 更新抽奖次数统计
          setDrawCount(prev => prev + 1);
          
          // 更新距离上次大奖的抽数
          if (prize.prizeIntegral === 0) {
            // 抽到大奖，重置计数器
            setDrawsSinceLastBigPrize(0);
          } else {
            // 没抽到大奖，计数器+1
            setDrawsSinceLastBigPrize(prev => prev + 1);
          }

          // 更新积分和免费次数和抽奖数据
          getLuckyRollData();
          fetchBigPrizeData();
          fetchBroadcastData();
        }, 300);
        return;
      }

      // 继续动画
      timerRef.current = setTimeout(animate, speed) as unknown as number;
    };

    animate();
  };  // 抽奖结果处理函数
  const handlePress = async (type: string) => {
    if (type === 'single') {
      // 单抽逻辑
      startLottery();
        } else if (type === 'multi') {
      // 十连抽逻辑
      if (currentPoints < 2000) return alert('积分不足,无法十连抽');
      if (isRolling) return; // 如果正在抽奖,不响应

      setIsRolling(true);
      setCurrentIndex(-1);

      let step = 0;
      let speed = 50; // 初始速度更快
      const totalRounds = 10; // 总共10次抽奖
      let currentRound = 0;

      // 构造10个奖品ID - 根据新规则选择
      const prizeIds: string[] = [];
      const selectedPrizes: LuckyRollData[] = [];
      let bigPrizeCount = 0; // 记录十连中大奖数量
      
      // 分离大奖和积分奖励
      const bigPrizes = luckyRollData.filter(prize => prize.prizeIntegral === 0);
      const pointPrizes = luckyRollData.filter(prize => prize.prizeIntegral !== 0);

      for (let i = 0; i < 10; i++) {
        let selectedPrize: LuckyRollData;
        
        // 检查当前累计抽数是否触发保底
        const currentDrawsSince = drawsSinceLastBigPrize + i;
        const isGuaranteed = currentDrawsSince >= 79 || 
                            (currentDrawsSince >= 40 && currentDrawsSince < 79 && Math.random() < 0.5);
        
        if (isGuaranteed && bigPrizeCount === 0 && bigPrizes.length > 0) {
          // 触发保底且十连中还没大奖，给一个大奖
          selectedPrize = bigPrizes[Math.floor(Math.random() * bigPrizes.length)];
          bigPrizeCount++;
        } else if (bigPrizeCount === 0 && Math.random() < 0.01 && bigPrizes.length > 0) {
          // 1%概率给大奖（如果十连中还没出过大奖）
          selectedPrize = bigPrizes[Math.floor(Math.random() * bigPrizes.length)];
          bigPrizeCount++;
        } else {
          // 其他情况给积分
          if (pointPrizes.length > 0) {
            selectedPrize = pointPrizes[Math.floor(Math.random() * pointPrizes.length)];
          } else {
            selectedPrize = luckyRollData[Math.floor(Math.random() * luckyRollData.length)];
          }
        }
        
        prizeIds.push(selectedPrize._id);
        selectedPrizes.push(selectedPrize);
      }

      // 先调用接口获取十连抽结果
      const [error, result] = await pointsService.exchangeMultiPrize(prizeIds, 2000);
      
      if (error) {
        setIsRolling(false);
        alert(`十连抽失败:${error}`);
        return;
      }
      console.log('十连结果',result);

      // 动画函数 - 逐渐加速
      const animate = () => {
        step++;
        const pathIndex = step % LOTTERY_PATH.length;
        setCurrentIndex(LOTTERY_PATH[pathIndex]);

        // 每完成一圈,速度加快
        if (step % LOTTERY_PATH.length === 0) {
          currentRound++;
          speed = Math.max(30, speed - 5); // 逐渐加速,最快30ms
        }

        // 完成10圈后停止
        if (currentRound >= totalRounds) {
          if (timerRef.current) {
            clearTimeout(timerRef.current);
          }

          setTimeout(() => {
            setIsRolling(false);
            setCurrentIndex(-1);

            // 展示十连抽结果 - 使用弹窗展示
            setResultPrizes(result.data);
            setIsMultiResult(true);
            setShowResultModal(true);

            // 更新抽奖次数统计(十连抽算10次)
            setDrawCount(prev => prev + 10);
            
            // 更新距离上次大奖的抽数
            if (bigPrizeCount > 0) {
              // 十连中抽到了大奖
              // 找到最后一个大奖的位置，重置计数器为该位置之后的抽数
              const lastBigPrizeIndex = selectedPrizes.map((p, idx) => 
                p.prizeIntegral === 0 ? idx : -1
              ).filter(idx => idx !== -1).pop() || 0;
              
              setDrawsSinceLastBigPrize(9 - lastBigPrizeIndex);
            } else {
              // 十连中没抽到大奖
              setDrawsSinceLastBigPrize(prev => prev + 10);
            }

            // 更新积分和数据
            getLuckyRollData();
            fetchBigPrizeData();
            fetchBroadcastData();
          }, 300);
          return;
        }

        // 继续动画
        timerRef.current = setTimeout(animate, speed) as unknown as number;
      };

      animate();
    }
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

  // 获取中奖播报数据
  const fetchBroadcastData = async () => {
    const [error, result] = await pointsService.getWinningRecords(false);
    if (error) {
      console.error('获取中奖播报数据失败:', error);
      return;
    }
    console.log('获取中奖播报数据成功:', result.data);
    setBroadcastMessages(result.data);
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
              {/* 装饰性边框 */}
              <CircleBorder size={CIRCLE_SIZE} />

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
              <LotteryButton
                title="单抽"
                isFree={freeDrawCount > 0}
                freeCount={freeDrawCount}
                cost={200}
                onPress={() => handlePress('single')}
                disabled={isRolling}
              />
              <LotteryButton
                title="十连抽"
                cost={2000}
                onPress={() => handlePress('multi')}
                disabled={isRolling}
              />
            </View>
          </View>

          {/* 抽奖结果弹窗 */}
          <LotteryResultModal
            visible={showResultModal}
            onClose={() => setShowResultModal(false)}
            prizes={resultPrizes}
            isMulti={isMultiResult}
          />

          {/* 围观大奖区域 */}
          <View style={styles.winRecordsContainer}>
            <View style={styles.broadcastTitleContainer}>
              {/* 左侧线 */}
              <View style={styles.singleLine} />
              <Text style={styles.broadcastTitle}>围观大奖</Text>
              {/* 右侧线 */}
              <View style={styles.singleLine} />
            </View>

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
                        resizeMode="contain"
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

          {/* 中奖播报区域 */}
          <View style={styles.luckyRollBroadcast}>
            <View style={styles.broadcastTitleContainer}>
              {/* 左侧线 */}
              <View style={styles.singleLine} />
              <Text style={styles.broadcastTitle}>中奖播报</Text>
              {/* 右侧线 */}
              <View style={styles.singleLine} />
            </View>
            {/* 消息滚动区域 */}
            <View style={styles.broadcastMessagesContainer}>
              <Animated.View
                style={{
                  transform: [
                    {
                      translateY: scrollY.interpolate({
                        inputRange: [0, broadcastMessages.length * 40],
                        outputRange: [0, -broadcastMessages.length * 40],
                      }),
                    },
                  ],
                }}
              >
                {displayMessages.map((item, index) => (
                  <View key={`${item._id || 'msg'}-${index}`} style={styles.broadcastMessageItem}>
                    <View style={styles.broadcastLeftContent}>
                      <Text style={styles.broadcastEmoji}>🎉</Text>
                      <Text style={styles.broadcastLabel}>恭喜 </Text>
                      <Text style={styles.broadcastUsername} numberOfLines={1}>
                        {item.username}
                      </Text>
                      <Text style={styles.broadcastLabel}> 抽中 </Text>
                      <Text style={styles.broadcastPrizeName} numberOfLines={1}>
                        {item.prizeName}
                      </Text>
                    </View>
                    <Text style={styles.broadcastDate}>
                      {new Date(item.createdAt).getFullYear()}-{String(new Date(item.createdAt).getMonth() + 1).padStart(2, '0')}-{String(new Date(item.createdAt).getDate()).padStart(2, '0')}
                    </Text>
                  </View>
                ))}
              </Animated.View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
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
  // 底部按钮容器
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    gap: 15,
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
    // backgroundColor: 'rgba(255, 255, 255, 0.2)',
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

  // 中奖播报区域
  luckyRollBroadcast: {
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
    height: 200,
  },
  // 播报标题容器
  broadcastTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  // 单条线
  singleLine: {
    height: 2,
    width: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  // 装饰线条包装器
  decorativeLineWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  // 装饰线条片段
  decorativeLineSegment: {
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 1)',
  },
  // 装饰线条（旧的，保留以防需要）
  decorativeLine: {
    height: 2,
    width: 20,
    backgroundColor: 'rgba(255, 165, 0, 0.8)',
    borderRadius: 1,
    shadowColor: 'rgba(255, 165, 0, 0.6)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  // 播报标题文字
  broadcastTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'rgb(228, 207, 186)',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },

  // 消息滚动容器
  broadcastMessagesContainer: {
    marginTop: 15,
    flex: 1,
    height: 120, // 固定高度，显示3条消息
    overflow: 'hidden', // 隐藏超出部分
  },
  // 单条播报消息项
  broadcastMessageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 5,
    height: 40, // 固定每项高度
  },
  // 左侧内容容器
  broadcastLeftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  // 烟花emoji
  broadcastEmoji: {
    fontSize: 16,
    marginRight: 6,
    flexShrink: 0,
  },
  // 标签文字（恭喜、抽中）
  broadcastLabel: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '400',
    flexShrink: 0,
  },
  // 用户名
  broadcastUsername: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    maxWidth: 50,
    flexShrink: 0,
  },
  // 奖品名称
  broadcastPrizeName: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    maxWidth: 100,
  },
  // 日期
  broadcastDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '400',
    marginLeft: 8,
    width: 80,
    textAlign: 'right',
    flexShrink: 0,
  },
  // 单条播报消息（旧的，保留）
  broadcastMessage: {
    marginRight: 30,
  },
  // 播报消息文字（旧的，保留）
  broadcastMessageText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
});
