# FYLR Example Plugin

A comprehensive collection of plugin examples for [FYLR](https://fylr.io), demonstrating how to implement both **frontend** and **server-side** plugins.

> ⚠️ **Warning**: This plugin is intended for **educational purposes only** and should not be used in production environments. It may expose private information such as internal configuration without authentication.

## Table of Contents

- [Overview](#overview)
- [Requirements](#requirements)
- [Installation](#installation)
- [Frontend Plugin Examples](#frontend-plugin-examples)
  - [Custom Data Type](#custom-data-type)
  - [Detail Sidebar Plugin](#detail-sidebar-plugin)
  - [Custom Datamodel Settings](#custom-datamodel-settings)
  - [Transition Action](#transition-action)
  - [Export Plugin](#export-plugin)
- [Server Plugin Examples](#server-plugin-examples)
  - [API Extensions](#api-extensions)
  - [Callbacks](#callbacks)
  - [Export Callbacks](#export-callbacks)
  - [Collection Upload](#collection-upload)
  - [FAS Config (Produce Recipes)](#fas-config-produce-recipes)
- [Configuration Examples](#configuration-examples)
  - [Base Config](#base-config)
  - [System Rights](#system-rights)
  - [Custom Events](#custom-events)
- [Build](#build)
- [Project Structure](#project-structure)
- [Contact](#contact)

## Overview

This plugin provides working examples for the most common plugin extension points in FYLR:

| Category | Examples |
|----------|----------|
| **Frontend** | Custom Data Types, Detail Sidebar Plugins, Datamodel Settings, Transitions, Export Plugins |
| **Server** | API Extensions, db_pre_save Callbacks, Export Callbacks, Validation, Collection Upload |
| **Configuration** | Base Config, System Rights, Custom Events |
| **Asset Processing** | FAS Cookbooks, Custom Produce Recipes |

## Requirements

- **FYLR** v6.0 or higher
- **CoffeeScript** 1.12.7 (for building frontend code)
- **Node.js** (for server-side JavaScript plugins)
- **Python 3** (for server-side Python plugins)
- **Go** (optional, for building the Go extension example)

## Installation

### From Release

1. Download the latest release ZIP from the [Releases](https://github.com/programmfabrik/fylr-plugin-example/releases) page
2. Upload the ZIP file via FYLR's plugin manager or extract it to your plugins directory

### From Source

```bash
git clone https://github.com/programmfabrik/fylr-plugin-example.git
cd fylr-plugin-example
make build
```

The built plugin will be available in the `build/` directory.

---

## Frontend Plugin Examples

All frontend plugins are written in **CoffeeScript** and located in the `webfrontend/` directory.

### Custom Data Type

**File:** `webfrontend/FylrExampleCustomDataType.coffee`

Demonstrates how to create a custom data type with:
- Custom editor input fields (text, number, localized text)
- Detail output rendering
- Standard and fulltext support
- Schema and mask settings display
- Mapping support for data export

```coffeescript
class FylrExampleCustomDataType extends CustomDataType
    getCustomDataTypeName: ->
        "custom:base.fylr_example.example"

    renderEditorInput: (data, top_level_data, opts) ->
        # Custom form with multiple field types

    getSaveData: (data, save_data, opts) ->
        # Prepare data for saving with _fulltext and _standard
```

**Manifest configuration:**
```yaml
custom_types:
  example:
    mapping:
      textfield:
        type: text_oneline
      numberfield:
        type: number
      locafield:
        type: text_l10n
```

### Detail Sidebar Plugin

**File:** `webfrontend/ExampleDetailSidebarPlugin.coffee`

Shows how to add a custom button to the detail sidebar that opens an extended standard view rendered by a server-side Python script.

```coffeescript
class DetailSidebarRender extends DetailSidebarPlugin
    prefName: -> "example_detail_sidebar_plugin"
    getPane: -> "top"
    getButtonLocaKey: -> "example.detail.sidebar.plugin.render_object"
```

### Custom Datamodel Settings

**File:** `webfrontend/FylrExampleCustomDatamodelSettings.coffee`

Demonstrates how to add custom settings to the datamodel editor (schema configuration).

```coffeescript
class FylrExampleCustomDataModelSettings extends SchemaPlugin
    getCustomSettings: (data) ->
        # Return custom form fields for schema configuration

    getCustomSettingsLabel: (data) ->
        return "FYLR example"
```

### Transition Action

**File:** `webfrontend/FylrExampleTransition.coffee`

Shows how to register a custom transition action that can be triggered during workflow transitions.

```coffeescript
class FylrExampleTransition extends TransitionActionAction
    @getType: -> "fylr_example:set_comment"
    @getDisplayName: -> "Comment"

    getSaveData: ->
        type: FylrExampleTransition.getType()
        info:
            comment: "horst"
```

### Export Plugin

**File:** `webfrontend/FylrExampleExportPluginSleep.coffee`

Demonstrates how to create a custom export plugin with configurable options.

```coffeescript
class FylrExampleExportPluginSleep extends ExportManagerPlugin
    name: -> "fylr_example:sleep"
    nameLocalized: -> "Sleep"

    renderForm: ->
        # Custom form with seconds input

    getExportData: ->
        # Add produce_options.seconds to export data
```

---

## Server Plugin Examples

Server-side plugins can be written in **JavaScript (Node.js)**, **Python 3**, or **Go**.

### API Extensions

Located in `server/extension/`, these examples show how to create custom API endpoints.

| Endpoint | Language | Description |
|----------|----------|-------------|
| `dump/empty` | Node.js | Basic stdin/stdout passthrough |
| `dump/sleep` | Python | Delayed response example |
| `dump/signature` | Python | Request signature handling |
| `dump/info` | Node.js | Dump request info |
| `dump/plugin_user` | Python | Using plugin user authentication |
| `dump/hello` | Go | Compiled binary extension |
| `dump/error*` | Node.js | Error handling examples |
| `dump/file` | Node.js | Write stdin to file |
| `render/standard_extended` | Python | Render object as HTML page |

**Example API extension configuration:**
```yaml
extensions:
  dump/info:
    exec:
      service: "node"
      commands:
        - prog: "node"
          stdin:
            type: "body"
          stdout:
            type: "body"
          args:
            - type: "value"
              value: "%_exec.pluginDir%/server/extension/dump_info.js"
            - type: "value"
              value: "%info.json%"
```

### Callbacks

#### db_pre_save

Located in `server/db_pre_save+webhook/`, these callbacks are executed before objects are saved.

| Callback | Description |
|----------|-------------|
| `set_comment` | Adds a comment to objects before saving |
| `check` | Validates the 'name' field |
| `bounce` | Returns the input JSON unchanged |
| `validation_errors` | Demonstrates validation error responses |
| `write_event` | Writes custom events on insert/update |

**Configuration example:**
```yaml
callbacks:
  db_pre_save:
    steps:
      - name: "set comment for 'object'"
        callback: set_comment
        filter:
          type: objecttype
          objecttypes:
            - object
```

#### transition_db_pre_save

Same callbacks can be used for transition-triggered saves.

### Export Callbacks

Located in `server/export/`, these handle custom export processing.

| Callback | Description |
|----------|-------------|
| `md5_sums` | Calculates MD5 checksums for exported files |
| `sleep` | Simulates long-running export process |
| `error` | Error handling example |

### Export Transport Callbacks

Located in `server/export_transport/`, these handle file transport after export.

| Callback | Description |
|----------|-------------|
| `copy_file` | Copies exported files to a destination |
| `error` | Error handling example |

### Collection Upload

Located in `server/collection/`, demonstrates custom handling for collection uploads.

**File:** `server/collection/filename_copy/objects.js`

Handles the `objects` callback for collection uploads with custom configuration.

```yaml
collection_upload:
  filename_copy:
    config:
      - name: filename_copy
        parameters:
          filename_target:
            type: text
    callbacks:
      objects:
        exec:
          service: "node"
          commands:
            - prog: "node"
              stdin:
                type: body
              stdout:
                type: body
              args:
                - type: "value"
                  value: "%_exec.pluginDir%/server/collection/filename_copy/objects.js"
```

### FAS Config (Produce Recipes)

Located in `fas_config/`, these examples show how to create custom asset processing recipes.

| Cookbook | Description |
|----------|-------------|
| `cookbook_metadata_example.yml` | Add custom metadata to assets |
| `cookbook_metadata_pdf2text.yml` | Extract text from PDF files |
| `cookbook_grayscale.yml` | Convert images to grayscale |

**Custom produce configuration:** `fas_config/custom_produce.yml`

---

## Configuration Examples

### Base Config

The plugin demonstrates various base configuration parameter types:

```yaml
base_config:
  - name: comment
    parameters:
      value:
        type: text
  - name: custom
    parameters:
      on_off:
        type: bool
      data:
        type: json
  - name: user
    parameters:
      api_user:
        type: user
  - name: booleans
    parameters:
      default_true:
        type: bool
        default: true
```

### System Rights

Shows how to define custom system rights with various parameter types:

```yaml
system_rights:
  - name: example_right
    parameters:
      - name: bool
        type: bool
      - name: int
        type: int
      - name: text
        type: text
      - name: string-list
        type: string-list
        choices: [ a, b, c ]
      - name: mask-select
        type: mask-select
      - name: pool-select
        type: pool-select
```

### Custom Events

Register custom events that can be logged by plugins:

```yaml
custom_events:
  EXAMPLE_PLUGIN_OBJECT_STATISTICS:
    user: true
  FYLR_EXAMPLE_EVENT:
    user: true
```

---

## Build

```bash
# Show available commands
make help

# Build everything
make build

# Build only CoffeeScript code
make code

# Build Go extension
make go

# Create ZIP for distribution
make zip

# Clean build artifacts
make clean
```

---

## Project Structure

```
fylr-plugin-example/
├── manifest.master.yml          # Plugin manifest with all configurations
├── Makefile                     # Build system
├── README.md                    # This file
├── l10n/                        # Localization files
│   └── example-loca.csv
├── webfrontend/                 # Frontend plugins (CoffeeScript)
│   ├── FylrExampleCustomDataType.coffee
│   ├── ExampleDetailSidebarPlugin.coffee
│   ├── FylrExampleCustomDatamodelSettings.coffee
│   ├── FylrExampleTransition.coffee
│   ├── FylrExampleExportPluginSleep.coffee
│   ├── FylrExample.html
│   ├── FylrExample.css
│   └── dump.css
├── server/                      # Server-side plugins
│   ├── extension/               # API extensions
│   │   ├── empty.js
│   │   ├── dump_info.js
│   │   ├── sleep.py
│   │   ├── signature.py
│   │   ├── plugin_user.py
│   │   ├── hello/               # Go extension
│   │   │   └── main.go
│   │   └── render/
│   │       └── standard_extended.py
│   ├── db_pre_save+webhook/     # Pre-save callbacks
│   │   ├── set_comment.js
│   │   ├── check.js
│   │   └── cat.js
│   ├── db_pre_save+write_event/ # Event writing
│   │   └── write_event.py
│   ├── validation_errors/       # Validation examples
│   │   └── validation_errors.js
│   ├── export/                  # Export callbacks
│   │   ├── md5_sums.js
│   │   ├── sleep.py
│   │   └── error.js
│   ├── export_transport/        # Transport callbacks
│   │   ├── copy_file.js
│   │   └── error.js
│   ├── collection/              # Collection upload
│   │   └── filename_copy/
│   │       └── objects.js
│   ├── recipe/                  # Custom recipes
│   │   └── grayscale.py
│   └── scheduled/               # Scheduled tasks
│       └── example.py
├── fas_config/                  # Asset processing config
│   ├── custom_produce.yml
│   ├── cookbook_metadata_example.yml
│   ├── cookbook_metadata_pdf2text.yml
│   └── cookbook_grayscale.yml
└── customDataTypeUpdater/       # Custom data type updater
    ├── update.js
    └── dv.js
```

---

## Contact

For issues and questions, please write to **support@programmfabrik.de**

---

## License

See [LICENSE](LICENSE) file.
