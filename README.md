# fylr-plugin-example

The reference fylr plugin — it exercises most plugin features (api extensions,
server callbacks, webfrontend, custom data type, base config, system rights,
fas config, loca, a cross-compiled Go server extension) and shows **how fylr
plugins are built and released**. fylr's apitests run against this plugin's
latest release.

## Building

Built by [fylr-build-plugin](https://github.com/programmfabrik/fylr-build-plugin);
the Makefile is a thin shim. Run `make` for the target list:

```sh
make build   # assemble build/fylr_example/ — loadable by fylr from disk
make zip     # release zip (top-level dir = plugin name, as fylr requires)
make loca    # pull l10n/example-loca.csv from its Google Sheets master
make clean
```

[build.yml](./build.yml) is the explicit build description — server and
webfrontend delivery lists, CoffeeScript bundle order, a vendored plain-JS
library appended to that bundle, SCSS, Go extensions, the loca sheet — and
exercises every fylr-build-plugin feature. The safety
net against an incomplete list is `check` (runs with every build): it warns
about every path `manifest.yml` references that is missing from the build
folder (this plugin triggers two such warnings on purpose, see build.yml).
Generated artifacts are not committed — dev and CI compile from source (needs
`coffee`, `sass`, and `go` for the hello extension).

For development, point the fylr server at the build folder in `fylr.yml`
(`build/`, not the repo root):

```yaml
plugin:
    paths+:
        - ../fylr-plugin-example/build
```

## Releasing

A manager publishes a release on the GitHub release page (tag `vX.Y.Z`);
[the workflow](.github/workflows/release.yaml) builds and attaches
`fylr-plugin-example.zip`, which fylr installs by URL:

```
https://github.com/programmfabrik/fylr-plugin-example/releases/latest/download/fylr-plugin-example.zip
```

The loca CSV is mastered in the "fylr localization" Google Sheet (tab
`fylr-plugin-example`) — edit there and `make loca`, never edit the CSV
directly.

## Contact

For issues and questions please write to support@programmfabrik.de
