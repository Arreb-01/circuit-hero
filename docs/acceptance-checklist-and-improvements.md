# Circuit Hero — 验收清单与改进计划

> 审计日期：2026-05-20
> 审计范围：全部 6 个 HTML 页面、20+ JS 模块、11 个 CSS 文件、服务端代码、测试套件、静态资源

---

## 一、验收清单

### A. 核心流程（用户路径）

| # | 检查项 | 状态 | 说明 |
|---|--------|------|------|
| A1 | 首页加载与渲染 | PASS | 所有 CSS/JS/图片资源引用正确，无 404 |
| A2 | 首页 → 登录页导航 | PASS | index.html 3 处链接指向 login.html |
| A3 | 首页 → Try Demo → 1-1 工作台 | PASS | `?level=1-1` 参数正确传递 |
| A4 | 登录/注册表单 | PASS | 表单 DOM 完整，login.js 处理提交 |
| A5 | 登录 → 故事地图 | PASS | 登录成功后跳转 story-map.html |
| A6 | 故事地图关卡节点 | PASS | 6 个章节节点均存在，`data-chapter` 正确 |
| A7 | 地图解锁逻辑 | PASS | Ch.1 默认解锁，Ch.N 需 Ch.(N-1) 通关 |
| A8 | 地图 → 任务介绍 | PASS | 点击节点跳转 `mission-briefing.html?chapter=N&level=N-1` |
| A9 | 任务介绍页动态内容 | PASS | 标题/场景/对话/目标/零件均从 LevelConfig 读取 |
| A10 | 任务介绍 → 工作台 | PASS | Start Building 按钮正确链接到 workbench |
| A11 | 工作台电池预置 | PASS | 所有 6 关 + 沙盒均正确预置电池 |
| A12 | 元件拖拽系统 | PASS | drag-drop.js + grid.js 协同工作 |
| A13 | 连线系统 | PASS | wiring.js 端口点击→贝塞尔曲线绘制 |
| A14 | 开关切换 | PASS | 点击切换 ON/OFF，视觉状态更新 |
| A15 | 通电测试（Power On） | PASS | CircuitEngine.evaluate 正确判定闭合/开路/短路 |
| A16 | 成功反馈 | PASS | 粒子动画 + 灯泡发光 + 星级评分 + 知识卡片 |
| A17 | 进度保存 | PASS | localStorage + 后端 API 双通道保存 |
| A18 | 沙盒模式 | PASS | 自由搭建 / 保存 / 加载 / 分享链接 |
| A19 | 教程仅 1-1 触发 | PASS（已修复） | Tutorial + OnboardingGuide 已限制为 level 1-1 |
| A20 | 撤销/重做 | PASS | Ctrl+Z / Ctrl+Y，UndoRedo 栈管理正确 |

### B. 关卡引擎验证

| # | 关卡 | 类型 | 测试覆盖 | 状态 |
|---|------|------|----------|------|
| B1 | 1-1 First Light | closed × 1 bulb | 有测试 | PASS |
| B2 | 2-1 Light Switch | closed × 1 bulb + 1 switch | 有测试（开/关/闭合） | PASS |
| B3 | 3-1 Two Lights | series × 2 bulbs | 有测试 | PASS（但有精度问题，见改进项） |
| B4 | 4-1 Branching Lights | parallel × 2 bulbs | 有测试 | PASS |
| B5 | 5-1 House Wiring | houseWiring × 3 bulbs + 3 switches | 有测试 | PASS |
| B6 | 6-1 The Dark Theater | theaterWiring × 5 bulbs + 3 switches | 有测试 | PASS |
| B7 | 沙盒 | closed × 1 bulb | 有测试 | PASS |

### C. 技术基础设施

| # | 检查项 | 状态 | 说明 |
|---|--------|------|------|
| C1 | npm test 全部通过 | PASS | 8 个测试套件，0 失败 |
| C2 | 资源文件完整性 | PASS | 所有 16 个被引用的图标/图片文件均存在 |
| C3 | 关卡配置完整性 | PASS | 7 个关卡配置均包含必要字段 |
| C4 | Script 加载顺序 | PASS | 依赖关系正确（数据层→游戏层→页面脚本） |
| C5 | workbench.html DOM ID 匹配 | PASS | workbench.js 引用的所有 ID 均存在于 HTML |
| C6 | 后端 API 端点 | PASS | 注册/登录/进度保存/进度读取均可用 |
| C7 | SQL 参数化查询 | PASS | 所有查询使用占位符，无注入风险 |
| C8 | 密码加密 | PASS | bcryptjs + salt=10 |

---

## 二、需要改进的内容

### 严重程度：CRITICAL（影响核心体验）

| # | 问题 | 文件 | 说明 |
|---|------|------|------|
| I-01 | 3-1 串联验证不严格 | `circuit-engine.js` | `series` 类型没有专用验证分支，走的是与 `closed` 相同的 BFS 通用逻辑。某些非串联拓扑也能通过验证。需要增加串联专用检查：确认所有灯泡在同一条路径上 |
| I-02 | 提示系统 3-1~6-1 无针对性 | `workbench.js:652-671` | `onHint()` 仅对 2-1 有特殊处理，3-1~6-1 使用通用文本"through the bulb"（单数），对串联/并联/混合电路有误导性 |
| I-03 | 响应式布局缺失 | 多个 HTML + CSS | 工作台、任务介绍、故事地图使用硬编码 `padding: 0 400px` 等内联样式，在小屏设备上严重溢出。无任何 `@media` 断点 |

### 严重程度：MEDIUM（功能缺陷或安全隐患）

| # | 问题 | 文件 | 说明 |
|---|------|------|------|
| I-04 | OnboardingGuide 未加载到 workbench.html | `workbench.html` | 缺少 `<script src="js/components/onboarding-guide.js">`，导致 `markComplete()` 永远不被调用，localStorage 中 onboarding 状态残留 |
| I-05 | 元件数量徽标不更新 | `workbench.js` + `drag-drop.js` | `hasReachedLimit()` 正确阻止超量拖拽，但零件面板的"x2"徽标在放置/删除后不更新，视觉误导 |
| I-06 | 远程进度覆盖本地进度 | `progress-store.js:61-68` | `loadRemoteProgress` 直接替换本地数据，无合并逻辑。离线完成的关卡可能被旧远程数据覆盖 |
| I-07 | 远程同步错误被静默吞掉 | `progress-store.js:71-83` | API 同步失败时用户无任何反馈 |
| I-08 | 沙盒完成后可能崩溃 | `success-feedback.js:102` | 沙盒模式无 `config.success` 对象，`Feedback.showSuccess` 访问 `config.success.dialogue` 时会抛出 TypeError（虽然正常流程沙盒走 `onSandboxPowered`，不经过 `showSuccess`） |
| I-09 | Feedback DOM 空指针风险 | `success-feedback.js:7-9` | 若 `init()` 未在 DOM ready 后调用，`sparkyText` 等为 null，`showSparky` 崩溃 |
| I-10 | 沙盒模态框样式缺失 | `css/components.css` | `workbench.js` 动态创建 `.modal-card`、`.modal-body`、`.modal-footer`，但 CSS 中无对应样式定义 |
| I-11 | 服务端 session 无过期机制 | `server/app.js:40` | session 存储在内存 Map 中，无 TTL、无清理，长时间运行导致内存泄漏 |
| I-12 | Session Cookie 缺少 Secure 标志 | `server/app.js:52` | HTTPS 部署时缺少 `Secure` 标志，中间人可截获 |
| I-13 | parseCookies 可被恶意输入触发异常 | `server/app.js:32` | `decodeURIComponent` 对畸形编码会抛出异常，缺少 try/catch |
| I-14 | 无全局错误处理中间件 | `server/app.js` | 未处理异常时 Express 返回 HTML 堆栈跟踪，泄露内部信息 |
| I-15 | bcrypt 同步调用阻塞事件循环 | `server/app.js:84,109` | `hashSync`/`compareSync` 每次调用阻塞约 100ms，并发场景下请求排队 |
| I-16 | playwright-core 放在 dependencies | `package.json` | 应为 devDependencies，避免生产环境安装 |
| I-17 | 缺少 Node.js 版本约束 | `package.json` | `node:sqlite` 需要 Node ≥ 22.5，但未在 `engines` 字段声明 |

### 严重程度：LOW（体验优化 / 代码质量）

| # | 问题 | 文件 | 说明 |
|---|------|------|------|
| I-18 | ProfileModel 仅检查 1-1~4-1 通关 | `profile-model.js:79,82` | 徽章/称号系统忽略 5-1 和 6-1，全通关用户无法获得完整认可 |
| I-19 | Tutorial.initHintsMode 死代码 | `tutorial.js:56-64` | 已定义但从未调用，也不在 return 对象中导出 |
| I-20 | 重复的开关状态函数 | `circuit-engine.js:232-242,306-314` | `getSwitchSnapshot`/`saveSwitchState` 功能完全相同，前者从未被调用 |
| I-21 | shareDesign 使用已废弃 API | `workbench.js:487` | `document.execCommand('copy')` 已废弃，应改用 `navigator.clipboard.writeText()` |
| I-22 | 沙盒设计无 localStorage 容量限制 | `workbench.js:209-227` | 无数量上限，超出配额时仅显示"Save failed."，无具体解释 |
| I-23 | 加载沙盒设计不清除 UndoRedo 栈 | `workbench.js:366-399` | 加载后撤销可能产生混淆状态 |
| I-24 | 连线绘制无法通过鼠标取消 | `wiring.js:144-149` | 只能通过 Escape 或点击同端口取消，点击空白处无效 |
| I-25 | distToSegment 死代码 | `wiring.js:258-267` | 已定义但从未调用 |
| I-26 | lang 属性与内容语言不符 | 所有 HTML | `lang="zh-CN"` 但页面内容为英文 |
| I-27 | placeholder 链接未实现 | 多个页面 | "For teachers"、"Accessibility"、"Privacy"、"Contact" 指向 `#` |
| I-28 | 图片文件大小写混合 | `assets/images/` | `living-room.PNG`、`theater.PNG` 使用大写扩展名，非 Windows 部署可能有大小写敏感问题 |
| I-29 | E2E 测试硬编码 Chrome 路径 | `tests/e2e-flow.js` | 不可移植，仅限 Windows |
| I-30 | 测试链式 && 无汇总输出 | `package.json` | 任一测试崩溃则后续测试静默跳过，无 pass/fail 汇总 |
| I-31 | 缺少 package-lock.json | 项目根目录 | 不同环境安装可能解析到不同版本 |

---

## 三、验收结论

### 可以交付的部分

- 首页 → 登录 → 地图 → 任务 → 工作台 的完整用户流程
- 6 个关卡的电路引擎判定（核心逻辑正确）
- 粒子动画、灯泡发光、成功反馈等视觉效果
- 进度保存与星级评分系统
- 沙盒自由实验模式
- 用户注册/登录后端 API
- 8 个单元测试全部通过

### 需要优先修复后再交付的内容

1. **I-01**（串联验证）和 **I-02**（提示系统）— 直接影响 3-1~6-1 的游戏体验
2. **I-03**（响应式布局）— 在小屏/平板上完全不可用
3. **I-04**（OnboardingGuide 缺失）— 影响新用户首次引导流程
4. **I-10**（沙盒模态框样式）— 沙盒保存/加载/分享的弹窗无样式

### 建议修复但不阻塞交付的内容

- 服务端安全问题（I-11~I-17）：本地演示可接受，上线前必须修复
- 代码质量清理（I-18~I-31）：可逐步迭代
