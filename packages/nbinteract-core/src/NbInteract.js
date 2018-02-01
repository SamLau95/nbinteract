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
    this.run = debounce(this.run, 500, { leading: true, trailing: false })

    this.binder = new BinderHub(spec, provider)
    // Record messages for debugging
    this.messages = record_messages ? [] : false
  }

  async run() {
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

    try {
      const kernel = await this._getOrStartKernel()
      const manager = new WidgetManager(kernel)
    } catch (err) {
      debugger
      console.log('Error in code initialization!');
      throw err
    }
  }

  /**
   * Private method that starts a Binder server, then starts a kernel and
   * returns the kernel information.
   *
   * Once initialized, this function caches the server and kernel info in
   * localStorage. Future calls will attempt to use the cached info, falling
   * back to starting a new server and kernel.
   */
  async _getOrStartKernel() {
    try {
      const kernel = await this._getKernel()
      console.log('Connected to cached kernel.');
      return kernel
    } catch (err) {
      console.log('No cached kernel, starting kernel on BinderHub.')
      const kernel = await this._startKernel()
      return kernel
    }
  }

  /**
   * Connects to kernel using cached info from localStorage. Throws exception
   * if kernel connection fails for any reason.
   */
  async _getKernel() {
    const { serverParams, kernelId } = localStorage
    const { url, token } = JSON.parse(serverParams)

    const serverSettings = ServerConnection.makeSettings({
      baseUrl: url,
      wsUrl: util.baseToWsUrl(url),
      token: token,
    })

    const kernelModel = await Kernel.findById(kernelId, serverSettings)
    const kernel = await Kernel.connectTo(kernelModel, serverSettings)

    return kernel
  }

  /**
   * Starts a new kernel using Binder and returns the connected kernel. Stores
   * localStorage.serverParams and localStorage.kernelId .
   */
  async _startKernel() {
    try {
      console.time('start_server')
      const { url, token } = await this.binder.start_server()
      console.timeEnd('start_server')

      // Connect to the notebook webserver.
      const serverSettings = ServerConnection.makeSettings({
        baseUrl: url,
        wsUrl: util.baseToWsUrl(url),
        token: token,
      })

      console.time('start_kernel')
      const kernelSpecs = await Kernel.getSpecs(serverSettings)
      const kernel = await Kernel.startNew({
        name: kernelSpecs.default,
        serverSettings,
      })
      console.timeEnd('start_kernel')

      // Store the params in localStorage for later use
      localStorage.serverParams = JSON.stringify({ url, token })
      localStorage.kernelId = kernel.id

      console.log('Started kernel:', kernel.id)
      return kernel
    } catch (err) {
      debugger
      console.error('Error in kernel initialization!')
      throw err
    }
  }

  async _killKernel() {
    const kernel = await this._getKernel()
    return kernel.shutdown()
  }
}
