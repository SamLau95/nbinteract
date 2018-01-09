import debounce from 'lodash.debounce'
import once from 'lodash.once'

import { Kernel, ServerConnection, KernelMessage } from '@jupyterlab/services'

import BinderHub from './BinderHub'
import { WidgetManager } from './manager'

const baseToWsUrl = baseUrl =>
  'wss:' +
  baseUrl
    .split(':')
    .slice(1)
    .join(':')

const WIDGET_MSG = 'application/vnd.jupyter.widget-view+json'

const cellToCode = cell => cell.querySelector('.input_area').textContent
const isWidgetCell = cell => cell.querySelector('.output_widget_view') !== null
const cellToWidgetOutput = cell => cell.querySelector('.output_widget_view')
const removeLoadingFromCell = cell => {
  // Keep in sync with interact_template.tpl
  const el = cell.querySelector('.js-widget-loading-indicator')
  if (el) el.remove()
}

const isErrorMsg = msg => msg.msg_type === 'error'
const msgToModel = (msg, manager) => {
  if (!KernelMessage.isDisplayDataMsg(msg)) {
    return
  }

  const widgetData = msg.content.data[WIDGET_MSG]
  if (widgetData === undefined || widgetData.version_major !== 2) {
    return
  }

  const model = manager.get_model(widgetData.model_id)
  return model
}

// Class that runs notebook code and creates widgets
//
// The constructor takes in the following optional arguments:
// {
//   record_messages: "Debugging argument that records all messages sent by
//      kernel. Will increase memory usage.",
// }
export default class NbInteract {
  constructor({ record_messages } = { record_messages: false }) {
    this._getOrStartKernel = once(this._getOrStartKernel)
    this.run = debounce(this.run, 500, { leading: true, trailing: false })
    this.binder = new BinderHub()
    // Record messages for debugging
    this.messages = record_messages ? [] : false
  }

  run() {
    // Generates a semi-random length-4 string. Just used for logging, so no
    // need to be super complicated.
    // From https://stackoverflow.com/a/8084248
    const run_id = (Math.random() + 1).toString(36).substring(2, 6)

    this._getOrStartKernel()
      .then(kernel => {
        const codeCells = document.querySelectorAll('.code_cell')

        const manager = new WidgetManager(kernel)

        codeCells.forEach((cell, i) => {
          console.time(`cell_${i}_${run_id}`)
          const code = cellToCode(cell)
          const execution = kernel.requestExecute({ code })

          execution.onIOPub = msg => {
            if (this.messages) {
              this.messages.push(msg)
            }

            if (isErrorMsg(msg)) {
              console.error('Error in code run:', msg.content);
            }

            // If we have a display message, display the widget.
            if (!isWidgetCell(cell)) {
              return
            }

            const model = msgToModel(msg, manager)
            if (model !== undefined) {
              const outputEl = cellToWidgetOutput(cell)
              model.then(model => {
                manager.display_model(msg, model, { el: outputEl })
                removeLoadingFromCell(cell)
                console.timeEnd(`cell_${i}_${run_id}`)
              })
            }
          }
        })
      })
      .catch(err => {
        debugger
        console.error('Error in running code:', err)
      })
  }

  _getOrStartKernel() {
    if (this.kernel !== undefined) {
      console.log('Returned cached kernel:', this.kernel.id)
      return new Promise((resolve, reject) => resolve(this.kernel))
    }

    console.time('start_server')
    return this.binder.start_server().then(({ url, token }) => {
      // Connect to the notebook webserver.
      const serverSettings = ServerConnection.makeSettings({
        baseUrl: url,
        wsUrl: baseToWsUrl(url),
        token: token,
      })
      console.timeEnd('start_server')

      console.time('start_kernel')
      return Kernel.getSpecs(serverSettings)
        .then(kernelSpecs => {
          return Kernel.startNew({
            name: kernelSpecs.default,
            serverSettings,
          })
        })
        .then(kernel => {
          console.timeEnd('start_kernel')
          // Cache kernel for later usage
          this.kernel = kernel
          console.log('Started kernel:', this.kernel.id)

          return kernel
        })
        .catch(err => {
          debugger
          console.error('Error in kernel initialization:', err)
        })
    })
  }
}
