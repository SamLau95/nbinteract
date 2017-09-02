import * as controls from '@jupyter-widgets/controls';
import * as base from '@jupyter-widgets/base';
import * as pWidget from '@phosphor/widgets';

import { IDisposable } from '@phosphor/disposable';

import { Kernel } from '@jupyterlab/services';

import { HTMLManager } from '@jupyter-widgets/html-manager';

import "@jupyter-widgets/controls/css/widgets.css";

let requirePromise = function(module) {
    return new Promise((resolve, reject) => {
        if (window.require) {
            reject('requirejs not loaded');
        }
        window.require([module], resolve, reject);
    });
};

export class WidgetManager extends HTMLManager {
    constructor(kernel, el) {
        super();
        this.kernel = kernel;
        this.newKernel(kernel);
        this.el = el;
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
            },
        );
    }

    display_view(msg, view, options) {
        return Promise.resolve(view).then(view => {
            pWidget.Widget.attach(view.pWidget, this.el);
            view.on('remove', function() {
                console.log('view removed', view);
            });
            return view;
        });
    }

    /**
     * Create a comm.
     */
    _create_comm(
        target_name,
        model_id,
        data = undefined,
        metadata = undefined,
    ) {
        let comm = this.kernel.connectToComm(target_name, model_id);
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
}
