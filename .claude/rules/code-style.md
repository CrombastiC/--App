# 移动端设计规范

本文档统一 OrderFoodApp 移动端的设计规范，包括色彩、字体、间距、阴影、布局等。

---

## 1. 设计原则

- **Material Design 3** 为底层设计语言，使用 React Native Paper 组件库
- **餐厅氛围** 为核心视觉方向，以暖色调（橙/棕）为主
- **一致性** 优先，相同场景复用统一 token，避免随意写死颜色/尺寸
- 所有样式使用 `StyleSheet.create` 定义，禁止内联样式（极短临时样式除外）

---

## 2. 色彩系统

### 2.1 主题色（Brand Colors）

| Token | 色值 | 用途 |
|-------|------|------|
| `primary` | `#FF7214` | 主色调：按钮、选中态、Tab 激活、强调文字 |
| `primaryLight` | `#FFCDA6` | 主色浅变体：边框高亮、hover 背景 |
| `primaryBg` | `#FFF5F0` | 主色极浅背景：卡片选中态、表单聚焦背景 |
| `background` | `#F6EAE3` | 全局页面背景：营造温暖餐厅氛围 |
| `surface` | `#FFFFFF` | 卡片/浮层面板背景 |

### 2.2 语义色（Semantic Colors）

| Token | 色值 | 用途 |
|-------|------|------|
| `success` | `#4ECDC4` | 成功、积分、正向操作 |
| `member` | `#9B59B6` | 会员、VIP 相关 |
| `warning` | `#FF6B35` | 警告、提示（比主色略深） |
| `danger` | `#D32F2F` | 错误、删除、充值须知警示 |

### 2.3 文字色（Text Colors）

| Token | 色值 | 用途 |
|-------|------|------|
| `textPrimary` | `#333333` | 主标题、正文 |
| `textSecondary` | `#666666` | 次要说明、副标题 |
| `textTertiary` | `#999999` | 占位文字、禁用态、时间戳 |
| `textOnPrimary` | `#FFFFFF` | 主色背景上的文字 |
| `textLink` | `#356BFF` | 链接文字（蓝色） |

### 2.4 背景与边框

| Token | 色值 | 用途 |
|-------|------|------|
| `bgPage` | `#F6EAE3` | 页面底层背景 |
| `bgCard` | `#FFFFFF` | 卡片背景 |
| `bgCardTransparent` | `rgba(255, 255, 255, 0.9)` | 半透明卡片（认证页等） |
| `bgInput` | `#F5F5F5` / `#F5F7F7` | 输入框背景 |
| `border` | `#E8E8E8` | 分割线、边框 |
| `overlay` | `rgba(0, 0, 0, 0.5)` | 遮罩层 |

### 2.5 使用方式

**推荐**：在 `constants/theme.ts` 中定义 token，页面中引用：

```ts
import { Colors } from '@/constants/theme';

const styles = StyleSheet.create({
  container: { backgroundColor: Colors.bgPage },
  button: { backgroundColor: Colors.primary },
  title: { color: Colors.textPrimary },
});
```

**禁止**：在代码中直接写死色值（如 `#FF7214`），应使用 token。

---

## 3. 字体系统

### 3.1 字号层级

| Token | 尺寸 | 用途 |
|-------|------|------|
| `display` | 36px | 大金额、启动页大标题 |
| `h1` | 24px | 页面主标题、充值成功金额 |
| `h2` | 18px | 模块标题、卡片标题 |
| `h3` | 16px | 列表标题、按钮文字、表单标签 |
| `body` | 14px | 正文、描述、列表项 |
| `caption` | 12px | 辅助说明、时间戳、标签 |

### 3.2 字重

| Token | 值 | 用途 |
|-------|-----|------|
| `normal` | `'400'` | 正文 |
| `medium` | `'500'` | 列表项、按钮 |
| `semibold` | `'600'` | 标题、金额 |
| `bold` | `'700'` | 页面大标题、强调 |

### 3.3 行高

- 标题：字号的 1.3 倍
- 正文：字号的 1.5 倍
- 按钮文字：固定与按钮等高（垂直居中）

---

## 4. 间距系统

以 **8px** 为基准单位：

| Token | 值 | 用途 |
|-------|-----|------|
| `xs` | 4px | 紧凑间距、图标与文字间隙 |
| `sm` | 8px | 组件内部 padding、列表项间距 |
| `md` | 16px | 卡片内边距、表单字段间距 |
| `lg` | 24px | 模块间距、页面水平边距 |
| `xl` | 32px | 大模块间隔、底部安全区 |
| `xxl` | 48px | 页面顶部间距、大留白 |

**规则**：
- 页面水平边距统一为 `16px`（md）
- 卡片内边距统一为 `16px`（md）
- 相邻组件间距优先使用 `8px`（sm）或 `16px`（md）
- 避免使用奇数间距（如 7px、13px）

---

## 5. 圆角系统

| Token | 值 | 用途 |
|-------|-----|------|
| `none` | 0 | 全宽分割线、直角卡片（极少用） |
| `sm` | 4px | 小标签、小按钮 |
| `md` | 8px | 输入框、小卡片、列表项 |
| `lg` | 12px | 普通卡片、按钮 |
| `xl` | 16px | 大卡片、模态框 |
| `xxl` | 20px | 底部弹窗、特殊卡片 |
| `full` | 9999px | 圆形头像、胶囊按钮 |

---

## 6. 阴影与 elevation

### 6.1 卡片阴影（通用）

```ts
shadowColor: '#000',
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.08,
shadowRadius: 8,
elevation: 3,          // Android
```

### 6.2 浮层阴影（弹窗/浮层）

```ts
shadowColor: '#000',
shadowOffset: { width: 0, height: 4 },
shadowOpacity: 0.15,
shadowRadius: 12,
elevation: 5,          // Android
```

### 6.3 强调阴影（选中态/悬浮按钮）

```ts
shadowColor: '#FF7214',
shadowOffset: { width: 0, height: 4 },
shadowOpacity: 0.25,
shadowRadius: 12,
elevation: 4,          // Android
```

---

## 7. 布局规范

### 7.1 页面结构

```
[StatusBar]
[Header / 导航栏]     — 高度 56px，背景透明或 surface
[Content 区域]        — 可滚动，paddingHorizontal: 16
[Bottom 操作栏]       — 固定底部，高度自适应（按钮 + 安全区）
```

### 7.2 安全区

使用 `react-native-safe-area-context` 处理刘海屏/手势条：
- 顶部：`useSafeAreaInsets().top`
- 底部：`useSafeAreaInsets().bottom` + 16px 额外间距

### 7.3 列表规范

- 优先使用 `FlatList`，禁止直接 `map` 渲染长列表
- 列表项高度固定，避免动态计算
- 分割线：高度 1px，颜色 `border`

---

## 8. 按钮规范

### 8.1 主按钮（Primary）

```ts
backgroundColor: Colors.primary,
borderRadius: BorderRadius.lg,
paddingVertical: 12,
paddingHorizontal: 24,
```

- 文字颜色：`textOnPrimary`
- 禁用态：`opacity: 0.5` 或 `backgroundColor: Colors.primaryLight`
- 圆角：`12px`（lg）

### 8.2 次要按钮（Secondary）

```ts
backgroundColor: Colors.surface,
borderWidth: 1,
borderColor: Colors.primary,
borderRadius: BorderRadius.lg,
```

- 文字颜色：`primary`

### 8.3 文字按钮（Text）

- 无背景，文字颜色 `primary`
- 点击区域扩大至 `44x44` 以上

---

## 9. 输入框规范

```ts
backgroundColor: Colors.bgInput,
borderRadius: BorderRadius.md,
paddingHorizontal: Spacing.md,
paddingVertical: Spacing.sm,
fontSize: FontSize.body,
color: Colors.textPrimary,
```

- 聚焦态：边框 `primary` 或 `primaryLight`
- 错误态：边框 `danger`
- 占位符颜色：`textTertiary`

---

## 10. 图标规范

- 图标库：MaterialCommunityIcons（`@expo/vector-icons`）
- 默认尺寸：`24px`
- 颜色跟随上下文：Tab 未选中 `textTertiary`，选中 `primary`
- 品牌 Logo：`silverware-fork-knife`

---

## 11. 图片规范

- 菜品图片：统一比例 `1:1` 或 `4:3`，圆角 `md`
- 头像图片：`64x64`，圆角 `full`（圆形）
- 背景图片：`cooker.png` 用于认证页等场景
- 网络图片：必须带 `resizeMode` 和备用占位图

---

## 12. 动画规范

- 页面转场：使用 Expo Router 默认转场
- 按钮点击：React Native Paper 自带 ripple 效果
- Toast 显示：淡入淡出，时长 200ms
- 列表加载：骨架屏优先，避免白屏闪烁

---

## 13. 暗色模式（预留）

当前项目以浅色模式为主。若后续支持暗色模式：

| Token | 亮色 | 暗色 |
|-------|------|------|
| `bgPage` | `#F6EAE3` | `#1A1512` |
| `bgCard` | `#FFFFFF` | `#2A2522` |
| `textPrimary` | `#333333` | `#ECEAE8` |
| `textSecondary` | `#666666` | `#A09D9A` |

通过 `useColorScheme` 动态切换。

---

## 14. 禁止事项

- 禁止在代码中直接写死色值（应使用 theme token）
- 禁止直接使用 `margin`/`padding` 的奇数值（应使用 spacing token）
- 禁止内联样式对象（应使用 `StyleSheet.create`）
- 禁止在列表中使用 `.map()` 渲染（应使用 `FlatList`）
- 禁止随意添加新的颜色，优先复用现有 token
