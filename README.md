# Circuit Hero

Circuit Hero 是一个故事驱动的电路学习互动网站原型。玩家通过章节地图进入任务介绍页，在工作台中拖拽电池、灯泡、开关并连线，理解闭合电路、开路、短路和开关控制等基础概念。

## 当前形态

- 技术形态：静态 HTML / CSS / JavaScript + 本地 Express API。
- 页面入口：`index.html`。
- 核心流程：首页 -> 登录 / 故事地图 -> 任务介绍 -> 工作台 -> 成功反馈。
- 当前可用关卡：`1-1`、`2-1`、`3-1`、`4-1`。
- 当前可用模式：故事地图、关卡工作台、沙盒实验室。

## 目录结构

```text
assets/              静态图片与图标
css/                 通用样式、页面样式、设计变量
data/                本地 SQLite 数据库文件，运行后生成
docs/                数据结构、后端接口等说明
js/components/       轻量组件逻辑
js/data/             关卡配置与进度状态逻辑
js/game/             工作台核心玩法逻辑
js/pages/            页面入口脚本
server/              Express API 与 SQLite 初始化
tests/               零依赖测试脚本
```

## 本地运行

首次运行先安装依赖：

```powershell
npm install
```

启动本地后端和静态资源服务：

```powershell
npm start
```

默认地址：

```text
http://127.0.0.1:3000
```

如果直接打开 HTML 文件，页面仍能显示，但登录注册和后端进度同步需要通过 `npm start` 提供的本地服务访问。

## 验证

运行完整验证：

```powershell
npm test
```

运行浏览器端流程验证：

```powershell
npm run test:e2e
```

`test:e2e` 需要先有本地服务运行，或通过测试 helper 临时启动服务。

## 后续重点

1. 稳定已有学习闭环：关卡存在性、按关卡计时、按关卡提示、星级保存、地图解锁。
2. 在不新增视觉稿外页面的前提下，补齐当前地图已经展示的关卡配置或锁定未完成关卡。
3. 扩展更多关卡前，先保证 `LevelConfig`、地图状态和进度保存规则一致。
