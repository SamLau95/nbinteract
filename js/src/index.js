import 'font-awesome/css/font-awesome.css'
import $ from 'jquery'

import { Kernel, ServerConnection, KernelMessage } from '@jupyterlab/services'

import BinderHub from './BinderHub'
import { WidgetManager } from './manager'

const baseToWsUrl = baseUrl =>
  'ws:' +
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

document.addEventListener('DOMContentLoaded', event => {
  const binder = new BinderHub()
  binder.start_server().then(({ url, token }) => {
    // Connect to the notebook webserver.
    const serverSettings = ServerConnection.makeSettings({
      baseUrl: url,
      wsUrl: baseToWsUrl(url),
      token: token,
    })
    debugger

    Kernel.getSpecs(serverSettings)
      .then(kernelSpecs => {
        debugger
        return Kernel.startNew({
          name: kernelSpecs.default,
          serverSettings,
        })
      })
      .then(kernel => {
        const codeCells = $('.code_cell').get()

        const manager = new WidgetManager(kernel, codeCells)

        codeCells.forEach((cell, i) => {
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
              })
            }
          }
        })
      })
      .catch(err => {
        debugger
        console.error('Error in kernel initialization:', err)
      })
  })
})
