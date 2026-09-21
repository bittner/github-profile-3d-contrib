# Profile 3D Contrib

![svg](https://raw.githubusercontent.com/bittner/github-profile-3d-contrib/main/docs/demo/profile-gitblock-animate.svg)

<!-- Ordem do código de idioma (exceto inglês) -->
[English (en)](../README.md) |
[Deutsch (de)](README.de.md) |
[Español (es)](README.es.md) |
[Français (fr)](README.fr.md) |
[日本語 (ja)](README.ja.md) |
[한국어 (ko)](README.ko.md) |
[Português (pt-BR)](README.pt-br.md) |
Português (pt) |
[Русский (ru)](README.ru.md) |
[简体中文 (zh-CN)](README.zh-CN.md) |
[繁體中文 (zh-TW)](README.zh-TW.md) |

> [!NOTE]
> Esta tradução foi gerada por tradução automática.
> Pode conter erros ou expressões não naturais.
> Contribuições para melhorar a tradução são bem-vindas!

## Visão geral

Esta GitHub Action cria um calendário de contribuições 3D para a sua imagem de perfil, combinando a sua atividade no GitHub com a sua atividade em instâncias do GitLab (p. ex. gitlab.com) e em instâncias do Forgejo/Gitea (p. ex. Codeberg), empilhadas por dia em cores distintas.

É um fork de [yoshi389111/github-profile-3d-contrib](https://github.com/yoshi389111/github-profile-3d-contrib), que se limita ao GitHub, e mantém-se compatível com a sua configuração. Veja [Fontes externas](#fontes-externas) para a configuração adicional.

## Como usar (GitHub Actions) - Básico

Esta GitHub Action gera o calendário 3D de contribuições do seu perfil do GitHub e faz commit no seu repositório.
Após adicionar a GitHub Action, o workflow é executado automaticamente uma vez por dia.
Você também pode disparar o workflow manualmente.

### Passo 1. Crie um repositório especial de perfil

Crie um repositório no GitHub com o mesmo nome do seu nome de usuário.

- Por exemplo, se o nome de usuário for `octocat`, crie um repositório chamado `octocat/octocat`.
- Veja também: [Gerenciar o README do seu perfil](https://docs.github.com/pt/account-and-profile/how-tos/setting-up-and-managing-your-github-profile/customizing-your-profile/managing-your-profile-readme)

Neste repositório, siga os passos abaixo.

### Passo 2. Crie o arquivo de workflow

Crie um arquivo de workflow como o exemplo abaixo.

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
> Você pode alterar as configurações do GitHub para incluir contribuições de repositórios privados. Para alterar esta configuração, clique em `Configurações de contribuição` no canto superior direito do calendário padrão de contribuições, ou clique no seu ícone no canto superior direito da tela, selecione `Configurações` ⇒ `Perfil público` ⇒ `Contribuições & Atividade`, e marque `Incluir contribuições privadas no meu perfil`.
>
> Se quiser incluir atividades adicionais de repositórios privados, registre um token de acesso pessoal como segredo e defina-o na variável de ambiente `GITHUB_TOKEN` no arquivo de workflow. No entanto, na maioria dos casos, o padrão `secrets.GITHUB_TOKEN` é suficiente.

O agendamento está definido para executar uma vez por dia por padrão.
Você pode alterar o horário agendado como desejar.

Isso adicionará o workflow ao seu repositório.

#### Variáveis de ambiente

No exemplo, `GITHUB_TOKEN`, `USERNAME` e `EXTERNAL_SOURCES` são especificados como variáveis de ambiente, mas você pode especificar as seguintes variáveis de ambiente:

- `GITHUB_TOKEN` : (obrigatório) token de acesso
- `USERNAME` : (obrigatório) nome de usuário alvo (ou especifique como argumento).
- `MAX_REPOS` : (opcional) máximo de repositórios, padrão 100 - desde ver. 0.2.0
- `SETTING_JSON` : (opcional) caminho do arquivo json de configurações. Veja `sample-settings/*.json` e `src/type.ts` no repositório `bittner/github-profile-3d-contrib` para detalhes. - desde ver. 0.6.0
- `GITHUB_ENDPOINT` : (opcional) endpoint GraphQL do Github. Por exemplo, se quiser criar um calendário de contribuições baseado na atividade do seu GitHub Enterprise da empresa em vez do GitHub.com, defina esta variável de ambiente. Exemplo: `https://github.mycompany.com/api/graphql` - desde ver. 0.8.0
- `YEAR` : (opcional) Para calendários passados, especifique o ano. Destinado a ser especificado ao executar a ferramenta pela linha de comando. - desde ver. 0.8.0
- `THEMES` : (opcional) lista separada por vírgulas dos temas integrados a gerar quando `SETTING_JSON` não está definido, p. ex. `green-animate,gitblock`. Disponíveis: `green`, `green-animate`, `season`, `season-animate`, `south-season`, `south-season-animate`, `blue`, `blue-animate`, `rainbow`, `rainbow-animate`, `gitblock`, `gitblock-animate`. Todos por omissão. Todos os temas adaptam-se automaticamente ao modo escuro do leitor.
- `EXTERNAL_SOURCES` : (opcional) array JSON de feeds de contribuições de outras forjas, empilhados sobre as barras do GitHub nas suas próprias cores. Cada entrada precisa de `name` (rótulo da legenda), `type` (`gitlab` para instâncias do GitLab, `forgejo` para instâncias do Forgejo/Gitea como o Codeberg), `url` (URL base da instância) e `user`; `color` e `darkColor` (`#RRGGBB`, o último usado no modo escuro) são opcionais. Veja [Fontes externas](#fontes-externas) abaixo.

#### Sobre o `GITHUB_TOKEN`

O `secrets.GITHUB_TOKEN` definido na variável de ambiente `GITHUB_TOKEN` no exemplo é um token de acesso especial criado automaticamente pelo GitHub.

- GitHub Docs: [Usar GITHUB_TOKEN para autenticação em fluxos de trabalho](https://docs.github.com/pt/actions/tutorials/authenticate-with-github_token)

Se quiser gerar um calendário de contribuições apenas para repositórios públicos, use este valor.
Não é necessário criar um segredo manualmente.

Além disso, se quiser incluir atividade em seus repositórios privados no calendário de contribuições, marque "Incluir contribuições privadas no meu perfil" na seção "Configurações de perfil" em "Perfil público" nas configurações do seu perfil.

Além disso, se quiser incluir informações adicionais de atividade de repositórios privados, crie um token de acesso com as permissões apropriadas.
Registre esse token de acesso como um segredo com qualquer nome que desejar (por exemplo, `MY_PERSONAL_ACCESS_TOKEN`).
No entanto, observe que segredos criados pelo usuário não podem começar com `GITHUB_`.

- GitHub Docs: [Segredos](https://docs.github.com/pt/actions/concepts/security/secrets)

Defina esse segredo como valor da variável de ambiente `GITHUB_TOKEN`.

```diff
          env:
-           GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
+           GITHUB_TOKEN: ${{ secrets.MY_PERSONAL_ACCESS_TOKEN }}
            USERNAME: ${{ github.repository_owner }}
```

#### Sobre o horário do agendamento

No exemplo, está definido para iniciar às 18:00 UTC.
Isso porque será executado à meia-noite JST, que é o horário local do autor.

```yaml
on:
  schedule: # 03:00 JST == 18:00 UTC
    - cron: "0 18 * * *"
```

Você pode alterar para qualquer horário que desejar.
Recomendamos meia-noite (por volta das 3h) no seu horário local.
No entanto, observe que o horário deve ser especificado em UTC.

### Passo 3. Execute manualmente esta GitHub Action

Na primeira vez, execute este workflow manualmente.

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

Se você especificar a variável de ambiente `SETTING_JSON` sem a propriedade `fileName` no arquivo json, a seguinte imagem será gerada:

- `profile-3d-contrib/profile-customize.svg`

Você pode usar essas imagens no seu README.md como mostrado abaixo.

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

Adicione o caminho para a imagem gerada no seu arquivo README.

Exemplo:

```md
![](./profile-3d-contrib/profile-green-animate.svg)
```

#### Fontes externas

Contribuições no GitLab (gitlab.com ou uma instância própria) e no Forgejo/Gitea (p. ex. Codeberg) podem ser adicionadas ao calendário. São obtidas dos feeds públicos do perfil (`/users/<user>/calendar.json` e `/api/v1/users/<user>/heatmap`), pelo que não são necessários tokens adicionais, e desenhadas como segmentos empilhados sobre a barra do GitHub de cada dia. Uma legenda nomeia cada fonte. As entradas de `EXTERNAL_SOURCES` no exemplo de workflow acima adicionam gitlab.com e Codeberg.

A cor de uma fonte também pode ser definida (por tema) no JSON de configurações com `sourceColors`, usando o nome da fonte como chave, p. ex. `"sourceColors": {"GitLab": "#fc6d26"}`; a mesma chave dentro de `darkMode` substitui-a para o modo escuro. Defina `"sourceLegend": false` no JSON de configurações para omitir a legenda. A altura da barra usa a contagem combinada, pelo que os segmentos das plataformas partilham uma única escala logarítmica. As contagens externas são incluídas no total de `contributions`, mas não no gráfico de radar, cujas categorias são específicas do GitHub.

## Como usar (GitHub Actions) - Exemplos avançados

- [Mais informações em EXAMPLES.md](../EXAMPLES.md)

## Como usar (local)

Defina a variável de ambiente `GITHUB_TOKEN` para seu token de acesso pessoal.

```sh
export GITHUB_TOKEN=XXXXXXXXXXXXXXXXXXXXX
```

Execute o seguinte comando, substituindo `USER_NAME` pelo seu nome de usuário do GitHub ou o nome de usuário alvo.

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
