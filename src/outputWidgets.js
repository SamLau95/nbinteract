import _ from "underscore";
import * as outputBase from "@jupyter-widgets/output";
import { OutputAreaModel, OutputArea } from "@jupyterlab/outputarea";
import { KernelMessage } from "@jupyterlab/services";
import { Panel } from "@phosphor/widgets";

const DISPLAY_DATA = "display_data";
const CLEAR_OUTPUT = "clear_output";

const WIDGET_MSG = "application/vnd.jupyter.widget-view+json";
const V_MAJOR = 2;

const isMsgForModel = ({ content }, model_id) => {
  const data = content.data;
  if (!data) {
    return false;
  }

  return data.version_major == V_MAJOR && data.model_id == model_id;
}

const OutputModel = outputBase.OutputModel.extend({
  defaults: _.extend({}, outputBase.OutputModel.prototype.defaults(), {
    msg_id: "",
    outputs: []
  }),

  initialize(attributes, options) {
    OutputModel.__super__.initialize.apply(this, arguments);

    this._outputs = new OutputAreaModel({
      values: attributes.outputs,
      // Widgets (including this output widget) are only rendered in
      // trusted contexts
      trusted: true
    });

    this._outputs.add({
      output_type: DISPLAY_DATA,
      data: { "text/plain": "Hello world" }
    });

    const kernel = options.widget_manager.kernel;
    if (this.comm && kernel) {
      this.kernel = kernel;
      this.kernel.iopubMessage.connect((kernel, msg) => {
        if (KernelMessage.isDisplayDataMsg(msg)) {
          // if (!isMsgForModel(msg, this.model_id)) {
          //   return;
          // }
          console.log(msg);
          // this._outputs.add({
          //   output_type: msg.msg_type,
          //   data: msg.content.data,
          //   metadata: msg.content.metadata,
          // });
        } else if (KernelMessage.isClearOutputMsg(msg)) {
          if (!isMsgForModel(msg, this.model_id)) {
            return;
          }
          console.log('Clear output');
          // this._outputs.clear();
        }
      });
    }
  }
});

const OutputView = outputBase.OutputView.extend({
  _createElement(tagName) {
    this.pWidget = new Panel();
    return this.pWidget.node;
  },

  _setElement(el) {
    if (this.el || el !== this.pWidget.node) {
      // Boxes don't allow setting the element beyond the initial creation.
      throw new Error("Cannot reset the DOM element.");
    }
    this.el = this.pWidget.node;
    this.$el = $(this.pWidget.node);
  },

  render() {
    this.el.classList.add("jupyter-widgets-output-area");

    this._outputView = new OutputArea({
      rendermime: this.model.widget_manager.renderMime,
      // Hack to get at the model's OutputAreaModel...
      model: this.model._outputs
    });

    this.pWidget.insertWidget(0, this._outputView);
    this.pWidget.addClass("jupyter-widgets");
    this.pWidget.addClass("widget-output");

    // OutputView.__super__.render.apply(this, arguments);
  }
});

export default {
  OutputView,
  OutputModel
};
