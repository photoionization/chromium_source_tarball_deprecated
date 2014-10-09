# Chromium source tarball

Automatically generate source tarballs for Chromium stable releases, and upload
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
