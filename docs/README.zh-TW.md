# Profile 3D Contrib

![svg](https://raw.githubusercontent.com/bittner/github-profile-3d-contrib/main/docs/demo/profile-gitblock-animate.svg)

<!-- 語言順序（不含英文） -->
[English (en)](../README.md) |
[Deutsch (de)](README.de.md) |
[Español (es)](README.es.md) |
[Français (fr)](README.fr.md) |
[日本語 (ja)](README.ja.md) |
[한국어 (ko)](README.ko.md) |
[Português (pt-BR)](README.pt-br.md) |
[Português (pt)](README.pt.md) |
[Русский (ru)](README.ru.md) |
[简体中文 (zh-CN)](README.zh-CN.md) |
繁體中文 (zh-TW) |

> [!NOTE]
> 本翻譯由機器自動生成。
> 可能包含錯誤或不自然的表達。
> 歡迎協助改進翻譯！

## 概述

此 GitHub Action 會為您的個人檔案圖片建立 3D 貢獻日曆，將您在 GitHub 上的活動與在 GitLab 執行個體（如 gitlab.com）和 Forgejo/Gitea 執行個體（如 Codeberg）上的活動合併，按天以不同顏色堆疊顯示。

它是 [yoshi389111/github-profile-3d-contrib](https://github.com/yoshi389111/github-profile-3d-contrib) 的分支（該專案僅支援 GitHub），並與其設定保持相容。額外的設定請參見[外部來源](#外部來源)。

## 如何使用（GitHub Actions）- 基本

此 GitHub Action 會產生您的 3D 貢獻日曆並提交到您的倉庫。
新增 Action 後，工作流程每天會自動執行一次。
您也可以手動觸發工作流程。

### 步驟 1. 建立特殊個人檔案倉庫

在 GitHub 上建立一個與您的使用者名稱相同的倉庫。

- 例如，若使用者名稱為 `octocat`，則建立名為 `octocat/octocat` 的倉庫。
- 參考：[Managing your profile README](https://docs.github.com/en/account-and-profile/how-tos/setting-up-and-managing-your-github-profile/customizing-your-profile/managing-your-profile-readme)

在此倉庫中，請依照以下步驟操作。

### 步驟 2. 建立工作流程檔案

建立如下的工作流程檔案。

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
> 您可以變更 GitHub 設定以包含私人倉庫的貢獻。請點選標準貢獻日曆右上角的「貢獻設定」，或點選右上角的個人圖示，選擇「設定」⇒「公開個人檔案」⇒「貢獻與活動」，並勾選「在我的個人檔案中包含私人貢獻」。
>
> 若要額外包含私人倉庫的活動，請將個人存取權杖註冊為機密，並在工作流程檔案中設定為 `GITHUB_TOKEN` 環境變數。但大多數情況下，預設的 `secrets.GITHUB_TOKEN` 已足夠。

預設排程為每天執行一次。
您可依需求調整排程時間。

這會將工作流程新增至您的倉庫。

#### 環境變數

範例中指定了 `GITHUB_TOKEN`、`USERNAME` 和 `EXTERNAL_SOURCES`，但您可指定以下環境變數：

- `GITHUB_TOKEN`：（必填）存取權杖
- `USERNAME`：（必填）目標使用者名稱（或以參數指定）。
- `MAX_REPOS`：（選填）最大倉庫數，預設 100 - 自 v0.2.0 起
- `SETTING_JSON`：（選填）設定 json 檔案路徑。詳見 `sample-settings/*.json` 及 `src/type.ts`。- 自 v0.6.0 起
- `GITHUB_ENDPOINT`：（選填）Github GraphQL 端點。例如，若要根據公司 GitHub Enterprise 活動建立貢獻日曆，請設定此環境變數。例如：`https://github.mycompany.com/api/graphql` - 自 v0.8.0 起
- `YEAR`：（選填）指定年份以產生過去的日曆。僅限命令列執行時指定。- 自 v0.8.0 起
- `THEMES`：（選填）未設定 `SETTING_JSON` 時要產生的內建主題清單，以逗號分隔，例如 `green-animate,gitblock`。可用：`green`、`green-animate`、`season`、`season-animate`、`south-season`、`south-season-animate`、`blue`、`blue-animate`、`rainbow`、`rainbow-animate`、`gitblock`、`gitblock-animate`。預設產生全部。所有主題都會自動配合檢視者的深色模式。
- `EXTERNAL_SOURCES`：（選填）其他程式碼託管平台的貢獻資料來源 JSON 陣列，以各自的顏色堆疊在 GitHub 柱體之上。每項需要 `name`（圖例標籤）、`type`（GitLab 執行個體為 `gitlab`，Codeberg 等 Forgejo/Gitea 執行個體為 `forgejo`）、`url`（執行個體的基底 URL）和 `user`；`color` 和 `darkColor`（`#RRGGBB`，後者用於深色模式）為選填。請參見下方的[外部來源](#外部來源)。

#### 關於 `GITHUB_TOKEN`

範例中於 `GITHUB_TOKEN` 環境變數設定的 `secrets.GITHUB_TOKEN` 為 GitHub 自動建立的特殊存取權杖。

- GitHub 文件：[Use GITHUB_TOKEN for authentication in workflows](https://docs.github.com/en/actions/tutorials/authenticate-with-github_token)

若僅需產生公開倉庫的貢獻日曆，請使用此值。
無需手動建立機密。

若要在貢獻日曆中包含私人倉庫活動，請在個人檔案設定的「公開個人檔案」→「貢獻與活動」中勾選「在我的個人檔案中包含私人貢獻」。

若要額外包含私人倉庫的活動資訊，請建立具有適當權限的存取權杖。
將該權杖註冊為機密，名稱可自訂（如 `MY_PERSONAL_ACCESS_TOKEN`）。
但請注意，使用者建立的機密名稱不可以 `GITHUB_` 開頭。

- GitHub 文件：[Secrets](https://docs.github.com/en/actions/concepts/security/secrets)

將該機密設為 `GITHUB_TOKEN` 環境變數的值。

```diff
          env:
-           GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
+           GITHUB_TOKEN: ${{ secrets.MY_PERSONAL_ACCESS_TOKEN }}
            USERNAME: ${{ github.repository_owner }}
```

#### 關於排程時間

範例設定為 18:00 UTC 執行。
這是因為作者的本地時間為 JST 午夜。

```yaml
on:
  schedule: # 03:00 JST == 18:00 UTC
    - cron: "0 18 * * *"
```

您可自由調整時間。
建議設為本地時間午夜（約凌晨 3 點）。
但請注意，時間需以 UTC 指定。

### 步驟 3. 手動執行 GitHub Action

首次請手動執行此工作流程。

- `Actions` -> `Profile-3D-Contrib` -> `Run workflow`

個人檔案圖片將產生於以下路徑：

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

若指定 `SETTING_JSON` 環境變數且 json 檔案未含 `fileName` 屬性，將產生以下圖片：

- `profile-3d-contrib/profile-customize.svg`

您可依下例於 README.md 使用這些圖片。

範例：綠色版本

![svg](https://raw.githubusercontent.com/bittner/github-profile-3d-contrib/main/docs/demo/profile-green-animate.svg)

範例：季節版（北半球）

![svg](https://raw.githubusercontent.com/bittner/github-profile-3d-contrib/main/docs/demo/profile-season-animate.svg)

範例：季節版（南半球）

![svg](https://raw.githubusercontent.com/bittner/github-profile-3d-contrib/main/docs/demo/profile-south-season-animate.svg)

範例：藍色版本

![svg](https://raw.githubusercontent.com/bittner/github-profile-3d-contrib/main/docs/demo/profile-blue-animate.svg)

範例：彩虹版本

![svg](https://raw.githubusercontent.com/bittner/github-profile-3d-contrib/main/docs/demo/profile-rainbow-animate.svg)

範例：Git Block 版

![svg](https://raw.githubusercontent.com/bittner/github-profile-3d-contrib/main/docs/demo/profile-gitblock.svg)

### 步驟 4. 將圖片加入 README.md

將產生的圖片路徑加入您的 README 檔案。

範例：

```md
![](./profile-3d-contrib/profile-green-animate.svg)
```

#### 外部來源

可以將 GitLab（gitlab.com 或自架執行個體）和 Forgejo/Gitea（如 Codeberg）上的貢獻加入日曆。這些資料從公開的個人檔案資料來源（`/users/<user>/calendar.json` 與 `/api/v1/users/<user>/heatmap`）取得，因此不需要額外的權杖，並以堆疊區段的形式繪製在每天的 GitHub 柱體之上。圖例會標示每個來源的名稱。上方工作流程範例中的 `EXTERNAL_SOURCES` 項目加入了 gitlab.com 和 Codeberg。

來源的顏色也可以在設定 JSON 中透過 `sourceColors`（依主題）以來源名稱為鍵進行設定，例如 `"sourceColors": {"GitLab": "#fc6d26"}`；`darkMode` 內的同名鍵會覆寫深色模式下的顏色。在設定 JSON 中設定 `"sourceLegend": false` 可省略圖例。柱體高度使用合併後的數量，因此各平台的區段共用同一對數刻度。外部貢獻數計入 `contributions` 總數，但不計入雷達圖，因為其類別是 GitHub 特有的。

## 如何使用（GitHub Actions）- 進階範例

- [更多資訊請見 EXAMPLES.md](./EXAMPLES.md)

## 如何使用（本地端）

請將 `GITHUB_TOKEN` 環境變數設為您的個人存取權杖。

```sh
export GITHUB_TOKEN=XXXXXXXXXXXXXXXXXXXXX
```

執行下列指令，將 `USER_NAME` 替換為您的 GitHub 使用者名稱或目標使用者名稱。

```sh
node_modules/.bin/ts-node src/index.ts USER_NAME
```

或

```sh
npm run build
node . USER_NAME
```

上述 `THEMES` 和 `EXTERNAL_SOURCES` 環境變數在本地端執行時同樣有效。

## 授權

&copy; 2021 SATO Yoshiyuki. 授權採用 MIT License。
