# Chromium source tarball

Automatically generate source tarballs for Chromium releases channel, and upload
them to the
[releases](https://github.com/zcbenz/chromium-source-tarball/releases) page.

Unlike the offical source tarballs which only contains dependencies for Linux
that specified for Linux packagers, source tarballs in this repo includes the
dependencies of all platforms.

## Usage

### 1. Bootstrap

```bash
$ ./script/bootstrap
```

### 2. Generate the source tarball

```bash
$ ./script/sync 38.0.2125.101
```

### 3. Upload generated source tarball to GitHub Release

```bash
$ ./script/upload
```

## Keep updated with Chrome Releases blog

The source tarballs in this repo are kept updated with the
[Chrome Releases](http://googlechromereleases.blogspot.com) blog, you can find
the script under `script/chrome_releases_monitor/`.

## License

The code of this project is published under public domain.
