import { HTMLManager } from '@jupyter-widgets/html-manager'
import * as controls from '@jupyter-widgets/controls'
import { Widget } from '@phosphor/widgets'
import * as base from '@jupyter-widgets/base'
import * as bqplot from 'bqplot';

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

  async setKernel(kernel) {
    await this.clear_state()

    this.kernel = kernel
    this._registerKernel(kernel)

    this.generateWidgets()
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
    if (this.messages) {
      this.messages.push(msg)
    }

    if (util.isErrorMsg(msg)) {
      console.error('Error in code run:', msg.content)
    }

    if (!util.isWidgetCell(cell)) {
      return
    }

    // If we have a display message, display the widget.
    const model = await util.msgToModel(msg, this)
    if (model) {
      const outputEl = util.cellToWidgetOutput(cell)
      this.display_model(msg, model, { el: outputEl })
      util.removeLoadingFromCell(cell)
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
