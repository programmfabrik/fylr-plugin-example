COFFEE_FILES = \
	webfrontend/FylrExampleCustomDataType.coffee \
	webfrontend/FylrExampleTransition.coffee

JS = webfrontend/FylrExample.js

PLUGIN_NAME = fylr-plugin-example

INSTALL_FILES = \
	customDataTypeUpdater/ \
	fas_config/ \
	l10n/ \
	server/ \
	$(JS) \
	$(WEB)/FylrExample.html \
	$(WEB)/FylrExample.css \
	manifest.yml

include lib/Makefile.inc

code: $(JS) ## build Coffeescript code

clean: ## clean build files
	rm -f $(JS)
	rm -rf build fylr-build

