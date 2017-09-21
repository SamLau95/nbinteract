import { HTMLManager } from "@jupyter-widgets/html-manager";
import * as controls from "@jupyter-widgets/controls";
import { Widget } from "@phosphor/widgets";
import * as base from "@jupyter-widgets/base";
import { RenderMime, defaultRendererFactories } from "@jupyterlab/rendermime";

import * as outputWidgets from "./outputWidgets";

import "@jupyter-widgets/controls/css/widgets.css";

export class WidgetManager extends HTMLManager {
  constructor(kernel, $cells) {
    super();
    this.kernel = kernel;
    this.newKernel(kernel);
    this.$cells = $cells;
    this.rendermime = new RenderMime({
      initialFactories: defaultRendererFactories
    });
  }

  newKernel(kernel) {
    if (this._commRegistration) {
      this._commRegistration.dispose();
    }
    if (!kernel) {
      return;
    }
    this._commRegistration = kernel.registerCommTarget(
      this.comm_target_name,
      (comm, msg) => {
        this.handle_comm_open(new base.shims.services.Comm(comm), msg);
      }
    );
  }

  display_view(msg, view, { el }) {
    return Promise.resolve(view).then(view => {
      Widget.attach(view.pWidget, el);
      view.on("remove", () => {
        console.log("View removed", view);
      });
      return view;
    });
  }

  /**
   * Create a comm.
   */
  _create_comm(target_name, model_id, data = undefined, metadata = undefined) {
    const comm = this.kernel.connectToComm(target_name, model_id);
    if (data || metadata) {
      comm.open(data, metadata);
    }
    return Promise.resolve(new base.shims.services.Comm(comm));
  }

  /**
   * Get the currently-registered comms.
   */
  _get_comm_info() {
    return this.kernel
      .requestCommInfo({ target: this.comm_target_name })
      .then(reply => reply.content.comms);
  }

  /**
   * Load a class and return a promise to the loaded object.
   */
  loadClass(className, moduleName, moduleVersion) {
    if (moduleName === "@jupyter-widgets/controls") {
      return Promise.resolve(controls[className]);
    } else if (moduleName === "@jupyter-widgets/base") {
      return Promise.resolve(base[className]);
    } else if (moduleName == "@jupyter-widgets/output") {
      return Promise.resolve(outputWidgets[className]);
    } else {
      return new Promise(function(resolve, reject) {
        window.require([moduleName], resolve, reject);
      }).then(function(mod) {
        if (mod[className]) {
          return mod[className];
        } else {
          return Promise.reject(
            "Class " + className + " not found in module " + moduleName
          );
        }
      });
    }
  }
}
