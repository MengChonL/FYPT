# Challenges 组件说明文档

## 文件命名规则
所有挑战组件文件名前缀标注了其对应的关卡级别，格式为：`Level{X}-{Y}_ComponentName.jsx`

## 组件与关卡对应关系

### 关卡专用组件

| 文件名 | 对应关卡 | 挑战类型 | 说明 |
|--------|---------|---------|------|
| `Level1-1_PhishingChallenge.jsx` | Level 1-1 | phishing | 钓鱼邮件识别 + 授权陷阱（合并挑战） |
| `Level1-2_WalletTransferChallenge.jsx` | Level 1-2, 1-4, 2-2, 3-2, 4-2, 5-2, 6-2 | addressPoisoning (mode: wallet) | 钱包转账模式的地址投毒挑战 |
| `Level2-1_AddressPoisoningChallenge.jsx` | Level 2-1 | addressPoisoning | 传统地址投毒挑战（非钱包模式） |
| `Level2-4_GoogleSearchMetaMask.jsx` | Level 2-4 | phishing | Google 搜索钓鱼识别 |

### 通用组件

| 文件名 | 用途 |
|--------|------|
| `BrowserFrame.jsx` | 浏览器窗口框架组件 |
| `ChallengeTemplate.jsx` | 挑战页面模板组件 |

### 待删除组件

| 文件名 | 状态 | 说明 |
|--------|------|------|
| `ApprovalTrapChallenge.jsx` | 已删除 | 已合并到 `Level1-1_PhishingChallenge.jsx` |

## 路由配置

### 动态路由
所有挑战使用统一路由模式：`/challenge/:type/:id`

例如：
- `/challenge/phishing/level1-1` → Level1-1_PhishingChallenge
- `/challenge/addressPoisoning/level1-2` → Level1-2_WalletTransferChallenge
- `/challenge/addressPoisoning/level2-1` → Level2-1_AddressPoisoningChallenge
- `/challenge/phishing/level2-4` → Level2-4_GoogleSearchMetaMask

### 路由逻辑（ChallengePage.jsx）
```javascript
switch (type) {
  case 'addressPoisoning':
    if (config.mode === 'wallet') {
      return <Level1_2_WalletTransferChallenge config={config} />;
    }
    return <Level2_1_AddressPoisoningChallenge config={config} />;
  
  case 'phishing':
    return <Level1_1_PhishingChallenge config={config} />;
}
```

## 配置文件映射

所有挑战的配置数据存储在 `src/config/challenges-config.js`：

### addressPoisoning 类型
- `level1-2`: 獨徑無歧 (基础转账)
- `level1-4`: 眾跡分明 (多条记录)
- `level2-1`: 高级地址投毒识别
- `level2-2`: 末影惑流 (相似地址)
- `level3-2`: 雙影疊跡 (双重投毒 + 翻页)
- `level4-2`: 形淆眾流 (多个投毒地址)
- `level5-2`: 微跡藏真 (小额混淆)
- `level6-2`: 時限爭鋒 (90秒限时)

### phishing 类型
- `level1-1`: 钓鱼邮件识别 + 授权陷阱
- `level2-4`: Google 搜索钓鱼识别

### approvalTrap 类型
- `level1-1`: Solana 空投授权陷阱（已合并到 phishing/level1-1）

## 组件功能说明

### Level1-1_PhishingChallenge
**两阶段挑战：**
1. **阶段一（钓鱼邮件）**: 用户查看可疑的空投邮件
2. **阶段二（授权陷阱）**: 点击链接后显示 MetaMask 授权界面，用户需判断是否接受交易

**特点：**
- 使用 `view` 状态控制阶段切换
- 问题区域居中设计
- 包含教育内容和危险信号提示

### Level1-2_WalletTransferChallenge
**钱包转账模式：**
- 模拟真实钱包界面
- 显示交易历史记录
- 需要选择正确的网络、资产和地址
- 支持地址验证和投毒地址识别
- 支持翻页功能（Level 3+ 关卡）
- 支持时间限制（Level 6-2）

### Level2-1_AddressPoisoningChallenge
**传统地址投毒挑战：**
- 卡片式选择界面
- 显示两个相似地址
- 用户需选择正确的官方地址

### Level2-4_GoogleSearchMetaMask
**Google 搜索钓鱼：**
- 模拟 Google 搜索结果页面
- 显示官方网站和钓鱼网站
- 用户需识别真假 MetaMask 下载链接

## 开发注意事项

1. **添加新关卡**：
   - 在 `challenges-config.js` 中添加配置
   - 根据类型选择合适的组件（或创建新组件）
   - 在 `GamePage.jsx` 中添加路由导航
   - 新组件文件名需包含关卡标识

2. **修改现有关卡**：
   - 修改 `challenges-config.js` 中的配置数据
   - 组件会自动读取新配置

3. **组件复用**：
   - `Level1-2_WalletTransferChallenge` 被多个关卡复用
   - 通过配置数据控制不同难度和内容

4. **命名约定**：
   - 关卡组件：`Level{X}-{Y}_ComponentName.jsx`
   - 通用组件：直接使用功能名称
   - 导入变量名：使用下划线 `Level1_2_ComponentName`

## 更新历史

- **2024-10-21**: 
  - 合并 PhishingChallenge 和 ApprovalTrapChallenge 为 Level1-1
  - 所有关卡组件文件名添加关卡前缀
  - 更新所有导入路径
  - 创建本说明文档

