# 프로필 3D 기여도

![svg](https://raw.githubusercontent.com/bittner/github-profile-3d-contrib/main/docs/demo/profile-gitblock-animate.svg)

<!-- 언어 코드 순서(영어 제외) -->
[English (en)](../README.md) |
[Deutsch (de)](README.de.md) |
[Español (es)](README.es.md) |
[Français (fr)](README.fr.md) |
[日本語 (ja)](README.ja.md) |
한국어 (ko) |
[Português (pt-BR)](README.pt-br.md) |
[Português (pt)](README.pt.md) |
[Русский (ru)](README.ru.md) |
[简体中文 (zh-CN)](README.zh-CN.md) |
[繁體中文 (zh-TW)](README.zh-TW.md) |

> [!NOTE]
> 이 번역은 기계 번역으로 생성되었습니다.
> 오류나 부자연스러운 표현이 있을 수 있습니다.
> 번역 개선에 기여해 주세요!

## 개요

이 GitHub Action은 GitHub에서의 활동과 GitLab 인스턴스(예: gitlab.com) 및 Forgejo/Gitea 인스턴스(예: Codeberg)에서의 활동을 결합하여, 날짜별로 서로 다른 색상으로 쌓아 올린 3D 기여도 캘린더를 프로필 이미지로 생성합니다.

이 프로젝트는 GitHub만 지원하는 [yoshi389111/github-profile-3d-contrib](https://github.com/yoshi389111/github-profile-3d-contrib)의 포크이며, 그 설정과 호환됩니다. 추가 설정은 [외부 소스](#외부-소스)를 참고하세요.

## 사용 방법 (GitHub Actions) - 기본

이 GitHub Action은 GitHub 프로필 3D 기여도 캘린더를 생성하여 저장소에 커밋합니다.
GitHub Action을 추가하면 워크플로우가 하루에 한 번 자동으로 실행됩니다.
수동으로 워크플로우를 트리거할 수도 있습니다.

### 1단계. 특별 프로필 저장소 생성

GitHub에서 사용자 이름과 동일한 이름의 저장소를 생성하세요.

- 예를 들어, 사용자 이름이 `octocat`이면 `octocat/octocat` 저장소를 생성합니다.
- 참고: [프로필 추가 정보 관리](https://docs.github.com/ko/account-and-profile/how-tos/setting-up-and-managing-your-github-profile/customizing-your-profile/managing-your-profile-readme)

이 저장소에서 아래 단계를 따르세요.

### 2단계. 워크플로우 파일 생성

아래와 같은 워크플로우 파일을 생성하세요.

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
> GitHub 설정에서 비공개 저장소의 기여도를 포함하도록 변경할 수 있습니다. 이 설정을 변경하려면 표준 기여도 캘린더 오른쪽 상단의 `Contribution settings`를 클릭하거나 화면 오른쪽 상단의 아이콘을 클릭 후 `Settings` ⇒ `Public profile` ⇒ `Contributions & Activity`에서 `Include private contributions on my profile`을 체크하세요.
>
> 비공개 저장소의 추가 활동을 포함하려면 개인 액세스 토큰을 시크릿으로 등록하고 워크플로우 파일의 `GITHUB_TOKEN` 환경 변수에 설정하세요. 대부분의 경우 기본 `secrets.GITHUB_TOKEN`이면 충분합니다.

기본적으로 하루에 한 번 실행되도록 예약되어 있습니다.
원하는 시간으로 예약 시간을 변경할 수 있습니다.

이렇게 하면 워크플로우가 저장소에 추가됩니다.

#### 환경 변수

샘플에서는 `GITHUB_TOKEN`, `USERNAME`, `EXTERNAL_SOURCES`가 환경 변수로 지정되어 있지만, 다음 환경 변수를 지정할 수 있습니다:

| 변수 | 필수 여부 | 설명 |
| --- | --- | --- |
| `GITHUB_TOKEN` | 필수 | 액세스 토큰 |
| `USERNAME` | 필수 | 대상 사용자 이름 (또는 인수로 지정) |
| `MAX_REPOS` | 선택 | 최대 저장소 수, 기본값 100 - ver. 0.2.0부터 |
| `SETTING_JSON` | 선택 | 설정 json 파일 경로. 자세한 내용은 `sample-settings/*.json` 및 `src/type.ts`를 참고하세요. - ver. 0.6.0부터 |
| `GITHUB_ENDPOINT` | 선택 | Github GraphQL 엔드포인트. 예를 들어, 회사의 GitHub Enterprise 활동을 기반으로 기여도 캘린더를 만들고 싶다면 이 환경 변수를 설정하세요. 예: `https://github.mycompany.com/api/graphql` - ver. 0.8.0부터 |
| `YEAR` | 선택 | 과거 캘린더를 위해 연도를 지정하세요. 커맨드라인에서 도구를 실행할 때 지정합니다. - ver. 0.8.0부터 |
| `THEMES` | 선택 | `SETTING_JSON`이 설정되지 않았을 때 생성할 내장 테마의 쉼표로 구분된 목록. 예: `green-animate,gitblock`. 사용 가능: `green`, `green-animate`, `season`, `season-animate`, `south-season`, `south-season-animate`, `blue`, `blue-animate`, `rainbow`, `rainbow-animate`, `gitblock`, `gitblock-animate`. 기본값은 전체입니다. 모든 테마는 보는 사람의 다크 모드에 자동으로 맞춰지며. |
| `EXTERNAL_SOURCES` | 선택 | 다른 포지의 기여도 피드를 담은 JSON 배열로, GitHub 막대 위에 각자의 색상으로 쌓입니다. 각 항목에는 `name`(범례 라벨), `type`(GitLab 인스턴스는 `gitlab`, Codeberg 같은 Forgejo/Gitea 인스턴스는 `forgejo`), `url`(인스턴스의 기본 URL), `user`가 필요합니다. `color`와 `darkColor`(`#RRGGBB`, 후자는 다크 모드용)는 선택 사항입니다. 아래 [외부 소스](#외부-소스)를 참고하세요. |

#### `GITHUB_TOKEN`에 대하여

샘플에서 `GITHUB_TOKEN` 환경 변수에 설정된 `secrets.GITHUB_TOKEN`은 GitHub에서 자동으로 생성되는 특별한 액세스 토큰입니다.

- GitHub Docs: [워크플로에서 인증에 GITHUB_TOKEN 사용](https://docs.github.com/ko/actions/tutorials/authenticate-with-github_token)

공개 저장소만을 위한 기여도 캘린더를 생성하려면 이 값을 사용하세요.
별도의 시크릿을 만들 필요가 없습니다.

또한, 비공개 저장소의 활동을 기여도 캘린더에 포함하려면 프로필 설정의 "Public profile" 섹션에서 "Include private contributions on my profile"을 체크하세요.

추가적인 비공개 저장소 활동 정보를 포함하려면 적절한 권한의 액세스 토큰을 생성하세요.
해당 액세스 토큰을 원하는 이름의 시크릿(예: `MY_PERSONAL_ACCESS_TOKEN`)으로 등록하세요.
단, 사용자가 만든 시크릿은 `GITHUB_`로 시작할 수 없습니다.

- GitHub Docs: [비밀](https://docs.github.com/ko/actions/concepts/security/secrets)

해당 시크릿을 `GITHUB_TOKEN` 환경 변수 값으로 설정하세요.

```diff
          env:
-           GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
+           GITHUB_TOKEN: ${{ secrets.MY_PERSONAL_ACCESS_TOKEN }}
            USERNAME: ${{ github.repository_owner }}
```

#### 예약 시간에 대하여

샘플에서는 18:00 UTC에 시작하도록 설정되어 있습니다.
이는 작성자의 현지 시간인 자정(JST)에 실행되도록 하기 위함입니다.

```yaml
on:
  schedule: # 03:00 JST == 18:00 UTC
    - cron: "0 18 * * *"
```

원하는 시간으로 변경할 수 있습니다.
현지 시간 기준 자정(오전 3시경)을 추천합니다.
단, 시간은 반드시 UTC로 지정해야 합니다.

### 3단계. GitHub Action 수동 실행

처음에는 워크플로우를 수동으로 실행하세요.

- `Actions` -> `Profile-3D-Contrib` -> `Run workflow`

프로필 이미지는 다음 경로에 생성됩니다:

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

모든 이미지는 밝은 색상 구성과 어두운 색상 구성을 모두 포함하며, 보는 사람의 브라우저가 알려주는 색상 구성(`prefers-color-scheme`)에 따라 자동으로 전환됩니다. 별도의 밝은 파일이나 어두운 파일을 선택할 수는 없습니다. 하나의 구성으로 고정된 이미지를 원한다면 `sample-settings/`의 대부분 파일처럼 `darkMode` 블록이 없는 설정 파일을 `SETTING_JSON`으로 지정하세요.

`SETTING_JSON` 환경 변수를 지정하고 json 파일에 `fileName` 속성이 없으면 다음 이미지가 생성됩니다:

- `profile-3d-contrib/profile-customize.svg`

아래와 같이 README.md에 이미지를 사용할 수 있습니다.

예시: green 버전

![svg](https://raw.githubusercontent.com/bittner/github-profile-3d-contrib/main/docs/demo/profile-green-animate.svg)

예시: season 버전 (북반구)

![svg](https://raw.githubusercontent.com/bittner/github-profile-3d-contrib/main/docs/demo/profile-season-animate.svg)

예시: season 버전 (남반구)

![svg](https://raw.githubusercontent.com/bittner/github-profile-3d-contrib/main/docs/demo/profile-south-season-animate.svg)

예시: 블루 버전

![svg](https://raw.githubusercontent.com/bittner/github-profile-3d-contrib/main/docs/demo/profile-blue-animate.svg)

예시: 레인보우 버전

![svg](https://raw.githubusercontent.com/bittner/github-profile-3d-contrib/main/docs/demo/profile-rainbow-animate.svg)

예시: git block 버전

![svg](https://raw.githubusercontent.com/bittner/github-profile-3d-contrib/main/docs/demo/profile-gitblock.svg)

### 4단계. README.md에 이미지 추가

생성된 이미지의 경로를 README 파일에 추가하세요.

예시:

```md
![](./profile-3d-contrib/profile-green-animate.svg)
```

#### 외부 소스

GitLab(gitlab.com 또는 자체 호스팅 인스턴스)과 Forgejo/Gitea(예: Codeberg)의 기여도를 캘린더에 추가할 수 있습니다. 공개 프로필 피드(`/users/<user>/calendar.json` 및 `/api/v1/users/<user>/heatmap`)에서 가져오므로 추가 토큰이 필요 없으며, 각 날짜의 GitHub 막대 위에 쌓인 세그먼트로 그려집니다. 범례에 모든 소스의 이름이 표시됩니다. 위 워크플로우 샘플의 `EXTERNAL_SOURCES` 항목은 gitlab.com과 Codeberg를 추가합니다.

소스의 색상은 설정 JSON의 `sourceColors`에서 소스 이름을 키로 하여 테마별로 지정할 수도 있습니다(예: `"sourceColors": {"GitLab": "#fc6d26"}`). `darkMode` 안의 같은 키는 다크 모드용으로 이를 덮어씁니다. 범례를 생략하려면 설정 JSON에 `"sourceLegend": false`를 지정하세요. 막대 높이는 합산된 수를 사용하므로 플랫폼별 세그먼트가 하나의 로그 스케일을 공유합니다. 외부 기여도는 `contributions` 합계에는 포함되지만, GitHub 전용 항목으로 구성된 레이더 차트에는 포함되지 않습니다.

## 사용 방법 (GitHub Actions) - 고급 예시

- [자세한 내용은 EXAMPLES.md 참고](../EXAMPLES.md)

## 사용 방법 (로컬)

`GITHUB_TOKEN` 환경 변수에 개인 액세스 토큰을 설정하세요.

```sh
export GITHUB_TOKEN=XXXXXXXXXXXXXXXXXXXXX
```

아래 명령어를 실행하세요. `USER_NAME`을 GitHub 사용자 이름 또는 대상 사용자 이름으로 변경하세요.

```sh
node_modules/.bin/ts-node src/index.ts USER_NAME
```

또는

```sh
npm run build
node . USER_NAME
```

위에서 설명한 `THEMES`와 `EXTERNAL_SOURCES` 환경 변수는 로컬 실행에서도 동작합니다.

## 라이선스

&copy; 2021 SATO Yoshiyuki. MIT 라이선스 하에 제공됩니다.
