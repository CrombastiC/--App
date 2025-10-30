import { Dimensions, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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

export default function LuckyRollScreen() {
  return (
    <ImageBackground
      source={require('@/assets/images/rollBackground.png')}
      style={styles.container}
      resizeMode="stretch"
      imageStyle={styles.backgroundImage}
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
            <Text style={styles.pointsText}>当前积分: 100</Text>
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
          </View>
        </View>
        
        {/* 底部按钮区域 */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.singleDrawButton} onPress={() => handlePress('single')}>
            <Text style={styles.buttonText}>单抽</Text>
            <Text style={styles.buttonSubText}>💎 200</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.multiDrawButton} onPress={() => handlePress('multi')}>
            <Text style={styles.buttonText}>十连抽</Text>
            <Text style={styles.buttonSubText}>💎 2000</Text>
          </TouchableOpacity>
        </View>
      </View>
      </View>
    </ImageBackground>
  );
}

function handlePress(type: string) {
  // 抽奖逻辑待实现
  console.log(`${type === 'single' ? '单抽' : '十连抽'}按钮被点击`);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(44, 104, 255)', // 添加背景色，防止图片未覆盖区域显示空白
  },
  backgroundImage: {
    // 可以根据需要调整图片的位置和缩放
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
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
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
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
    color: '#333',
  },
  // 抽奖区域
  luckyRollContainer: {
    marginTop: 40,
    width: SCREEN_WIDTH * 0.9,
    backgroundColor: 'rgba(250, 214, 139)',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
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
  },
  // 按钮文字
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  // 按钮副文字（积分）
  buttonSubText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },
});
