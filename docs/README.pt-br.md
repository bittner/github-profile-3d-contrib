# Profile 3D Contrib

![svg](https://raw.githubusercontent.com/bittner/github-profile-3d-contrib/main/docs/demo/profile-gitblock-animate.svg)

<!-- Ordem do código de idioma (exceto inglês) -->
[English (en)](../README.md) |
[Deutsch (de)](README.de.md) |
[Español (es)](README.es.md) |
[Français (fr)](README.fr.md) |
[日本語 (ja)](README.ja.md) |
[한국어 (ko)](README.ko.md) |
Português (pt-BR) |
[Português (pt)](README.pt.md) |
[Русский (ru)](README.ru.md) |
[简体中文 (zh-CN)](README.zh-CN.md) |
[繁體中文 (zh-TW)](README.zh-TW.md) |

## Visão geral

Esta GitHub Action cria um calendário de contribuições 3D para a sua imagem de perfil, combinando a sua atividade no GitHub com a sua atividade em instâncias do GitLab (ex.: gitlab.com) e em instâncias do Forgejo/Gitea (ex.: Codeberg), empilhadas por dia em cores distintas.

É um fork de [yoshi389111/github-profile-3d-contrib](https://github.com/yoshi389111/github-profile-3d-contrib), que é limitado ao GitHub, e continua compatível com a sua configuração. Veja [Fontes externas](#fontes-externas) para a configuração adicional.

## Como usar (GitHub Actions) – Básico

O GitHub Action gera o seu calendário de contribuições 3D do GitHub e faz o commit no seu repositório. Depois de adicionar o GitHub Action, o workflow roda automaticamente uma vez ao dia. Você também pode executar o workflow manualmente.

### Passo 1. Crie um repositório especial de perfil

Crie um repositório no GitHub com o mesmo nome do seu nome de usuário.

- Por exemplo, se o nome de usuário for `octocat`, crie um repositório chamado `octocat/octocat`.
- Confira: [Gerenciando seu README de perfil](https://docs.github.com/pt/account-and-profile/how-tos/setting-up-and-managing-your-github-profile/customizing-your-profile/managing-your-profile-readme)

Siga os passos abaixo nesse repositório.

### Passo 2. Crie o arquivo de workflow

Crie um arquivo de workflow como o exemplo abaixo:

- `.github/workflows/profile-3d.yml`

```yaml
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
> Você pode alterar as configurações da sua conta no GitHub para incluir contribuições de repositórios privados. Para mudar essa opção, clique em `Configurações de contribuição` no canto superior direito do calendário padrão de contribuições, ou clique no seu ícone no canto superior direito da tela, vá em `Configurações` ⇒ `Perfil público` ⇒ `Contribuições & Atividade`, e marque `Incluir contribuições privadas no meu perfil`.
>
> Se você quiser incluir atividades adicionais de repositórios privados, registre um token de acesso pessoal como segredo e defina ele na variável de ambiente `GITHUB_TOKEN` dentro do arquivo de workflow. Porém, na maioria dos casos, o `secrets.GITHUB_TOKEN` padrão já é suficiente.

O agendamento é definido para rodar uma vez por dia por padrão. Você pode mudar o horário como quiser.

Isso vai adicionar o workflow ao seu repositório.

#### Variáveis de ambiente

No exemplo, `GITHUB_TOKEN`, `USERNAME` e `EXTERNAL_SOURCES` estão definidos como variáveis de ambiente, mas você pode usar as seguintes:

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `GITHUB_TOKEN` | obrigatório | token de acesso |
| `USERNAME` | obrigatório | nome de usuário alvo (ou especifique como argumento). |
| `MAX_REPOS` | opcional | número máximo de repositórios, padrão é 100 — desde a versão 0.2.0 |
| `SETTING_JSON` | opcional | caminho para o arquivo JSON de configurações. Veja `sample-settings/*.json` e `src/type.ts` no repositório `bittner/github-profile-3d-contrib` para mais detalhes — desde a versão 0.6.0 |
| `GITHUB_ENDPOINT` | opcional | endpoint GraphQL do GitHub. Por exemplo, se você quiser criar o calendário de contribuições baseado no GitHub Enterprise da sua empresa em vez do GitHub.com, defina essa variável. Exemplo: `https://github.mycompany.com/api/graphql` — desde a versão 0.8.0 |
| `YEAR` | opcional | para gerar calendários de anos anteriores, especifique o ano. Essa opção é pensada principalmente para quando a ferramenta é executada via linha de comando — desde a versão 0.8.0 |
| `THEMES` | opcional | lista separada por vírgulas dos temas embutidos a gerar quando `SETTING_JSON` não está definido, ex.: `green-animate,gitblock`. Disponíveis: `green`, `green-animate`, `season`, `season-animate`, `south-season`, `south-season-animate`, `blue`, `blue-animate`, `rainbow`, `rainbow-animate`, `gitblock`, `gitblock-animate`. Todos por padrão. Todos os temas se adaptam automaticamente ao modo escuro do leitor. |
| `EXTERNAL_SOURCES` | opcional | array JSON de feeds de contribuições de outras forjas, empilhados sobre as barras do GitHub nas suas próprias cores. Cada entrada precisa de `name` (rótulo da legenda), `type` (`gitlab` para instâncias do GitLab, `forgejo` para instâncias do Forgejo/Gitea como o Codeberg), `url` (URL base da instância) e `user`; `color` e `darkColor` (`#RRGGBB`, o último usado no modo escuro) são opcionais. Veja [Fontes externas](#fontes-externas) abaixo. |

#### Sobre o `GITHUB_TOKEN`

O `secrets.GITHUB_TOKEN` definido na variável de ambiente `GITHUB_TOKEN` no exemplo é um token de acesso especial criado automaticamente pelo GitHub.

- GitHub Docs: [Usar GITHUB_TOKEN para autenticação em fluxos de trabalho](https://docs.github.com/pt/actions/tutorials/authenticate-with-github_token)

Se você quiser gerar um calendário de contribuições apenas com repositórios públicos, use esse token mesmo. Não é necessário criar um segredo manualmente.

Se quiser incluir a atividade dos seus repositórios privados no calendário de contribuições, marque "Incluir contribuições privadas no meu perfil" na seção "Configurações de perfil", dentro de "Perfil público", nas configurações do seu perfil.

Além disso, se quiser incluir informações adicionais de atividade de repositórios privados, crie um token de acesso com as permissões apropriadas. Registre esse token como um segredo com qualquer nome que você preferir (por exemplo, `MY_PERSONAL_ACCESS_TOKEN`).
No entanto, observe que segredos criados pelo usuário não podem começar com `GITHUB_`.

- GitHub Docs: [Segredos](https://docs.github.com/pt/actions/concepts/security/secrets)

Depois disso, defina esse segredo como valor da variável de ambiente `GITHUB_TOKEN`.

```diff
          env:
-           GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
+           GITHUB_TOKEN: ${{ secrets.MY_PERSONAL_ACCESS_TOKEN }}
            USERNAME: ${{ github.repository_owner }}
```

#### Sobre o horário do agendamento

No exemplo, o início está definido para as 18:00 UTC.
Isso porque esse horário corresponde à meia-noite no fuso horário JST, que é o fuso horário local do autor.

```yaml
on:
  schedule: # 03:00 JST == 18:00 UTC
    - cron: "0 18 * * *"
```

Você pode alterar para qualquer horário que quiser. Recomendamos agendar por volta da meia-noite (entre 0h e 3h) no seu horário local. No entanto, lembre-se de que o horário deve ser especificado em UTC.

### Passo 3. Execute manualmente esta GitHub Action

Na primeira vez, execute esse workflow manualmente.

- `Actions` -> `Profile-3D-Contrib` -> `Run workflow`

As imagens de perfil são geradas nos seguintes caminhos:

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

Cada imagem contém um esquema de cores claro e um escuro e alterna entre eles automaticamente, seguindo o esquema de cores informado pelo navegador de quem visualiza (`prefers-color-scheme`). Não há um arquivo claro ou escuro separado para escolher. Se você quiser uma imagem fixa em um único esquema, use `SETTING_JSON` com um arquivo de configurações sem o bloco `darkMode`, como a maioria dos arquivos em `sample-settings/`.

Se você definir a variável de ambiente `SETTING_JSON` sem a propriedade `fileName` no arquivo json, a seguinte imagem será gerada:

- `profile-3d-contrib/profile-customize.svg`

Você pode usar essas imagens no seu README.md, como mostrado abaixo:

Exemplo: versão verde

![svg](https://raw.githubusercontent.com/bittner/github-profile-3d-contrib/main/docs/demo/profile-green-animate.svg)

Exemplo: versão de estação (Hemisfério Norte.)

![svg](https://raw.githubusercontent.com/bittner/github-profile-3d-contrib/main/docs/demo/profile-season-animate.svg)

Exemplo: versão de estação (Hemisfério Sul.)

![svg](https://raw.githubusercontent.com/bittner/github-profile-3d-contrib/main/docs/demo/profile-south-season-animate.svg)

Exemplo: versão azul

![svg](https://raw.githubusercontent.com/bittner/github-profile-3d-contrib/main/docs/demo/profile-blue-animate.svg)

Exemplo: versão arco-íris

![svg](https://raw.githubusercontent.com/bittner/github-profile-3d-contrib/main/docs/demo/profile-rainbow-animate.svg)

Exemplo: versão git block

![svg](https://raw.githubusercontent.com/bittner/github-profile-3d-contrib/main/docs/demo/profile-gitblock.svg)

### Passo 4. Adicione a imagem ao README.md

Adicione o caminho da imagem gerada no seu arquivo README.md.

Exemplo:

```md
![](./profile-3d-contrib/profile-green-animate.svg)
```

#### Fontes externas

Contribuições no GitLab (gitlab.com ou uma instância própria) e no Forgejo/Gitea (ex.: Codeberg) podem ser adicionadas ao calendário. Elas são obtidas dos feeds públicos do perfil (`/users/<user>/calendar.json` e `/api/v1/users/<user>/heatmap`), portanto não são necessários tokens adicionais, e desenhadas como segmentos empilhados sobre a barra do GitHub de cada dia. Uma legenda nomeia cada fonte. As entradas de `EXTERNAL_SOURCES` no exemplo de workflow acima adicionam gitlab.com e Codeberg.

A cor de uma fonte também pode ser definida (por tema) no JSON de configurações com `sourceColors`, usando o nome da fonte como chave, ex.: `"sourceColors": {"GitLab": "#fc6d26"}`; a mesma chave dentro de `darkMode` a sobrescreve para o modo escuro. Defina `"sourceLegend": false` no JSON de configurações para omitir a legenda. A altura da barra usa a contagem combinada, então os segmentos das plataformas compartilham uma única escala logarítmica. As contagens externas são incluídas no total de `contributions`, mas não no gráfico de radar, cujas categorias são específicas do GitHub.

## Como usar (GitHub Actions) - Exemplos avançados

- [Mais informações em EXAMPLES.md](../EXAMPLES.md)

## Como usar (local)

Defina a variável de ambiente `GITHUB_TOKEN` com o seu token de acesso pessoal.

```sh
export GITHUB_TOKEN=XXXXXXXXXXXXXXXXXXXXX
```

Execute o seguinte comando, substituindo `USER_NAME` pelo seu nome de usuário do GitHub ou o nome de usuário alvo:

```sh
node_modules/.bin/ts-node src/index.ts USER_NAME
```

ou

```sh
npm run build
node . USER_NAME
```

As variáveis de ambiente `THEMES` e `EXTERNAL_SOURCES` descritas acima também funcionam em execuções locais.

## Licença

&copy; 2021 SATO Yoshiyuki. Licenciado sob a Licença MIT.
