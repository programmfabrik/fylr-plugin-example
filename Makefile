COFFEE_FILES = \
	webfrontend/FylrExampleCustomDataType.coffee \
	webfrontend/ExampleDetailSidebarPlugin.coffee \
	webfrontend/FylrExampleCustomDatamodelSettings.coffee \
	webfrontend/FylrExampleTransition.coffee \
	webfrontend/FylrExampleExportPluginSleep.coffee

JS = webfrontend/FylrExample.js

PLUGIN_NAME = fylr_example
ZIP_NAME ?= $(PLUGIN_NAME).zip
BUILD_DIR = build
BUILD_INFO = build-info.json

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

all: build ## build all

build: clean code buildinfojson ## build all (creates build folder)
	mkdir -p $(BUILD_DIR)/$(PLUGIN_NAME)
	cp manifest.master.yml $(BUILD_DIR)/$(PLUGIN_NAME)/manifest.yml
	cp $(BUILD_INFO) $(BUILD_DIR)/$(PLUGIN_NAME)
	cp -r server l10n fas_config customDataTypeUpdater $(BUILD_DIR)/$(PLUGIN_NAME)
# remove Go stuff
	rm -rf $(BUILD_DIR)/$(PLUGIN_NAME)/server/extension/hello/*
	cp -r server/extension/hello/*.exe $(BUILD_DIR)/$(PLUGIN_NAME)/server/extension/hello

	mkdir -p $(BUILD_DIR)/$(PLUGIN_NAME)/webfrontend
	cp -r $(JS) webfrontend/FylrExample.html webfrontend/*.css $(BUILD_DIR)/$(PLUGIN_NAME)/webfrontend
# for zip release: include Readme.md
	cp README.md $(BUILD_DIR)/$(PLUGIN_NAME)/webfrontend

code: $(JS) go ## build Coffeescript + Go code

go:
	$(MAKE) -C server/extension/hello build

zip: build ## build zip file for publishing
	cd $(BUILD_DIR) && zip $(ZIP_NAME) -r $(PLUGIN_NAME)

clean: ## clean build files
	rm -f $(JS)
	rm -f ${BUILD_INFO}
	rm -rf $(BUILD_DIR)
	$(MAKE) -C server/extension/hello clean

${JS}: $(subst .coffee,.coffee.js,${COFFEE_FILES})
	mkdir -p $(dir $@)
	cat $^ > $@

%.coffee.js: %.coffee
	coffee -b -p --compile "$^" > "$@" || ( rm -f "$@" ; false )

buildinfojson:
	repo=`git remote get-url origin | sed -e 's/\.git$$//' -e 's#.*[/\\]##'` ;\
	rev=`git show --no-patch --format=%H` ;\
	lastchanged=`git show --no-patch --format=%ad --date=format:%Y-%m-%dT%T%z` ;\
	builddate=`date +"%Y-%m-%dT%T%z"` ;\
	release=$(if $(strip $(RELEASE_TAG)),'"$(RELEASE_TAG)"','null') ;\
	echo '{' > ${BUILD_INFO} ;\
	echo '  "repository": "'$$repo'",' >> ${BUILD_INFO} ;\
	echo '  "rev": "'$$rev'",' >> ${BUILD_INFO} ;\
	echo '  "release": '$$release',' >> ${BUILD_INFO} ;\
	echo '  "lastchanged": "'$$lastchanged'",' >> ${BUILD_INFO} ;\
	echo '  "builddate": "'$$builddate'"' >> ${BUILD_INFO} ;\
	echo '}' >> ${BUILD_INFO}
