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
};

export const OUTPUT_WIDGET_VERSION = outputBase.OUTPUT_WIDGET_VERSION;

export class OutputModel extends outputBase.OutputModel {
  defaults() {
    return _.extend(super.defaults(), {
      msg_id: ""
    });
  }

  initialize(attributes, options) {
    super.initialize(attributes, options);
    // The output area model is trusted since widgets are only rendered in trusted contexts.
    this._outputs = new OutputAreaModel({ trusted: true });
    this.listenTo(this, "change:msg_id", this.reset_msg_id);
    this.reset_msg_id();
  }

  reset_msg_id() {
    if (this._msgHook) {
      this._msgHook.dispose();
    }
    this._msgHook = null;

    let kernel = this.widget_manager.kernel;
    let msgId = this.get("msg_id");
    if (msgId && kernel) {
      this._msgHook = kernel.registerMessageHook(this.get("msg_id"), msg => {
        this.add(msg);
        return false;
      });
    }
  }

  add(msg) {
    let msgType = msg.header.msg_type;
    switch (msgType) {
      case "execute_result":
      case "display_data":
      case "stream":
      case "error":
        let model = msg.content;
        model.output_type = msgType;
        this._outputs.add(model);
        break;
      case "clear_output":
        this.clear_output(msg.content.wait);
        break;
      default:
        break;
    }
  }

  clear_output(wait = false) {
    this._outputs.clear(wait);
  }

  get outputs() {
    return this._outputs;
  }
  // widget_manager: WidgetManager;

  // private _msgHook: IDisposable = null;
  // private _outputs: OutputAreaModel;
}

export class OutputView extends outputBase.OutputView {
  _createElement(tagName) {
    this.pWidget = new Panel();
    return this.pWidget.node;
  }

  _setElement(el) {
    if (this.el || el !== this.pWidget.node) {
      // Boxes don't allow setting the element beyond the initial creation.
      throw new Error("Cannot reset the DOM element.");
    }

    this.el = this.pWidget.node;
    this.$el = $(this.pWidget.node);
  }

  /**
   * Called when view is rendered.
   */
  render() {
    this._outputView = new OutputArea({
      rendermime: this.model.widget_manager.rendermime,
      contentFactory: OutputArea.defaultContentFactory,
      model: this.model.outputs
    });
    // TODO: why is this a readonly property now?
    //this._outputView.model = this.model.outputs;
    // TODO: why is this on the model now?
    //this._outputView.trusted = true;
    this.pWidget.insertWidget(0, this._outputView);

    this.pWidget.addClass("jupyter-widgets");
    this.pWidget.addClass("widget-output");
    this.update(); // Set defaults.
  }

  /**
   * Update the contents of this view
   *
   * Called when the model is changed.  The model may have been
   * changed by another view or by a state update from the back-end.
   */
  update() {
    return super.update();
  }

  remove() {
    this._outputView.dispose();
    return super.remove();
  }

  // model: OutputModel;
  // _outputView: OutputArea;
  // pWidget: Panel
}

// const OutputModel = outputBase.OutputModel.extend({
//   defaults: _.extend({}, outputBase.OutputModel.prototype.defaults(), {
//     msg_id: "",
//     outputs: []
//   }),

//   initialize(attributes, options) {
//     OutputModel.__super__.initialize.apply(this, arguments);

//     this._outputs = new OutputAreaModel({
//       values: attributes.outputs,
//       // Widgets (including this output widget) are only rendered in
//       // trusted contexts
//       trusted: true
//     });

//     this._outputs.add({
//       output_type: DISPLAY_DATA,
//       data: { "text/plain": "Hello world" }
//     });

//     const kernel = options.widget_manager.kernel;
//     if (this.comm && kernel) {
//       this.kernel = kernel;
//       this.kernel.iopubMessage.connect((kernel, msg) => {
//         if (KernelMessage.isDisplayDataMsg(msg)) {
//           // if (!isMsgForModel(msg, this.model_id)) {
//           //   return;
//           // }
//           console.log(msg);
//           // this._outputs.add({
//           //   output_type: msg.msg_type,
//           //   data: msg.content.data,
//           //   metadata: msg.content.metadata,
//           // });
//         } else if (KernelMessage.isClearOutputMsg(msg)) {
//           if (!isMsgForModel(msg, this.model_id)) {
//             return;
//           }
//           console.log('Clear output');
//           // this._outputs.clear();
//         }
//       });
//     }
//   }
// });

// const OutputView = outputBase.OutputView.extend({
//   _createElement(tagName) {
//     this.pWidget = new Panel();
//     return this.pWidget.node;
//   },

//   _setElement(el) {
//     if (this.el || el !== this.pWidget.node) {
//       // Boxes don't allow setting the element beyond the initial creation.
//       throw new Error("Cannot reset the DOM element.");
//     }
//     this.el = this.pWidget.node;
//     this.$el = $(this.pWidget.node);
//   },

//   render() {
//     this.el.classList.add("jupyter-widgets-output-area");

//     this._outputView = new OutputArea({
//       rendermime: this.model.widget_manager.renderMime,
//       // Hack to get at the model's OutputAreaModel...
//       model: this.model._outputs
//     });

//     this.pWidget.insertWidget(0, this._outputView);
//     this.pWidget.addClass("jupyter-widgets");
//     this.pWidget.addClass("widget-output");

//     // OutputView.__super__.render.apply(this, arguments);
//   }
// });

// export default {
//   OutputView,
//   OutputModel
// };
