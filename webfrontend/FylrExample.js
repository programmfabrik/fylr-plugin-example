// Generated by CoffeeScript 1.12.7
var FylrExampleCustomDataType,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

FylrExampleCustomDataType = (function(superClass) {
  extend(FylrExampleCustomDataType, superClass);

  function FylrExampleCustomDataType() {
    return FylrExampleCustomDataType.__super__.constructor.apply(this, arguments);
  }

  FylrExampleCustomDataType.prototype.getCustomDataTypeName = function() {
    return "custom:base.fylr_example.example";
  };

  FylrExampleCustomDataType.prototype.getCustomDataOptionsInDatamodelInfo = function(custom_settings) {
    var ref;
    console.debug("getCustomDataOptionsInDatamodelInfo", custom_settings);
    if ((ref = custom_settings.fylr_example_config) != null ? ref.value : void 0) {
      return ["true"];
    } else {
      return ["false"];
    }
  };

  FylrExampleCustomDataType.prototype.initData = function(data) {
    if (!data[this.name()]) {
      return data[this.name()] = {};
    }
  };

  FylrExampleCustomDataType.prototype.renderDetailOutput = function(data, top_level_data, opts) {
    var cdata, div;
    cdata = data[this.name()];
    console.debug("renderDetailOutput", cdata, cdata.textfield);
    div = CUI.dom.element("DIV");
    CUI.dom.append(div, new CUI.Label({
      text: cdata.textfield
    }));
    CUI.dom.append(div, new CUI.Label({
      text: cdata.numberfield
    }));
    return div;
  };

  FylrExampleCustomDataType.prototype.renderEditorInput = function(data, top_level_data, opts) {
    var cdata, div, form, mask_settings, od, schema_settings;
    this.initData(data);
    cdata = data[this.name()];
    form = new CUI.Form({
      data: cdata,
      fields: [
        {
          form: {
            label: "textfield"
          },
          type: CUI.Input,
          name: "textfield"
        }, {
          form: {
            label: "numberfield"
          },
          type: CUI.NumberInput,
          name: "numberfield"
        }
      ],
      onDataChanged: (function(_this) {
        return function() {
          return CUI.Events.trigger({
            node: form,
            type: "editor-changed"
          });
        };
      })(this)
    }).start();
    schema_settings = this.getCustomSchemaSettings();
    mask_settings = this.getCustomMaskSettings();
    od = new CUI.ObjectDumper({
      header_left: "mask/schema settings",
      do_open: true,
      object: {
        schema: schema_settings,
        mask: mask_settings
      }
    });
    div = CUI.dom.element("DIV");
    CUI.dom.append(div, form);
    CUI.dom.append(div, od);
    return div;
  };

  FylrExampleCustomDataType.prototype.getSaveData = function(data, save_data, opts) {
    var cdata, ref;
    cdata = data[this.name()] || ((ref = data._template) != null ? ref[this.name()] : void 0) || {};
    cdata._expires_at = (new Date()).toISOString();
    save_data[this.name()] = CUI.util.copyObject(cdata, true);
    console.info("getSaveData", save_data[this.name()]);
  };

  FylrExampleCustomDataType.prototype.isSourceForMapping = function() {
    return true;
  };

  return FylrExampleCustomDataType;

})(CustomDataType);

CustomDataType.register(FylrExampleCustomDataType);
// Generated by CoffeeScript 1.12.7
var FylrExampleTransition,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

FylrExampleTransition = (function(superClass) {
  extend(FylrExampleTransition, superClass);

  function FylrExampleTransition() {
    return FylrExampleTransition.__super__.constructor.apply(this, arguments);
  }

  FylrExampleTransition.prototype.getListViewColumn = function() {
    return {
      type: CUI.Output,
      text: "Comment"
    };
  };

  FylrExampleTransition.prototype.getSaveData = function() {
    var sd;
    sd = {
      type: FylrExampleTransition.getType(),
      info: {
        comment: "horst"
      }
    };
    return sd;
  };

  FylrExampleTransition.getType = function() {
    return "fylr_example:set_comment";
  };

  FylrExampleTransition.getDisplayName = function() {
    return "Comment";
  };

  return FylrExampleTransition;

})(TransitionActionAction);

TransitionAction.registerAction(FylrExampleTransition);