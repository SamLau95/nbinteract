import debounce from 'lodash.debounce'
import once from 'lodash.once'

import { Kernel, ServerConnection } from '@jupyterlab/services'

import * as util from './util.js'
import BinderHub from './BinderHub'
import { WidgetManager } from './manager'

const DEFAULT_PROVIDER = 'gh'
const DEFAULT_SPEC = 'SamLau95/nbinteract-image/master'

/**
 * Main entry point for nbinteract.
 *
 * Class that runs notebook code and creates widgets.
 */
export default class NbInteract {
  /**
   * Initialize NbInteract. Does not start kernel until run() is called.
   *
   * @param {String} [spec] - Spec for BinderHub image. Must be in the format:
   *     `${username}/${repo}/${branch}`. Uses nbinteract-image by default.
   *
   * @param {String} [provider] - BinderHub provider. Uses GitHub by default.
   *
   * @param {bool} [record_messages=false] - Debugging argument that records
   *     all messages sent by kernel. Will increase memory usage!
   */
  constructor(
    spec = DEFAULT_SPEC,
    provider = DEFAULT_PROVIDER,
    record_messages = false,
  ) {
    this._getOrStartKernel = once(this._getOrStartKernel)
    this.run = debounce(this.run, 500, { leading: true, trailing: false })
    this.binder = new BinderHub(spec, provider)
    // Record messages for debugging
    this.messages = record_messages ? [] : false
  }

  run() {
    if (!util.pageHasWidgets()) {
      console.log('No widgets detected, stopping nbinteract.')

      // Warm up kernel so the next run is faster
      this._getOrStartKernel()

      return
    }

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
          const code = util.cellToCode(cell)
          const execution = kernel.requestExecute({ code })

          execution.onIOPub = msg => {
            if (this.messages) {
              this.messages.push(msg)
            }

            if (util.isErrorMsg(msg)) {
              console.error('Error in code run:', msg.content)
            }

            // If we have a display message, display the widget.
            if (!util.isWidgetCell(cell)) {
              return
            }

            const model = util.msgToModel(msg, manager)
            if (model !== undefined) {
              const outputEl = util.cellToWidgetOutput(cell)
              model.then(model => {
                manager.display_model(msg, model, { el: outputEl })
                util.removeLoadingFromCell(cell)
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
        wsUrl: util.baseToWsUrl(url),
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
