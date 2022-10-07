
help:
	@grep -h -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

# public targets

fylr: ## build for fylr
	$(MAKE) BUILD_DIR=fylr-build/$(PLUGIN_NAME) buildcommon code

build: ## build for easydb 5
	$(MAKE) BUILD_DIR=build buildcommon code

# internal targets, common

SELF_DIR := $(dir $(lastword $(MAKEFILE_LIST)))
L10N2JSON = $(SELF_DIR)/l10n2json.py
# workaround for #65322
NODE_OPTIONS=$(shell [ -z `nodejs --version | xargs semver -r '>=13'` ] || echo '--openssl-legacy-provider')

buildinfojson:
	repo=`git remote get-url origin | sed -e 's/\.git$$//' -e 's#.*[/\\]##'` ;\
	rev=`git show --no-patch --format=%H` ;\
	lastchanged=`git show --no-patch --format=%ad --date=format:%Y-%m-%dT%T%z` ;\
	builddate=`date +"%Y-%m-%dT%T%z"` ;\
	echo '{' > build-info.json ;\
	echo '  "repository": "'$$repo'",' >> build-info.json ;\
	echo '  "rev": "'$$rev'",' >> build-info.json ;\
	echo '  "lastchanged": "'$$lastchanged'",' >> build-info.json ;\
	echo '  "builddate": "'$$builddate'"' >> build-info.json ;\
	echo '}' >> build-info.json

buildcommon:
	mkdir -p $(BUILD_DIR)
	[ ! -f package.json ] || ( NODE_OPTIONS=$(NODE_OPTIONS) npm install && cp -r node_modules $(BUILD_DIR) )
	[ -z  "$(WEBPACK_CONFIG)" ] || NODE_OPTIONS=$(NODE_OPTIONS) \
		./node_modules/webpack/bin/webpack.js --config "$(WEBPACK_CONFIG)"

code: $(JS) $(CSS) $(L10N) $(WEBHOOK_JS)

google_csv:
	chmod u+w $(L10N_FILES)
	curl --silent -L -o - "https://docs.google.com/spreadsheets/u/1/d/$(L10N_GOOGLE_KEY)/export?format=csv&id=$(L10N_GOOGLE_KEY)&gid=$(L10N_GOOGLE_GID)" | sed -e 's/[[:space:]]*$$//' > $(L10N_FILES)
	chmod a-w $(L10N_FILES)
	$(MAKE) WEB=build/webfrontend build-stamp-l10n

build-stamp-l10n: $(L10N_FILES)
	@[ ! -z "${WEB}" ] || (echo "WEB is unset"; false)
	mkdir -p $(WEB)/l10n
	$(L10N2JSON) $(L10N_FILES) $(WEB)/l10n
	touch $@

%.coffee.js: %.coffee
	coffee -b -p --compile "$^" > "$@" || ( rm -f "$@" ; false )

clean-base:
	rm -f $(L10N) $(subst .coffee,.coffee.js,${COFFEE_FILES}) $(JS) $(SCSS)
	rm -f $(subst .coffee,.coffee.js,${WEBHOOK_FILES}) $(WEBHOOK_JS)
	rm -f $(WEB)/l10n/*.json
	rm -f build-stamp-l10n
	rm -rf build

install-files: ${INSTALL_FILES}
	@[ ! -z "${WEB}" ] || (echo "WEB is unset"; false)
	@[ ! -z "${INSTALL_PREFIX}" ] || (echo "INSTALL_PREFIX is unset"; false)
	mkdir -p ${INSTALL_PREFIX}/server/base/plugins/${PLUGIN_PATH}
	for f in ${INSTALL_FILES}; do \
		mkdir -p ${INSTALL_PREFIX}/server/base/plugins/${PLUGIN_PATH}/`dirname $$f`; \
		if [ -d "$$f" ]; then \
			cp -Pr $$f ${INSTALL_PREFIX}/server/base/plugins/${PLUGIN_PATH}/`dirname $$f`; \
		else \
			cp $$f ${INSTALL_PREFIX}/server/base/plugins/${PLUGIN_PATH}/$$f; \
		fi; \
	done
	if [ -f "build-info.json" ]; then \
		cp "build-info.json" "${INSTALL_PREFIX}/server/base/plugins/${PLUGIN_PATH}/build-info.json"; \
	fi

# internal targets, fylr

# internal targets, easydb 5

install-server:
	$(MAKE) WEB=build/webfrontend install-files

build/webfrontend/%: src/webfrontend/%
	mkdir -p $(dir $@)
	cp $^ $@

.PHONY: help all fylr build buildcommon buildinfojson code install-server install-files google_csv

# vim:set ft=make:
