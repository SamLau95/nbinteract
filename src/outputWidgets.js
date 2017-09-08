import outputBase from "@jupyter-widgets/output";
import _ from "underscore";

import outputArea from "./outputArea";

const OutputModel = outputBase.OutputModel.extend({
  defaults: _.extend({}, outputBase.OutputModel.prototype.defaults(), {
    msg_id: "",
    outputs: []
  }),

  initialize: function(attributes, options) {
    OutputModel.__super__.initialize.apply(this, arguments);
    this.listenTo(this, "change:msg_id", this.reset_msg_id);

    if (this.comm && this.comm.kernel) {
      this.kernel = this.comm.kernel;
      this.kernel.set_callbacks_for_msg(this.model_id, this.callbacks(), false);
    }

    // Create an output area to handle the data model part
    debugger;
    this.output_area = new outputArea.OutputArea({
      selector: document.createElement("div"),
      config: { data: { OutputArea: {} } },
      prompt_area: false,
      events: this.widget_manager.notebook.events,
      keyboard_manager: this.widget_manager.keyboard_manager
    });
    this.listenTo(
      this,
      "new_message",
      function(msg) {
        this.output_area.handle_output(msg);
        this.set("outputs", this.output_area.toJSON(), {
          newMessage: true
        });
        this.save_changes();
      },
      this
    );
    this.listenTo(this, "clear_output", function(msg) {
      this.output_area.handle_clear_output(msg);
      this.set("outputs", [], { newMessage: true });
      this.save_changes();
    });
    this.listenTo(this, "change:outputs", this.setOutputs);
    this.setOutputs();
  },

  // make callbacks
  callbacks: function() {
    // Merge our callbacks with the base class callbacks.
    var cb = OutputModel.__super__.callbacks.apply(this, arguments);
    var iopub = cb.iopub || {};
    var iopubCallbacks = _.extend({}, iopub, {
      output: function(msg) {
        this.trigger("new_message", msg);
        if (iopub.output) {
          iopub.output.apply(this, arguments);
        }
      }.bind(this),
      clear_output: function(msg) {
        this.trigger("clear_output", msg);
        if (iopub.clear_output) {
          iopub.clear_output.apply(this, arguments);
        }
      }.bind(this)
    });
    return _.extend({}, cb, { iopub: iopubCallbacks });
  },

  reset_msg_id: function() {
    var kernel = this.kernel;
    // Pop previous message id
    var prev_msg_id = this.previous("msg_id");
    if (prev_msg_id && kernel) {
      var previous_callback = kernel.output_callback_overrides_pop(prev_msg_id);
      if (previous_callback !== this.model_id) {
        console.error(
          "Popped wrong message (" +
            previous_callback +
            " instead of " +
            this.model_id +
            ") - likely the stack was not maintained in kernel."
        );
      }
    }
    var msg_id = this.get("msg_id");
    if (msg_id && kernel) {
      kernel.output_callback_overrides_push(msg_id, this.model_id);
    }
  },

  setOutputs: function(model, value, options) {
    if (!(options && options.newMessage)) {
      // fromJSON does not clear the existing output
      this.output_area.clear_output();
      // fromJSON does not copy the message, so we make a deep copy
      this.output_area.fromJSON(
        JSON.parse(JSON.stringify(this.get("outputs")))
      );
    }
  }
});

const OutputView = outputBase.OutputView.extend({
  render: function() {
    this.el.classList.add("jupyter-widgets-output-area");

    this.output_area = new outputArea.OutputArea({
      selector: this.el,
      // use default values for the output area config
      config: { data: { OutputArea: {} } },
      prompt_area: false,
      events: this.model.widget_manager.notebook.events,
      keyboard_manager: this.model.widget_manager.keyboard_manager
    });
    this.listenTo(
      this.model,
      "new_message",
      function(msg) {
        this.output_area.handle_output(msg);
      },
      this
    );
    this.listenTo(this.model, "clear_output", function(msg) {
      this.output_area.handle_clear_output(msg);
      // fake the event on the output area element. This can be
      // deleted when we can rely on
      // https://github.com/jupyter/notebook/pull/2411 being
      // available.
      this.output_area.element.trigger("clearing", {
        output_area: this
      });
    });
    // Render initial contents from the current model
    this.listenTo(this.model, "change:outputs", this.setOutputs);
    this.setOutputs();

    OutputView.__super__.render.apply(this, arguments);
  },

  setOutputs: function(model, value, options) {
    if (!(options && options.newMessage)) {
      // fromJSON does not clear the existing output
      this.output_area.clear_output();
      // fromJSON does not copy the message, so we make a deep copy
      this.output_area.fromJSON(
        JSON.parse(JSON.stringify(this.model.get("outputs")))
      );
    }
  }
});

export default {
  OutputView,
  OutputModel
};
