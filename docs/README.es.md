# Profile 3D Contrib

![svg](https://raw.githubusercontent.com/bittner/github-profile-3d-contrib/main/docs/demo/profile-gitblock-animate.svg)

<!-- Orden del código de idioma (excepto inglés) -->
[English (en)](../README.md) |
[Deutsch (de)](README.de.md) |
Español (es) |
[Français (fr)](README.fr.md) |
[日本語 (ja)](README.ja.md) |
[한국어 (ko)](README.ko.md) |
[Português (pt-BR)](README.pt-br.md) |
[Português (pt)](README.pt.md) |
[Русский (ru)](README.ru.md) |
[简体中文 (zh-CN)](README.zh-CN.md) |
[繁體中文 (zh-TW)](README.zh-TW.md) |

> [!NOTE]
> Esta traducción fue generada parcialmente por un traductor automático.
> Puede contener errores o expresiones poco naturales.
> ¡Las contribuciones para mejorar la traducción son bienvenidas!

## Visión general

Esta acción de GitHub crea un calendario de contribuciones 3D para tu imagen de perfil, combinando tu actividad en GitHub con tu actividad en instancias de GitLab (p. ej. gitlab.com) e instancias de Forgejo/Gitea (p. ej. Codeberg), apiladas por día en colores distintos.

Es un fork de [yoshi389111/github-profile-3d-contrib](https://github.com/yoshi389111/github-profile-3d-contrib), que se limita a GitHub, y se mantiene compatible con su configuración. Consulta [Fuentes externas](#fuentes-externas) para la configuración adicional.

## Cómo usar (GitHub Actions) - Básico

Esta acción genera el calendario de contribuciones 3D de tu perfil de GitHub y lo agrega a tu repositorio.
Después de agregar la acción, el flujo de trabajo se ejecuta automáticamente una vez al día.
También puedes activar el flujo de trabajo manualmente.

### Paso 1. Crear un repositorio especial de perfil

Crea un repositorio en GitHub con el mismo nombre que tu nombre de usuario.

- Por ejemplo, si tu nombre de usuario es `octocat`, crea un repositorio llamado `octocat/octocat`.
- Consulta: [Administrar el README de tu perfil](https://docs.github.com/es/account-and-profile/how-tos/setting-up-and-managing-your-github-profile/customizing-your-profile/managing-your-profile-readme)

En este repositorio, sigue los pasos a continuación.

### Paso 2. Crear archivo de workflow

Crea un archivo de workflow como el siguiente.

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
> Puedes cambiar la configuración de GitHub para incluir contribuciones de repositorios privados. Para cambiar esta configuración, haz clic en `Contribution settings` en la parte superior derecha del calendario de contribuciones estándar, o haz clic en tu icono en la parte superior derecha de la pantalla, selecciona `Settings` ⇒ `Public profile` ⇒ `Contributions & Activity`, y marca `Include private contributions on my profile`.
>
> Si quieres incluir actividades adicionales de repositorios privados, registra un token de acceso personal como secreto y configúralo en la variable de entorno `GITHUB_TOKEN` en el archivo de workflow. Sin embargo, en la mayoría de los casos el valor predeterminado `secrets.GITHUB_TOKEN` es suficiente.

La programación está configurada para ejecutarse una vez al día por defecto.
Puedes cambiar la hora programada como desees.

Esto agregará el workflow a tu repositorio.

#### Variables de entorno

En el ejemplo se especifican `GITHUB_TOKEN`, `USERNAME` y `EXTERNAL_SOURCES`, pero puedes usar las siguientes variables de entorno:

- `GITHUB_TOKEN` : (requerido) token de acceso
- `USERNAME` : (requerido) nombre de usuario objetivo (o especificar como argumento).
- `MAX_REPOS` : (opcional) número máximo de repositorios, por defecto 100 - desde ver. 0.2.0
- `SETTING_JSON` : (opcional) ruta del archivo json de configuración. Consulta `sample-settings/*.json` y `src/type.ts` en el repositorio `bittner/github-profile-3d-contrib` para más detalles. - desde ver. 0.6.0
- `GITHUB_ENDPOINT` : (opcional) endpoint de Github GraphQL. Por ejemplo, si quieres crear el calendario de contribuciones basado en la actividad de GitHub Enterprise de tu empresa en vez de GitHub.com, configura esta variable. Ejemplo: `https://github.mycompany.com/api/graphql` - desde ver. 0.8.0
- `YEAR` : (opcional) Para calendarios pasados, especifica el año. Pensado para ejecución desde la línea de comandos. - desde ver. 0.8.0
- `THEMES` : (opcional) lista separada por comas de los temas integrados que se generan cuando no se establece `SETTING_JSON`, p. ej. `green-animate,gitblock`. Disponibles: `green`, `green-animate`, `season`, `season-animate`, `south-season`, `south-season-animate`, `blue`, `blue-animate`, `rainbow`, `rainbow-animate`, `gitblock`, `gitblock-animate`. Todos por defecto. Todos los temas se adaptan automáticamente al modo oscuro del espectador.
- `EXTERNAL_SOURCES` : (opcional) array JSON de feeds de contribuciones de otras forjas, apilados sobre las barras de GitHub en sus propios colores. Cada entrada necesita `name` (etiqueta de la leyenda), `type` (`gitlab` para instancias de GitLab, `forgejo` para instancias de Forgejo/Gitea como Codeberg), `url` (URL base de la instancia) y `user`; `color` y `darkColor` (`#RRGGBB`, este último usado en modo oscuro) son opcionales. Consulta [Fuentes externas](#fuentes-externas) más abajo.

#### Sobre `GITHUB_TOKEN`

El valor `secrets.GITHUB_TOKEN` en la variable de entorno `GITHUB_TOKEN` es un token especial creado automáticamente por GitHub.

- GitHub Docs: [Uso de GITHUB_TOKEN para la autenticación en flujos de trabajo](https://docs.github.com/es/actions/tutorials/authenticate-with-github_token)

Si solo quieres generar el calendario de contribuciones para repositorios públicos, usa este valor.
No es necesario crear un secreto manualmente.

Si quieres incluir actividad de tus repositorios privados en el calendario de contribuciones, marca "Incluir contribuciones privadas en mi perfil" en la sección "Perfil público" de la configuración de tu perfil.

Además, si quieres incluir información adicional de actividad de repositorios privados, crea un token de acceso con los permisos adecuados.
Registra ese token como secreto con el nombre que desees (por ejemplo, `MY_PERSONAL_ACCESS_TOKEN`).
Ten en cuenta que los secretos creados por el usuario no pueden empezar por `GITHUB_`.

- GitHub Docs: [Secretos](https://docs.github.com/es/actions/concepts/security/secrets)

Configura ese secreto como valor de la variable de entorno `GITHUB_TOKEN`.

```diff
          env:
-           GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
+           GITHUB_TOKEN: ${{ secrets.MY_PERSONAL_ACCESS_TOKEN }}
            USERNAME: ${{ github.repository_owner }}
```

#### Sobre la hora de programación

En el ejemplo, está configurado para ejecutarse a las 18:00 UTC.
Esto es porque se ejecutará a medianoche JST, la hora local del autor.

```yaml
on:
  schedule: # 03:00 JST == 18:00 UTC
    - cron: "0 18 * * *"
```

Puedes cambiarlo a la hora que prefieras.
Se recomienda la medianoche (alrededor de las 3am) de tu hora local.
Recuerda que la hora debe especificarse en UTC.

### Paso 3. Ejecutar manualmente la acción de GitHub

La primera vez, ejecuta este workflow manualmente.

- `Actions` -> `Profile-3D-Contrib` -> `Run workflow`

Las imágenes de perfil se generan en las siguientes rutas:

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

Si especificas la variable de entorno `SETTING_JSON` sin la propiedad `fileName` en el archivo json, se generará la siguiente imagen:

- `profile-3d-contrib/profile-customize.svg`

Puedes usar estas imágenes en tu README.md como se muestra a continuación.

Ejemplo: versión green

![svg](https://raw.githubusercontent.com/bittner/github-profile-3d-contrib/main/docs/demo/profile-green-animate.svg)

Ejemplo: versión season (hemisferio norte)

![svg](https://raw.githubusercontent.com/bittner/github-profile-3d-contrib/main/docs/demo/profile-season-animate.svg)

Ejemplo: versión season (hemisferio sur)

![svg](https://raw.githubusercontent.com/bittner/github-profile-3d-contrib/main/docs/demo/profile-south-season-animate.svg)

Ejemplo: versión azul

![svg](https://raw.githubusercontent.com/bittner/github-profile-3d-contrib/main/docs/demo/profile-blue-animate.svg)

Ejemplo: versión arcoíris

![svg](https://raw.githubusercontent.com/bittner/github-profile-3d-contrib/main/docs/demo/profile-rainbow-animate.svg)

Ejemplo: versión git block

![svg](https://raw.githubusercontent.com/bittner/github-profile-3d-contrib/main/docs/demo/profile-gitblock.svg)

### Paso 4. Agregar imagen al README.md

Agrega la ruta de la imagen generada en tu archivo README.

Ejemplo:

```md
![](./profile-3d-contrib/profile-green-animate.svg)
```

#### Fuentes externas

Las contribuciones en GitLab (gitlab.com o una instancia propia) y en Forgejo/Gitea (p. ej. Codeberg) pueden añadirse al calendario. Se obtienen de los feeds públicos del perfil (`/users/<user>/calendar.json` y `/api/v1/users/<user>/heatmap`), por lo que no se necesitan tokens adicionales, y se dibujan como segmentos apilados sobre la barra de GitHub de cada día. Una leyenda nombra cada fuente. Las entradas de `EXTERNAL_SOURCES` del ejemplo de workflow anterior añaden gitlab.com y Codeberg.

El color de una fuente también puede establecerse (por tema) en el JSON de configuración con `sourceColors`, usando el nombre de la fuente como clave, p. ej. `"sourceColors": {"GitLab": "#fc6d26"}`; la misma clave dentro de `darkMode` lo sobrescribe para el modo oscuro. Establece `"sourceLegend": false` en el JSON de configuración para omitir la leyenda. La altura de la barra usa el recuento combinado, de modo que los segmentos de las plataformas comparten una misma escala logarítmica. Los recuentos externos se incluyen en el total de `contributions`, pero no en el gráfico de radar, cuyas categorías son específicas de GitHub.

## Cómo usar (GitHub Actions) - Ejemplos avanzados

- [Más información en EXAMPLES.md](../EXAMPLES.md)

## Cómo usar (local)

Configura la variable de entorno `GITHUB_TOKEN` con tu token de acceso personal.

```sh
export GITHUB_TOKEN=XXXXXXXXXXXXXXXXXXXXX
```

Ejecuta el siguiente comando, reemplazando `USER_NAME` por tu nombre de usuario de GitHub o el nombre de usuario objetivo.

```sh
node_modules/.bin/ts-node src/index.ts USER_NAME
```

o

```sh
npm run build
node . USER_NAME
```

Las variables de entorno `THEMES` y `EXTERNAL_SOURCES` descritas arriba también funcionan en las ejecuciones locales.

## Licencia

&copy; 2021 SATO Yoshiyuki. Licensed under the MIT License.
