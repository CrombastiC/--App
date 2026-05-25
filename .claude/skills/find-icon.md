---
name: find-icon
description: Search MaterialCommunityIcons by keyword (Chinese or English). Returns matching icon names for use with react-native-paper's Icon component.
user_invocable: true
---

# Icon Search Skill

Search the MaterialCommunityIcons library for icons matching a keyword. Useful when you need to find the right icon name for `<Icon source="..." />` in react-native-paper.

## How to use

The user provides a search keyword (Chinese or English). Search the icon data file at `apps/mobile/json/MaterialCommunityIcons.json` — it's a JSON object where keys are icon names and values are unicode code points.

## Search strategy

1. **English keyword**: Filter icon names that contain the keyword (case-insensitive). E.g. `cart` matches `cart`, `cart-outline`, `cart-plus`, etc.
2. **Chinese keyword**: Map common Chinese terms to English equivalents, then search. Use these mappings:
   - 购物车/购物 → `cart`
   - 首页/主页 → `home`
   - 用户/个人/我的 → `account`
   - 订单/列表 → `clipboard` or `receipt`
   - 消息/通知 → `message` or `bell`
   - 设置 → `cog` or `settings`
   - 搜索 → `magnify` or `search`
   - 删除/垃圾 → `delete` or `trash`
   - 编辑/笔 → `pencil` or `edit`
   - 添加/加号 → `plus`
   - 减少/减号 → `minus`
   - 关闭/取消 → `close` or `cancel`
   - 返回/后退 → `arrow-left` or `chevron-left`
   - 分享 → `share`
   - 收藏/星星 → `star` or `heart`
   - 钱/支付 → `cash` or `currency` or `credit-card`
   - 食物/餐厅 → `food` or `silverware`
   - 位置/地图 → `map-marker` or `navigation`
   - 电话/联系 → `phone`
   - 图片/照片 → `image` or `camera`
   - 日历/日期 → `calendar`
   - 时钟/时间 → `clock`
   - 锁/安全 → `lock` or `shield`
   - 签到/打卡 → `calendar-check`
   - 积分/金币 → `coin` or `star`
   - 优惠券 → `ticket` or `tag`
   - 礼品/礼物 → `gift`
   - 会员/皇冠 → `crown` or `medal`
   - 任务/勾选 → `checkbox-marked` or `check-circle`
   - 客服/耳机 → `headphones` or `phone`
   - 发票 → `receipt` or `file-document`
   - 地址/定位 → `map-marker`
3. Return up to **20** best matches, sorted by relevance (exact prefix matches first, then contains matches).

## Output format

Return a markdown table with columns: Icon Name | Usage

Example:
| Icon Name | Usage |
|---|---|
| `cart-outline` | `<Icon source="cart-outline" size={24} />` |
| `cart-plus` | `<Icon source="cart-plus" size={24} />` |
