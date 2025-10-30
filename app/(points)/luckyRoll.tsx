import { Dimensions, ImageBackground, StyleSheet, Text, View } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 圆的配置数据
const CIRCLE_SIZE = 12;
const CIRCLE_RADIUS = CIRCLE_SIZE / 2;
const EDGE_OFFSET = 3;

// 定义所有圆的位置和样式
const circles = [
  // 四个角的实心圆 - 橙色
  { type: 'solid', color: 'rgb(227, 120, 21)', top: 7, left: 7 },
  { type: 'solid', color: 'rgb(227, 120, 21)', top: 7, right: 7 },
  { type: 'solid', color: 'rgb(227, 120, 21)', bottom: 7, left: 7 },
  { type: 'solid', color: 'rgb(227, 120, 21)', bottom: 7, right: 7 },
  
  // 四条边中间的实心圆 - 浅色
  { type: 'solid', color: 'rgb(255, 247, 232)', top: EDGE_OFFSET, left: '50%' as const, marginLeft: -CIRCLE_RADIUS },
  { type: 'solid', color: 'rgb(255, 247, 232)', right: EDGE_OFFSET, top: '50%' as const, marginTop: -CIRCLE_RADIUS },
  { type: 'solid', color: 'rgb(255, 247, 232)', bottom: EDGE_OFFSET, left: '50%' as const, marginLeft: -CIRCLE_RADIUS },
  { type: 'solid', color: 'rgb(255, 247, 232)', left: EDGE_OFFSET, top: '50%' as const, marginTop: -CIRCLE_RADIUS },
  
  // 空心白色圆
  { type: 'hollow', top: EDGE_OFFSET, left: '25%' as const, marginLeft: -CIRCLE_RADIUS },
  { type: 'hollow', top: EDGE_OFFSET, left: '75%' as const, marginLeft: -CIRCLE_RADIUS },
  { type: 'hollow', right: EDGE_OFFSET, top: '25%' as const, marginTop: -CIRCLE_RADIUS },
  { type: 'hollow', right: EDGE_OFFSET, top: '75%' as const, marginTop: -CIRCLE_RADIUS },
  { type: 'hollow', bottom: EDGE_OFFSET, left: '75%' as const, marginLeft: -CIRCLE_RADIUS },
  { type: 'hollow', bottom: EDGE_OFFSET, left: '25%' as const, marginLeft: -CIRCLE_RADIUS },
  { type: 'hollow', left: EDGE_OFFSET, top: '75%' as const, marginTop: -CIRCLE_RADIUS },
  { type: 'hollow', left: EDGE_OFFSET, top: '25%' as const, marginTop: -CIRCLE_RADIUS },
];

export default function LuckyRollScreen() {
  return (
    <ImageBackground
      source={require('@/assets/images/rollBackground.png')}
      style={styles.container}
      resizeMode="stretch"
      imageStyle={styles.backgroundImage}
    >
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
        {/* 动态渲染所有圆 */}
        {circles.map((circle, index) => (
          <View
            key={index}
            style={[
              styles.circle,
              circle.type === 'hollow' ? styles.hollowCircle : { backgroundColor: circle.color },
              {
                top: circle.top,
                left: circle.left,
                right: circle.right,
                bottom: circle.bottom,
                marginLeft: circle.marginLeft,
                marginTop: circle.marginTop,
              },
            ]}
          />
        ))}

        {/* 抽奖九宫格 */}
        <View style={styles.luckyRollGrid}>
        
        </View>
        {/* 抽奖按钮 */}
        <View></View>
      </View>



    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(44, 104, 255)', // 添加背景色，防止图片未覆盖区域显示空白
  },
  backgroundImage: {
    // 可以根据需要调整图片的位置和缩放
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  titleContainer: {
    position: 'absolute',
    top: 60,
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
    height: SCREEN_WIDTH * 0.9,
    backgroundColor: 'rgba(250, 214, 139)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(252, 190, 102, 0.5)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // Android 阴影
  },
  luckyRollGrid: {
    width: '90%',
    height: '90%',
    backgroundColor: 'rgba(227, 120, 21, 0.9)',
    borderRadius: 15,
    // 其他样式待补充
  },
  // 通用圆样式
  circle: {
    position: 'absolute',
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_RADIUS,
  },
  // 空心圆样式
  hollowCircle: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#fff',
  },
});

function handlePress() {
  // 抽奖逻辑待实现
  console.log('参与抽奖按钮被点击');
}
