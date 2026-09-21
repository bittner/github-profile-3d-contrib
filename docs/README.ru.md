# Profile 3D Contrib

![svg](https://raw.githubusercontent.com/bittner/github-profile-3d-contrib/main/docs/demo/profile-gitblock-animate.svg)

<!-- Порядок кодов языков (кроме английского) -->
[English (en)](../README.md) |
[Deutsch (de)](README.de.md) |
[Español (es)](README.es.md) |
[Français (fr)](README.fr.md) |
[日本語 (ja)](README.ja.md) |
[한국어 (ko)](README.ko.md) |
[Português (pt-BR)](README.pt-br.md) |
[Português (pt)](README.pt.md) |
Русский (ru) |
[简体中文 (zh-CN)](README.zh-CN.md) |
[繁體中文 (zh-TW)](README.zh-TW.md) |

> [!NOTE]
> Этот перевод был создан с помощью машинного перевода.
> Он может содержать ошибки или неестественные выражения.
> Вклад в улучшение перевода приветствуется!

## Обзор

Этот GitHub Action создает 3D-календарь вкладов для изображения вашего профиля, объединяя вашу активность на GitHub с активностью на инстансах GitLab (например, gitlab.com) и инстансах Forgejo/Gitea (например, Codeberg), сложенную по дням в разных цветах.

Это форк [yoshi389111/github-profile-3d-contrib](https://github.com/yoshi389111/github-profile-3d-contrib), который ограничен GitHub, и он остается совместимым с его конфигурацией. Дополнительную настройку см. в разделе [Внешние источники](#внешние-источники).

## Как использовать (GitHub Actions) - Базовый

Этот GitHub Action генерирует ваш 3D-календарь вкладов профиля GitHub и коммитит его в ваш репозиторий.
После добавления GitHub Action рабочий процесс запускается автоматически один раз в день.
Вы также можете запустить рабочий процесс вручную.

### Шаг 1. Создайте специальный репозиторий профиля

Создайте репозиторий на GitHub с таким же именем, как ваше имя пользователя.

- Например, если имя пользователя `octocat`, создайте репозиторий с именем `octocat/octocat`.
- См. также: [Управление файлом сведений о профиле](https://docs.github.com/ru/account-and-profile/how-tos/setting-up-and-managing-your-github-profile/customizing-your-profile/managing-your-profile-readme)

В этом репозитории выполните следующие шаги.

### Шаг 2. Создайте файл рабочего процесса

Создайте файл рабочего процесса, как показано ниже.

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
> Вы можете изменить настройки GitHub, чтобы включить вклады из приватных репозиториев. Для этого нажмите `Contribution settings` в правом верхнем углу стандартного календаря вкладов или нажмите на свой значок в правом верхнем углу экрана, выберите `Settings` ⇒ `Public profile` ⇒ `Contributions & Activity` и отметьте `Include private contributions on my profile`.
>
> Если вы хотите включить дополнительные активности из приватных репозиториев, зарегистрируйте персональный токен доступа как секрет и установите его в переменную окружения `GITHUB_TOKEN` в файле рабочего процесса. Однако в большинстве случаев достаточно значения по умолчанию `secrets.GITHUB_TOKEN`.

По умолчанию расписание установлено на запуск один раз в день.
Вы можете изменить время запуска по своему усмотрению.

Это добавит рабочий процесс в ваш репозиторий.

#### Переменные окружения

В примере указаны `GITHUB_TOKEN`, `USERNAME` и `EXTERNAL_SOURCES` как переменные окружения, но вы можете указать следующие переменные:

| Переменная | Обязательная | Описание |
| --- | --- | --- |
| `GITHUB_TOKEN` | обязательно | токен доступа |
| `USERNAME` | обязательно | целевое имя пользователя (или укажите аргументом). |
| `MAX_REPOS` | опционально | максимальное количество репозиториев, по умолчанию 100 - начиная с версии 0.2.0 |
| `SETTING_JSON` | опционально | путь к файлу настроек json. См. `sample-settings/*.json` и `src/type.ts` в репозитории `bittner/github-profile-3d-contrib` для подробностей. - начиная с версии 0.6.0 |
| `GITHUB_ENDPOINT` | опционально | конечная точка Github GraphQL. Например, если вы хотите создать календарь вкладов на основе активности вашей корпоративной GitHub Enterprise, установите эту переменную окружения. Например: `https://github.mycompany.com/api/graphql` - начиная с версии 0.8.0 |
| `YEAR` | опционально | Для календарей прошлых лет укажите год. Это предназначено для использования при запуске инструмента из командной строки. - начиная с версии 0.8.0 |
| `THEMES` | опционально | список встроенных тем через запятую, которые генерируются, если `SETTING_JSON` не задан, например `green-animate,gitblock`. Доступны: `green`, `green-animate`, `season`, `season-animate`, `south-season`, `south-season-animate`, `blue`, `blue-animate`, `rainbow`, `rainbow-animate`, `gitblock`, `gitblock-animate`. По умолчанию все. Все темы автоматически подстраиваются под темный режим зрителя. |
| `EXTERNAL_SOURCES` | опционально | JSON-массив лент вкладов с других форжей, складываемых поверх столбцов GitHub в собственных цветах. Каждому элементу нужны `name` (подпись в легенде), `type` (`gitlab` для инстансов GitLab, `forgejo` для инстансов Forgejo/Gitea, таких как Codeberg), `url` (базовый URL инстанса) и `user`; `color` и `darkColor` (`#RRGGBB`, последний используется в темном режиме) необязательны. См. [Внешние источники](#внешние-источники) ниже. |

#### О `GITHUB_TOKEN`

`secrets.GITHUB_TOKEN`, установленный в переменной окружения `GITHUB_TOKEN` в примере, — это специальный токен доступа, автоматически создаваемый GitHub.

- Документация GitHub: [Использование GITHUB_TOKEN для проверки подлинности в рабочих процессах](https://docs.github.com/ru/actions/tutorials/authenticate-with-github_token)

Если вы хотите генерировать календарь вкладов только для публичных репозиториев, используйте это значение.
Нет необходимости создавать секрет вручную.

Также, если вы хотите включить активность в приватных репозиториях в календарь вкладов, отметьте "Include private contributions on my profile" в разделе "Profile settings" в настройках профиля.

Кроме того, если вы хотите включить дополнительную информацию об активности из приватных репозиториев, создайте токен доступа с соответствующими разрешениями.
Зарегистрируйте этот токен как секрет с любым именем (например, `MY_PERSONAL_ACCESS_TOKEN`).
Однако обратите внимание, что секреты, созданные пользователем, не могут начинаться с `GITHUB_`.

- Документация GitHub: [Секреты](https://docs.github.com/ru/actions/concepts/security/secrets)

Установите этот секрет в переменную окружения `GITHUB_TOKEN`.

```diff
          env:
-           GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
+           GITHUB_TOKEN: ${{ secrets.MY_PERSONAL_ACCESS_TOKEN }}
            USERNAME: ${{ github.repository_owner }}
```

#### О времени запуска

В примере запуск установлен на 18:00 UTC.
Это потому, что он будет запускаться в полночь JST, что соответствует местному времени автора.

```yaml
on:
  schedule: # 03:00 JST == 18:00 UTC
    - cron: "0 18 * * *"
```

Вы можете изменить время на любое удобное.
Рекомендуется выбирать полночь (около 3 часов ночи) по вашему местному времени.
Однако обратите внимание, что время должно быть указано в UTC.

### Шаг 3. Запустите GitHub Action вручную

В первый раз запустите этот рабочий процесс вручную.

- `Actions` -> `Profile-3D-Contrib` -> `Run workflow`

Изображения профиля генерируются по следующим путям:

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

Если вы укажете переменную окружения `SETTING_JSON` без свойства `fileName` в json-файле, будет сгенерировано следующее изображение:

- `profile-3d-contrib/profile-customize.svg`

Вы можете использовать эти изображения в вашем README.md, как показано ниже.

Пример: зеленая версия

![svg](https://raw.githubusercontent.com/bittner/github-profile-3d-contrib/main/docs/demo/profile-green-animate.svg)

Пример: сезонная версия (Северное полушарие.)

![svg](https://raw.githubusercontent.com/bittner/github-profile-3d-contrib/main/docs/demo/profile-season-animate.svg)

Пример: сезонная версия (Южное полушарие.)

![svg](https://raw.githubusercontent.com/bittner/github-profile-3d-contrib/main/docs/demo/profile-south-season-animate.svg)

Пример: синяя версия

![svg](https://raw.githubusercontent.com/bittner/github-profile-3d-contrib/main/docs/demo/profile-blue-animate.svg)

Пример: радужная версия

![svg](https://raw.githubusercontent.com/bittner/github-profile-3d-contrib/main/docs/demo/profile-rainbow-animate.svg)

Пример: версия git block

![svg](https://raw.githubusercontent.com/bittner/github-profile-3d-contrib/main/docs/demo/profile-gitblock.svg)

### Шаг 4. Добавьте изображение в README.md

Добавьте путь к сгенерированному изображению в ваш README файл.

Пример:

```md
![](./profile-3d-contrib/profile-green-animate.svg)
```

#### Внешние источники

Вклады на GitLab (gitlab.com или собственный инстанс) и на Forgejo/Gitea (например, Codeberg) можно добавить в календарь. Они загружаются из публичных лент профиля (`/users/<user>/calendar.json` и `/api/v1/users/<user>/heatmap`), поэтому дополнительные токены не нужны, и рисуются как сложенные сегменты поверх столбца GitHub за каждый день. Легенда называет каждый источник. Элементы `EXTERNAL_SOURCES` в примере рабочего процесса выше добавляют gitlab.com и Codeberg.

Цвет источника также можно задать (для каждой темы) в JSON настроек с помощью `sourceColors`, где ключом служит имя источника, например `"sourceColors": {"GitLab": "#fc6d26"}`; тот же ключ внутри `darkMode` переопределяет его для темного режима. Укажите `"sourceLegend": false` в JSON настроек, чтобы убрать легенду. Высота столбца использует суммарное количество, поэтому сегменты платформ используют одну логарифмическую шкалу. Внешние вклады включаются в общее число `contributions`, но не в радарную диаграмму, категории которой специфичны для GitHub.

## Как использовать (GitHub Actions) - Продвинутые примеры

- [Подробнее в EXAMPLES.md](../EXAMPLES.md)

## Как использовать (локально)

Установите переменную окружения `GITHUB_TOKEN` на ваш персональный токен доступа.

```sh
export GITHUB_TOKEN=XXXXXXXXXXXXXXXXXXXXX
```

Выполните следующую команду, заменив `USER_NAME` на ваше имя пользователя GitHub или целевое имя пользователя.

```sh
node_modules/.bin/ts-node src/index.ts USER_NAME
```

или

```sh
npm run build
node . USER_NAME
```

Описанные выше переменные окружения `THEMES` и `EXTERNAL_SOURCES` работают и при локальном запуске.

## Лицензия

&copy; 2021 SATO Yoshiyuki. Лицензия MIT.
