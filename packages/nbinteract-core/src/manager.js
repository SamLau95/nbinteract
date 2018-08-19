/**
 * Widget manager for nbinteract. Loosely based on
 * jupyterlab-manager/src/manager.ts
 */
import { HTMLManager } from '@jupyter-widgets/html-manager'
import * as controls from '@jupyter-widgets/controls'
import { Widget } from '@phosphor/widgets'
import * as base from '@jupyter-widgets/base'
import * as bqplot from 'bqplot'

import * as util from './util.js'
import * as outputWidgets from './outputWidgets'

import '@jupyter-widgets/controls/css/widgets.css'

export class WidgetManager extends HTMLManager {
  constructor(kernel) {
    super()
    this.generateWidgets = this.generateWidgets.bind(this)
    this._displayWidget = this._displayWidget.bind(this)

    this.setKernel(kernel)
  }

  setKernel(kernel) {
    // Clear old models to remove old widgets. Normally we'd use
    // this.clear_state() but we need to set comm_closed = true for the models
    // since the comms are already closed when the kernel is dead.
    Object.values(this._models).forEach(async modelPromise => {
      const model = await modelPromise
      model.close(true)
    })
    this._models = {}

    // Close old kernel connection
    if (this.kernel) {
      this.kernel.dispose()
    }

    this.kernel = kernel
    this._registerKernel(kernel)
  }

  generateWidgets() {
    const codeCells = util.codeCells()
    codeCells.forEach((cell, i) => {
      const code = util.cellToCode(cell)
      const execution = this.kernel.requestExecute({ code })
      execution.onIOPub = msg => this._displayWidget(cell, msg)
    })
  }

  /**
   * Callback for kernel execution requests
   */
  async _displayWidget(cell, msg) {
    if (util.isErrorMsg(msg)) {
      const code = util.cellToCode(cell)
      // Remove ASCII color codes from traceback
      const traceback = msg.content.traceback
        .join('\n')
        .replace(/\u001b\[.*?m/g, '')
      console.error(`${code}\n${traceback}`.trim())

      // Display error in the widget status button so that the user knows
      // something went wrong.
      if (util.isWidgetCell(cell)) {
        util.setButtonsError(traceback, cell)
      }
    }

    if (!util.isWidgetCell(cell)) {
      return
    }

    // If we have a display message, display the widget.
    const model = await util.msgToModel(msg, this)
    if (model) {
      // Remove all widget buttons
      util.removeButtons()

      // Display widget
      const outputEl = util.cellToWidgetOutput(cell)
      this.display_model(msg, model, { el: outputEl })
    }
  }

  _registerKernel(kernel) {
    if (this._commRegistration) {
      this._commRegistration.dispose()
    }
    if (!kernel) {
      return
    }
    this._commRegistration = kernel.registerCommTarget(
      this.comm_target_name,
      (comm, msg) => {
        this.handle_comm_open(new base.shims.services.Comm(comm), msg)
      },
    )
  }

  display_view(msg, view, { el }) {
    return Promise.resolve(view).then(view => {
      Widget.attach(view.pWidget, el)
      view.on('remove', () => {
        console.log('View removed', view)
      })
      return view
    })
  }

  /**
   * Create a comm.
   */
  _create_comm(target_name, model_id, data = undefined, metadata = undefined) {
    const comm = this.kernel.connectToComm(target_name, model_id)
    if (data || metadata) {
      comm.open(data, metadata)
    }
    return Promise.resolve(new base.shims.services.Comm(comm))
  }

  /**
   * Get the currently-registered comms.
   */
  _get_comm_info() {
    return this.kernel
      .requestCommInfo({ target: this.comm_target_name })
      .then(reply => reply.content.comms)
  }

  /**
   * Load a class and return a promise to the loaded object.
   */
  loadClass(className, moduleName, moduleVersion) {
    if (moduleName === '@jupyter-widgets/controls') {
      return Promise.resolve(controls[className])
    } else if (moduleName === '@jupyter-widgets/base') {
      return Promise.resolve(base[className])
    } else if (moduleName === '@jupyter-widgets/output') {
      return Promise.resolve(outputWidgets[className])
    } else if (moduleName === 'bqplot') {
      return Promise.resolve(bqplot[className])
    } else {
      return new Promise(function(resolve, reject) {
        window.require([moduleName], resolve, reject)
      }).then(function(mod) {
        if (mod[className]) {
          return mod[className]
        } else {
          return Promise.reject(
            'Class ' + className + ' not found in module ' + moduleName,
          )
        }
      })
    }
  }
}
