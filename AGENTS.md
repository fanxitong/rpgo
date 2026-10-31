# rpgo 项目开发指南

> 本文件为 AI 编程助手提供项目上下文和开发规范。

## 项目信息

- 项目名称: rpgo ,基于 mygo 框架的低代码游戏编辑器。
- 采用 vue 全家桶 + mygo 实现

### 项目结构

```
rpgo/
├── .agents/                            # agent目录
│   ├── mygo-maintenance/               # mygo项目维护;无需修改
│   └── rpgo/                           # rpgo项目维护
├── .vscode/                            # vscode配置文件
├── public/                             # 公开的项目资源目录,如图标
├── resources/                          # 资源目录
│   ├── audio/                          # 音效
│   ├── data/                           # 数据
│   ├── fonts/                          # 字体
│   ├── icon/                           # 图标
│   ├── img/                            # 图形图像
│   ├── js/                             # js框架
│   ├── movies/                         # 视频
│   └── save/                           # 存档
├── src/                                # 项目源码
│   ├── assets/                         # 内部资源,如css、scss、svg等
│   ├── componens/                      # 组件目录
│   ├── __tests__/                      # 测试工具和共享测试
│   └── _util/                          # 共享工具函数库
├── router/                             # 路由
├── stores/                             # 状态管理
├── views/                              # 视图
├── docs/                               # 站点文档
├── changelogs                          # 更新日志文件夹
│   ├── CHANGELOG.zh-CN.md              # 中文更新日志
│   └── CHANGELOG.en-US.md              # 英文更新日志
├── App.vue                             # Vue根组件
├── index.ts                            # Vue根
├── main.ts                             # go桌面应用入口
├── mygo.ts                             # Vue项目主
├── .gitattributes                      # git 换行符归一化
├── .gitignore                          # git 提交忽略清单
├── AGENTS.md                           # AI 编程助手的项目开发指南
├── go.mod                              # go 模块定义
├── go.sum                              # go 依赖的校验和清单
├── index.html                          # 前端入口页面
├── LICENSE                             # 开源许可证
├── main.go                             # 桌面应用入口
├── mygo.config.ts                      # 桌面应用的打包配置
├── package.json                        # 定义脚本和依赖
├── .editorconfig                       # 编辑器代码格式统一配置
├── .oxlintrc.json                      # oxlint 静态检查配置
├── .prettierrc.json                    # Prettier 格式化规则
├── bun.lock                            # bun 依赖管理
├── README.md                           # 项目说明
├── tsconfig.json                       # typescript 解决方案的"总入口"
├── env.d.ts                            # 引用 vite/client 类型
├── tsconfig.app.json                   # 前端代码的 typescript 配置
├── tsconfig.node.json                  # nodejs 侧代码的 typescript 配置
├── vite.config.ts                      # vite 配置
└── vitest.config.ts                    # vitest 配置
```

---

## 通用编码规范

### 前端组件

位于`src/components`和`src/views`下的文件,均以帕斯卡命名法命名。并且其结构如下:

```
components/
└── <ComponentName>/                    # 组件名
    ├── <ComponentName>Component.vue/   # 组件实现,含css导入及vue部分操作
    ├── <ComponentName>Component.css/   # 组件样式实现(若组件样式足够简单,则该项为可选)
    ├── <ComponentName>.ts/             # 组件中的逻辑部分(若组件逻辑足够简单,则该项为可选)
    └── index.ts/                       # 导出组件
```

```
views/
└── <ViewName>/                         # 视图名
    ├── <ViewName>Component.vue/        # 视图实现,含css导入及vue部分操作
    ├── <ViewName>Component.css/        # 视图样式实现(若视图样式足够简单,则该项为可选)
    ├── <ViewName>.ts/                  # 视图中的逻辑部分(若视图逻辑足够简单,则该项为可选)
    └── index.ts/                       # 导出视图
```

## 样式优先级规范

---

## Demo 导入规范

## Test 导入规范

---

## 文档规范

### API 表格格式

### 文档锚点 ID 规范

### 国际化规范

---

## PR 规范

### 标题与内容

- PR 标题始终使用英文，格式：`类型: 简短描述`
- PR 内容默认使用英文，可根据用户语言习惯决定使用中文或英文
- 示例：`fix: fix xxx issues in editor`

### PR 模板（必须使用）

- 英文模板：`.github/PULL_REQUEST_TEMPLATE.md`
- 中文模板：`.github/PULL_REQUEST_TEMPLATE_CN.md`
- 使用 `gh pr create` 创建 PR 时，必须手动填充模板内容

### 分支策略

- 新特性开发需基于 `feature` 分支，PR 目标分支也需为 `feature`
- 其余提交至 `master` 分支
- 当前 PR 的目标分支为 `master` 时，必须先基于最新的 `feature` 分支进行一次模拟合并，检查是否存在冲突；若存在冲突，则改为合并到 `feature`，并解决所有冲突后完成合并；若无冲突，继续合并到 `master`。
- PR 的原目标分支为 `master` 时，若需更改目标分支为 `feature` 或 `next`，必须先对 PR 源分支进行 rebase 清理，仅将当前 PR 的相关提交重放到新目标分支的最新版本上，保持提交历史干净；不得带入 `master` 上与当前 PR 无关的他人提交或改动。清理后需检查相对新目标分支的提交列表和 diff，确认仅包含当前 PR 的预期改动。
- 分支命名规范：
  - 功能开发：`feat/description-of-feature`
  - 问题修复：`fix/issue-number-or-description`
  - 文档更新：`docs/what-is-changed`
  - 代码重构：`refactor/what-is-changed`

### PR 改动类型

- 🆕 新特性提交
- 🐞 Bug 修复
- 📝 文档改进
- 📽️ 演示代码改进
- 💄 样式/交互改进
- 🤖 TypeScript 更新
- 📦 包体积优化
- ⚡️ 性能优化
- 🌐 国际化改进

---

## Changelog 规范

### 适用范围

- 本节仅适用于用户明确要求收集/生成 changelog、准备 release PR、版本发布，或正在编辑 `CHANGELOG.en-US.md` / `CHANGELOG.zh-CN.md` 的场景。
- 普通功能、修复、文档、demo PR 不要求直接修改 `CHANGELOG.en-US.md` / `CHANGELOG.zh-CN.md`；代码 CR 时也不应仅因缺少 CHANGELOG 文件改动而提出 finding。
- 普通 PR 如需填写 PR 模板中的 Change Log，仅描述本 PR 对用户或开发者的影响，或按模板填写 `N/A` / `No changelog required` / `无需更新日志`。正式 CHANGELOG 由 release owner 在发布流程中统一整理。

### 核心原则

- 文件位置：`CHANGELOG.en-US.md` 和 `CHANGELOG.zh-CN.md`
- 必须同时提供中英文两个版本
- 忽略用户无感知的改动（内部重构、纯测试更新、工具链优化等）
- 描述"用户或开发者能感知到的变化"，而非"具体的实现细节"；不要用"传递某配置"、"修改 runtime"、"增加 metadata"等内部实现视角代替效果描述
- 涉及 Design Token 时，必须列出具体新增、修复或变更的 token 名称
- `rc-component` 或其他运行时依赖升级默认不作为 changelog；但如果带来用户可感知能力、行为变化、类型定义改进或包体积收益，必须单独核查并描述影响
- 尽量给出 PR 链接，并统一添加贡献者链接

### 格式规范

#### 条目格式

- **Emoji 置顶**：每条以 Emoji 开头
- **不加冒号**：组件名后不使用英文冒号
- **每条必含组件名**：正文必须出现对应组件名
- **组件名不用反引号**：Modal、Button 等；属性名/API 用反引号
- **中英空格**：中文与英文、数字、链接之间保留一个空格

#### 句式

| 语言 | 格式                                 | 示例                                                     |
| ---- | ------------------------------------ | -------------------------------------------------------- |
| 中文 | `Emoji 动词 组件名 描述`（动词在前） | `🐞 修复 Button 在暗色主题下 \`color\` 的问题。`         |
| 英文 | `Emoji 动词 组件名 描述`（动词在前） | `🐞 Fix Button reversed \`hover\` colors in dark theme.` |

#### 分组逻辑

- 同一组件最终有 2 条以上有效改动时，使用 `- 组件名` 作为分类标题
- 单项改动直接写单行条目
- **严格禁止只有 1 条有效 changelog 的组件单独分组**：过滤、合并、移动到 Icon/跨组件分类或其他分类后，必须重新统计各组件有效条目数；最终只有 1 条的组件必须拆回顶层单行条目
- 发布版本 changelog 要按影响排序：最重要的跨版本变化放最前；同为组件分组时，条目多的组件优先

### Emoji 规范

| Emoji  | 用途                   |
| ------ | ---------------------- |
| 🐞     | 修复 Bug               |
| 💄     | 样式更新或 token 更新  |
| 🆕     | 新增特性 / 新增属性    |
| 🔥     | 极其值得关注的新增特性 |
| 🇺🇸🇨🇳🇬🇧 | 国际化改动             |
| 📖 📝  | 文档或网站改进         |
| ✅     | 新增或更新测试用例     |
| 🛎      | 更新警告/提示信息      |
| ⌨️ ♿  | 可访问性增强           |
| 🗑      | 废弃或移除             |
| 🛠      | 重构或工具链优化       |
| ⚡️     | 性能提升               |

每条 Changelog 仅选择一个 Emoji，不要在同一条目中叠加多个 Emoji。

编写 Changelog 时，请参考 `CHANGELOG.zh-CN.md` 和 `CHANGELOG.en-US.md` 中已有条目的格式。

---

## 参考资源

---

## 编码行为准则

旨在减少 LLM 编码中常见错误的行为准则，可与项目特定指令合并使用。

**权衡：** 本准则倾向于"谨慎优于速度"。对于简单任务，请自行判断。

### 1. 先思考再编码

**"不要假设。不要隐藏困惑。呈现权衡。"**

实现之前：

- 明确陈述假设；如果不确定，就提问。
- 当存在多种理解时，逐一列出而非默默选择。
- 如果存在更简单的方案，直接说明并在必要时提出异议。
- 如果有不明白的地方，停下来指出困惑之处，然后提问。

### 2. 简洁优先

**"用最少的代码解决问题。不做臆测性编码。"**

- 不实现超出需求的特性。
- 不为仅使用一次的代码做抽象。
- 不添加未经要求的"灵活性"或"可配置性"。
- 不处理不可能发生的错误场景。
- 如果你写了 200 行但 50 行就够了，那就重写。

问问自己："资深工程师会觉得这过于复杂吗？" 如果是，就简化。

### 3. 精准改动

**"只改必须改的。只清理自己制造的遗留。"**

编辑现有代码时：

- 不要"改善"相邻的代码、注释或格式。
- 不要重构没有问题的代码。
- 即使你习惯不同写法，也要与现有风格保持一致。
- 如果发现无关的废弃代码，提出来而不是直接删除。

当你的改动产生了孤立的代码时：

- 移除因你的改动而变得未使用的 import/变量/函数。
- 不要移除之前就存在的废弃代码，除非被明确要求。

检验标准："每一行改动都应该能追溯到用户的请求。"

### 4. 目标驱动执行

**"定义成功标准。循环验证直到通过。"**

将任务转化为可验证的目标：

- "添加校验" → 为无效输入编写测试，然后使其通过
- "修复 Bug" → 编写复现测试，然后使其通过
- "重构 X" → 确保重构前后测试都通过

对于多步骤任务，简要列出计划：

```
1. [步骤] → 验证：[检查方式]
2. [步骤] → 验证：[检查方式]
3. [步骤] → 验证：[检查方式]
```

"明确的成功标准让你可以独立循环迭代。" 模糊的标准如"让它能用"则需要不断确认。

---

**"以下情况说明本准则生效："** diff 中不必要的改动减少，因过度复杂导致的重写减少，澄清问题发生在实现之前而非犯错之后。
