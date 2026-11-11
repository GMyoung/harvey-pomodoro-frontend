# Chicago Health Leaders 人物简报网站

2026-11-11：在现有 `GMyoung/harvey-pomodoro-frontend` 仓库新增独立静态子页面。选择依据为该仓库此前最后推送于 2025-09-02，且尚未配置 GitHub Pages。原有番茄钟应用保持独立。

## 当前版本

2026-11-11：按用户要求改为极简英文版。双列紧凑联系人卡片、缩小照片与标题、短段落；白色、浅灰绿、医疗青绿配色取自现有 Labor Force Referral Navigator（#087d74 / #f2f7f6 / #102c32）。24 个既有来源折叠保留，详细中文研究资料只保留在 research 文件夹，不显示在页面。

## 文件与运行

- `docs/chicago-health-leaders/index.html`：精简英文人物简介、合作观察、关键新闻与折叠来源。
- `docs/chicago-health-leaders/styles.css`：响应式样式，无第三方运行依赖。
- `docs/chicago-health-leaders/assets/`：两张官方人物照及用户提供的原始参观照片。
- `docs/index.html`：静态入口，跳转至人物子页面。
- `research/tim.md`、`research/boyd.md`：公开事实与来源对应资料。

无需 npm 安装或构建。直接打开 HTML 可阅读；需要本地 HTTP 预览时，在仓库执行 `python -m http.server 4186 --directory docs`，访问 `http://localhost:4186/chicago-health-leaders/`。

GitHub Pages 使用 `main` 分支 `/docs` 目录；提交并推送该目录即可更新。请勿改变原有应用环境文件、依赖或入口。

## 认证与隐私

该静态页不需要 API key、环境变量、后台、登录或数据库。发布使用现有 GitHub 身份；记录由 Google Drive 连接器处理认证，凭据不写入源文件或工具记录。

页面是公开的 GitHub Pages 网站。`noindex` 仅请求搜索引擎不索引，不提供访问控制。参观照片由用户授权加入。页面未配置分析追踪或第三方字体。官方头像保留机构/摄影师署名；不声称这些照片具有开放许可。

## 内容维护

公开事实与 Harvey 的主观合作观察分开。不要把“喜欢新闻”“合作谨慎”等观察升级为客观人格判断或保证合作。第三位联系人的身份仅可根据用户提供的姓名、名片或接待方确认更新，不根据人脸猜测身份。

更新时核实职位与近期机构状况，保留日期和直接来源。Tim 的 2026 年医院重组、分娩服务变化及调查报道必须准确区分报道、回应与法律结论。Boyd 的 SOURCE 资助额是上限，不能写成全部到账；旧页面“副教授”称谓已由当前教授称谓替代。

功能验证交给用户手动进行；维护者只做必需的静态文件、语法、保存与发布状态读回。不得创建测试用户或执行自动浏览器流程。

## 工具记录

同一工具的后续更新继续维护同一 Google Doc 与 `E:\CodeX\tool-records\index.json`，不要创建重复文档。

Google Doc：https://docs.google.com/document/d/1ivMfhh_D8hQ_1yfdsNvvojfvFg4XXGLpSwqlr82TUpQ/edit

## 图片来源

- Tim：R.E.A.C.H. 官方董事会人物照，https://www.reach4roseland.org/
- Andy：Jenny Fontaine / UIC，https://today.uic.edu/experts/andrew-boyd/
- 参观现场：Harvey 于 2026-11-11 在本次对话提供，原图保留。

2026-11-11 照片确认：Harvey 确认目标联系人是照片右侧穿深色西装、抬手讲解的男士。姓名、职务和所属机构仍未确认。
