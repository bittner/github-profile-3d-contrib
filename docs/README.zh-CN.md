# Profile 3D Contrib

![svg](https://raw.githubusercontent.com/bittner/github-profile-3d-contrib/main/docs/demo/profile-gitblock-animate.svg)

<!-- 语言代码顺序（英语除外） -->
[English (en)](../README.md) |
[Deutsch (de)](README.de.md) |
[Español (es)](README.es.md) |
[Français (fr)](README.fr.md) |
[日本語 (ja)](README.ja.md) |
[한국어 (ko)](README.ko.md) |
[Português (pt-BR)](README.pt-br.md) |
[Português (pt)](README.pt.md) |
[Русский (ru)](README.ru.md) |
简体中文 (zh-CN) |
[繁體中文 (zh-TW)](README.zh-TW.md) |

> [!NOTE]
> 此翻译由机器翻译生成。
> 它可能包含错误或不自然的表达。
> 欢迎为改进翻译做出贡献！

## 概述

此 GitHub Action 会为您的个人资料图片生成 3D 贡献日历，将您在 GitHub 上的活动与在 GitLab 实例（如 gitlab.com）和 Forgejo/Gitea 实例（如 Codeberg）上的活动合并，按天以不同颜色堆叠显示。

它是 [yoshi389111/github-profile-3d-contrib](https://github.com/yoshi389111/github-profile-3d-contrib) 的分支（该项目仅支持 GitHub），并与其配置保持兼容。额外的设置请参见[外部来源](#外部来源)。

## 如何使用（GitHub Actions）- 基本

此 GitHub Action 会生成您的 GitHub 个人资料 3D 贡献日历并提交到您的仓库。
添加 GitHub Action 后，工作流会每天自动运行一次。
您也可以手动触发工作流。

### 步骤 1. 创建特殊的个人资料仓库

在 GitHub 上创建一个与您的用户名相同名称的仓库。

- 例如，如果用户名为 `octocat`，则创建名为 `octocat/octocat` 的仓库。
- 参考：[管理个人资料自述文件](https://docs.github.com/zh/account-and-profile/how-tos/setting-up-and-managing-your-github-profile/customizing-your-profile/managing-your-profile-readme)

在此仓库中，按照以下步骤操作。

### 步骤 2. 创建工作流文件

创建如下工作流文件。

- `.github/workflows/profile-3d.yml`

```yaml:.github/workflows/profile-3d.yml
name: Profile-3D-Contrib

on:
  schedule: # 03:00 JST == 18:00 UTC
    - cron: "0 18 * * *"
  workflow_dispatch:

permissions:
  contents: write

jobs:
  build:
    runs-on: ubuntu-latest
    name: generate-profile-3d-contrib
    steps:
      - uses: actions/checkout@v7
      - uses: bittner/github-profile-3d-contrib@main
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          USERNAME: ${{ github.repository_owner }}
          EXTERNAL_SOURCES: >-
            [
              {"name": "GitLab", "type": "gitlab", "url": "https://gitlab.com", "user": "octocat", "color": "#fc6d26"},
              {"name": "Codeberg", "type": "forgejo", "url": "https://codeberg.org", "user": "octocat", "color": "#2185d0", "darkColor": "#3b9ae1"}
            ]
      - name: Commit & Push
        run: |
          git config user.name github-actions
          git config user.email github-actions@github.com
          git add -A .
          if git commit -m "generated"; then
            git push
          fi
```

> [!NOTE]
> 您可以更改 GitHub 设置以包含来自私有仓库的贡献。要更改此设置，请点击标准贡献日历右上角的 `Contribution settings`，或点击屏幕右上角的头像，选择 `Settings` ⇒ `Public profile` ⇒ `Contributions & Activity`，并勾选 `Include private contributions on my profile`。
>
> 如果您希望包含来自私有仓库的额外活动，请将个人访问令牌注册为密钥，并在工作流文件中设置为 `GITHUB_TOKEN` 环境变量。但在大多数情况下，默认的 `secrets.GITHUB_TOKEN` 已足够。

默认情况下，计划每天运行一次。
您可以根据需要更改计划时间。

这会将工作流添加到您的仓库中。

#### 环境变量

示例中指定了 `GITHUB_TOKEN`、`USERNAME` 和 `EXTERNAL_SOURCES` 环境变量，但您可以指定以下环境变量：

- `GITHUB_TOKEN` : （必需）访问令牌
- `USERNAME` : （必需）目标用户名（或通过参数指定）。
- `MAX_REPOS` : （可选）最大仓库数，默认 100 - 自 v0.2.0 起
- `SETTING_JSON` : （可选）设置 json 文件路径。详情请参见仓库中的 `sample-settings/*.json` 和 `src/type.ts`。- 自 v0.6.0 起
- `GITHUB_ENDPOINT` : （可选）Github GraphQL 端点。例如，如果您希望基于公司 GitHub Enterprise 活动而不是 GitHub.com 创建贡献日历，请设置此环境变量。例如：`https://github.mycompany.com/api/graphql` - 自 v0.8.0 起
- `YEAR` : （可选）如需生成往年日历，请指定年份。此项主要用于命令行运行工具时指定。- 自 v0.8.0 起
- `THEMES` : （可选）未设置 `SETTING_JSON` 时要生成的内置主题列表，以逗号分隔，例如 `green-animate,gitblock`。可用：`green`、`green-animate`、`season`、`season-animate`、`south-season`、`south-season-animate`、`blue`、`blue-animate`、`rainbow`、`rainbow-animate`、`gitblock`、`gitblock-animate`。默认生成全部。所有主题都会自动适应查看者的深色模式。
- `EXTERNAL_SOURCES` : （可选）其他代码托管平台的贡献数据源 JSON 数组，以各自的颜色堆叠在 GitHub 柱体之上。每项需要 `name`（图例标签）、`type`（GitLab 实例为 `gitlab`，Codeberg 等 Forgejo/Gitea 实例为 `forgejo`）、`url`（实例的基础 URL）和 `user`；`color` 和 `darkColor`（`#RRGGBB`，后者用于深色模式）为可选。请参见下方的[外部来源](#外部来源)。

#### 关于 `GITHUB_TOKEN`

示例中设置为 `GITHUB_TOKEN` 环境变量的 `secrets.GITHUB_TOKEN` 是 GitHub 自动创建的特殊访问令牌。

- GitHub 文档: [在工作流中使用 GITHUB_TOKEN 进行身份验证](https://docs.github.com/zh/actions/tutorials/authenticate-with-github_token)

如果您只想为公共仓库生成贡献日历，请使用此值。
无需手动创建密钥。

此外，如果您希望在贡献日历中包含私有仓库的活动，请在个人资料设置的 "Public profile" 部分的 "Profile settings" 中勾选 "Include private contributions on my profile"。

如果还希望包含来自私有仓库的额外活动信息，请创建具有适当权限的访问令牌。
将该访问令牌注册为任意名称的密钥（例如 `MY_PERSONAL_ACCESS_TOKEN`）。
但请注意，用户创建的密钥不能以 `GITHUB_` 开头。

- GitHub 文档: [机密](https://docs.github.com/zh/actions/concepts/security/secrets)

将该密钥设置为 `GITHUB_TOKEN` 环境变量的值。

```diff
          env:
-           GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
+           GITHUB_TOKEN: ${{ secrets.MY_PERSONAL_ACCESS_TOKEN }}
            USERNAME: ${{ github.repository_owner }}
```

#### 关于计划时间

示例中设置为 UTC 时间 18:00。
这是因为作者本地时间为日本午夜。

```yaml
on:
  schedule: # 03:00 JST == 18:00 UTC
    - cron: "0 18 * * *"
```

您可以根据需要更改为任意时间。
建议设置为本地时间的午夜（约凌晨 3 点）。
但请注意，时间必须以 UTC 指定。

### 步骤 3. 手动运行此 GitHub Action

首次运行时，请手动运行此工作流。

- `Actions` -> `Profile-3D-Contrib` -> `Run workflow`

个人资料图片会生成在以下路径：

- `profile-3d-contrib/profile-green.svg`
- `profile-3d-contrib/profile-green-animate.svg`
- `profile-3d-contrib/profile-season.svg`
- `profile-3d-contrib/profile-season-animate.svg`
- `profile-3d-contrib/profile-south-season.svg`
- `profile-3d-contrib/profile-south-season-animate.svg`
- `profile-3d-contrib/profile-blue.svg`
- `profile-3d-contrib/profile-blue-animate.svg`
- `profile-3d-contrib/profile-rainbow.svg`
- `profile-3d-contrib/profile-rainbow-animate.svg`
- `profile-3d-contrib/profile-gitblock.svg`
- `profile-3d-contrib/profile-gitblock-animate.svg`

如果您指定了 `SETTING_JSON` 环境变量且 json 文件中未包含 `fileName` 属性，则会生成以下图片：

- `profile-3d-contrib/profile-customize.svg`

您可以像下面这样在 README.md 中使用这些图片。

示例：绿色版本

![svg](https://raw.githubusercontent.com/bittner/github-profile-3d-contrib/main/docs/demo/profile-green-animate.svg)

示例：季节版本（北半球）

![svg](https://raw.githubusercontent.com/bittner/github-profile-3d-contrib/main/docs/demo/profile-season-animate.svg)

示例：季节版本（南半球）

![svg](https://raw.githubusercontent.com/bittner/github-profile-3d-contrib/main/docs/demo/profile-south-season-animate.svg)

示例：蓝色版本

![svg](https://raw.githubusercontent.com/bittner/github-profile-3d-contrib/main/docs/demo/profile-blue-animate.svg)

示例：彩虹版本

![svg](https://raw.githubusercontent.com/bittner/github-profile-3d-contrib/main/docs/demo/profile-rainbow-animate.svg)

示例：git block 版本

![svg](https://raw.githubusercontent.com/bittner/github-profile-3d-contrib/main/docs/demo/profile-gitblock.svg)

### 步骤 4. 将图片添加到 README.md

在您的 README 文件中添加生成图片的路径。

示例：

```md
![](./profile-3d-contrib/profile-green-animate.svg)
```

#### 外部来源

可以将 GitLab（gitlab.com 或自托管实例）和 Forgejo/Gitea（如 Codeberg）上的贡献添加到日历中。这些数据从公开的个人资料数据源（`/users/<user>/calendar.json` 和 `/api/v1/users/<user>/heatmap`）获取，因此无需额外的令牌，并以堆叠段的形式绘制在每天的 GitHub 柱体之上。图例会标出每个来源的名称。上方工作流示例中的 `EXTERNAL_SOURCES` 项添加了 gitlab.com 和 Codeberg。

来源的颜色也可以在设置 JSON 中通过 `sourceColors`（按主题）以来源名称为键进行设置，例如 `"sourceColors": {"GitLab": "#fc6d26"}`；`darkMode` 内的同名键会覆盖深色模式下的颜色。在设置 JSON 中设置 `"sourceLegend": false` 可省略图例。柱体高度使用合并后的数量，因此各平台的段共享同一对数刻度。外部贡献数计入 `contributions` 总数，但不计入雷达图，因为其类别是 GitHub 特有的。

## 如何使用（GitHub Actions）- 高级示例

- [更多信息请参见 EXAMPLES.md](../EXAMPLES.md)

## 如何使用（本地）

将 `GITHUB_TOKEN` 环境变量设置为您的个人访问令牌。

```sh
export GITHUB_TOKEN=XXXXXXXXXXXXXXXXXXXXX
```

用您的 GitHub 用户名或目标用户名替换 `USER_NAME`，运行以下命令。

```sh
node_modules/.bin/ts-node src/index.ts USER_NAME
```

或

```sh
npm run build
node . USER_NAME
```

上述 `THEMES` 和 `EXTERNAL_SOURCES` 环境变量在本地运行时同样有效。

## 许可证

&copy; 2021 SATO Yoshiyuki. 采用 MIT 许可证。
