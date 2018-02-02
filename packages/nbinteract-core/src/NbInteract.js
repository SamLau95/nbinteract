import debounce from 'lodash.debounce'

import { Kernel, ServerConnection } from '@jupyterlab/services'

import { WidgetManager } from './manager';
import * as util from './util.js'
import BinderHub from './BinderHub'

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
    this._kernelHeartbeat = this._kernelHeartbeat.bind(this)

    this.binder = new BinderHub(spec, provider)

    // Keep track of properties for debugging
    this.kernel = null
    this.manager = null
  }

  async run() {
    if (!util.pageHasWidgets()) {
      console.log('No widgets detected, stopping nbinteract.')

      // Warm up kernel and load manager so the next run is faster
      this._getOrStartKernel()
      return
    }

    try {
      this.kernel = await this._getOrStartKernel()
      this.manager = new WidgetManager(this.kernel)

      this._kernelHeartbeat()
    } catch (err) {
      debugger
      console.log('Error in code initialization!')
      throw err
    }
  }

  /**
   * Checks kernel connection every seconds_between_check seconds. If the
   * kernel is dead, starts a new kernel and re-creates widgets.
   */
  async _kernelHeartbeat(seconds_between_check = 5) {
    try {
      const { kernelModel } = await this._getKernelModel()
    } catch (err) {
      console.log('Looks like the kernel died:', err.toString())
      console.log('Starting a new kernel...')

      const kernel = await this._startKernel()
      this.kernel = kernel
      this.manager.setKernel(kernel)
    } finally {
      setTimeout(this._kernelHeartbeat, seconds_between_check * 1000)
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
      console.log('Connected to cached kernel.')
      return kernel
    } catch (err) {
      console.log(
        'No cached kernel, starting kernel on BinderHub:',
        err.toString(),
      )
      const kernel = await this._startKernel()
      return kernel
    }
  }

  /**
   * Connects to kernel using cached info from localStorage. Throws exception
   * if kernel connection fails for any reason.
   */
  async _getKernel() {
    const { serverSettings, kernelModel } = await this._getKernelModel()
    return await Kernel.connectTo(kernelModel, serverSettings)
  }

  /**
   * Retrieves kernel model using cached info from localStorage. Throws
   * exception if kernel doesn't exist.
   */
  async _getKernelModel() {
    const { serverParams, kernelId } = localStorage
    const { url, token } = JSON.parse(serverParams)

    const serverSettings = ServerConnection.makeSettings({
      baseUrl: url,
      wsUrl: util.baseToWsUrl(url),
      token: token,
    })

    const kernelModel = await Kernel.findById(kernelId, serverSettings)
    return { serverSettings, kernelModel }
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
