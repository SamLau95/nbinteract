import 'font-awesome/css/font-awesome.css'
import $ from 'jquery'
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

const cellToCode = cell =>
  $(cell)
    .find('.input_area')
    .text()
const isWidgetCell = cell => $(cell).find('.output_widget_view').length !== 0
const cellToWidgetOutput = cell => $(cell).find('.output_widget_view')[0]

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

export default class NbInteract {
  constructor() {
    // Generates a semi-random length-4 string. Just used for logging, so no
    // need to be super complicated.
    // From https://stackoverflow.com/a/8084248
    this.id = (Math.random() + 1).toString(36).substring(2, 6)

    this._running = false
    this._getOrStartKernel = once(this._getOrStartKernel);
    this.run = debounce(this.run, 500, { leading: true, trailing: false })
  }

  run() {
    this._getOrStartKernel()
      .then(kernel => {
        const codeCells = $('.code_cell').get()

        const manager = new WidgetManager(kernel, codeCells)

        codeCells.forEach((cell, i) => {
          console.time(`cell_${i}_${this.id}`)
          const code = cellToCode(cell)
          const execution = kernel.requestExecute({ code })

          execution.onIOPub = msg => {
            // If we have a display message, display the widget.
            if (!isWidgetCell(cell)) {
              return
            }

            const model = msgToModel(msg, manager)
            if (model !== undefined) {
              const outputEl = cellToWidgetOutput(cell)
              model.then(model => {
                manager.display_model(msg, model, { el: outputEl })
                console.timeEnd(`cell_${i}_${this.id}`)
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

    const binder = new BinderHub()
    console.time(`start_server_${this.id}`)
    return binder.start_server().then(({ url, token }) => {
      // Connect to the notebook webserver.
      const serverSettings = ServerConnection.makeSettings({
        baseUrl: url,
        wsUrl: baseToWsUrl(url),
        token: token,
      })
      console.timeEnd(`start_server_${this.id}`)

      console.time(`start_kernel_${this.id}`)
      return Kernel.getSpecs(serverSettings)
        .then(kernelSpecs => {
          return Kernel.startNew({
            name: kernelSpecs.default,
            serverSettings,
          })
        })
        .then(kernel => {
          console.timeEnd(`start_kernel_${this.id}`)
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
