# https://tagexplorer.github.io

A convenient explorer for Danbooru tags that you can use on Danbooru-trained diffusion models.

![](./screenshot.png)

To run the development server locally:

```
npm install
npm run dev
```

To build to `./dist`:

```
npm run build
npm run preview # preview your build locally
```

To run tests:

```
npm run test:visual
# or in Playwright UI mode
npm run test:visual:ui
```

To regen Playwright snapshots if you've confirmed the tests should pass:

```
npm run regen-screenshots
```

### Known issues

Some of the images in this repository use filenames incompatible with Windows filesystems (backslash usage). WSL is recommended as a workaround when running into related issues.
