## Advanced example 1: different themes for light and dark mode + keeping output in other branch

Plain light/dark switching needs no setup: every generated image already contains both colour schemes and follows the viewer's preference by itself. This example is for the case where you want a *different theme* per colour scheme, here the green theme by day and the rainbow theme by night. It generates two files, `day.svg` and `night.svg`, and pushes them to the `output-3d-contrib` branch, keeping the main repo 'clean' from build artifacts.

The two settings must not contain a `darkMode` block: each file has to stay single-scheme, because the `<picture>` element in step 4 does the switching. An image that also switched internally would show the wrong scheme on dark pages.

### 1. Create special repository.

Create a repository on GitHub with the same name as your user name.

* e.g. If the user name is `octocat`, create a repository named `octocat/octocat`.
* ref. [Managing your profile README](https://docs.github.com/en/github/setting-up-and-managing-your-github-profile/managing-your-profile-readme)

In this repository, do the following.

### 2. Create `conf/github-profile-3d-contrib.json` file in your <username> repo:
```json:conf/github-profile-3d-contrib.json
[
    {
        "type": "normal",
        "fileName": "day.svg",
        "backgroundColor": "#ffffff",
        "foregroundColor": "#00000f",
        "strongColor": "#111133",
        "weakColor": "gray",
        "radarColor": "#47a042",
        "growingAnimation": true,
        "contribColors": [
            "#efefef",
            "#d8e887",
            "#8cc569",
            "#47a042",
            "#1d6a23"
        ]
    },
    {
        "type": "rainbow",
        "fileName": "night.svg",
        "backgroundColor": "#00000f",
        "foregroundColor": "#eeeeff",
        "strongColor": "rgb(255,200,55)",
        "weakColor": "#aaaaaa",
        "radarColor": "rgb(255,200,55)",
        "growingAnimation": true,
        "saturation": "50%",
        "contribLightness": [
            "20%",
            "30%",
            "35%",
            "40%",
            "50%"
        ],
        "duration": "10s",
        "hueRatio": -7
    }
]
```

### 3. Create `.github/workflows/profile-3d-contrib.yml` workflow file in your <username> repo:
```yaml:.github/workflows/profile-3d-contrib.yml
name: generate 3d chart for profile contributions

on:
  # run automatically every 24 hours
  schedule:
    - cron: "0 */24 * * *" 
  
  # allows to manually run the job at any time
  workflow_dispatch:
  
  # run on every push on the main branch
  # don't forget to change if you're using 'master' branch
  push:
    branches:
    - main

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
          SETTING_JSON: conf/github-profile-3d-contrib.json
          EXTERNAL_SOURCES: >-
            [
              {"name": "GitLab", "type": "gitlab", "url": "https://gitlab.com", "user": "octocat", "color": "#fc6d26"},
              {"name": "Codeberg", "type": "forgejo", "url": "https://codeberg.org", "user": "octocat", "color": "#2185d0"}
            ]

      # push the content of <build_dir> to a branch
      # the content will be available at https://raw.githubusercontent.com/<github_user>/<repository>/<target_branch>/<file> , or as github page
      - name: push SVGs to the output-3d branch
        uses: crazy-max/ghaction-github-pages@v3.1.0
        with:
          target_branch: output-3d-contrib
          build_dir: profile-3d-contrib
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 4. Edit `README.md` in your <username> repo, adding the following code:
Do not forget to replace `<github_user>` and `<repository>` with your GitHub username.
```html
<p align="center" >
	<picture>
	  <source media="(prefers-color-scheme: dark)"  srcset="https://raw.githubusercontent.com/<github_user>/<repository>/output-3d-contrib/night.svg" />
	  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/<github_user>/<repository>/output-3d-contrib/day.svg" />
	  <img alt="github profile contributions chart"    src="https://raw.githubusercontent.com/<github_user>/<repository>/output-3d-contrib/day.svg" />
	</picture>
</p>
```
