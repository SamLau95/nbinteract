import debounce from 'lodash.debounce'

import { Kernel, ServerConnection } from '@jupyterlab/services'

import { WidgetManager } from './manager'
import * as util from './util.js'
import BinderHub from './BinderHub'

const DEFAULT_BASE_URL = 'https://mybinder.org'
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
   * @param {Object} [config] - Configuration for NbInteract
   *
   * @param {String} [config.spec] - BinderHub spec for Jupyter image. Must be
   *     in the format: `${username}/${repo}/${branch}`. Defaults to
   *     'SamLau95/nbinteract-image/master'.
   *
   * @param {String} [config.baseUrl] - Binder URL to start server. Defaults to
   *     https://mybinder.org.
   *
   * @param {String} [config.provider] - BinderHub provider. Defaults to 'gh'
   *     for GitHub.
   *
   * @param {String} [config.nbUrl] - Full URL of a running notebook server.
   *     If set, NbInteract ignores all Binder config and will directly request
   *     Python kernels from the notebook server.
   *
   *     Defaults to `false`; by default we use Binder to start a notebook
   *     server.
   */
  constructor({
    spec = DEFAULT_SPEC,
    baseUrl = DEFAULT_BASE_URL,
    provider = DEFAULT_PROVIDER,
    nbUrl = false,
  } = {}) {
    this.run = debounce(this.run, 500, {
      leading: true,
      trailing: false,
    })
    this._kernelHeartbeat = this._kernelHeartbeat.bind(this)

    this.binder = new BinderHub({ spec, baseUrl, provider, nbUrl })

    // Keep track of properties for debugging
    this.kernel = null
    this.manager = null
  }

  /**
   * Attaches event listeners to page that call run() when clicked. Updates
   * status text of elements as server is started until widget is rendered.
   * When widgets are rendered, removes all status elements.
   *
   * If a running kernel is cached in localStorage, creates widgets without
   * needing button click.
   */
  async prepare() {
    // The widget buttons show loading indicator text by default. At this
    // point, nbinteract is ready to run so we change the button text to match.
    util.setButtonsStatus('Show Widgets')

    this.binder.registerCallback('failed', (oldState, newState, data) => {
      util.setButtonsError(
        `Error, try refreshing the page:<br>${data.message}`,
      )
    })

    util.statusButtons().forEach(button => {
      button.addEventListener('click', e => {
        this.run()
      })
    })

    this.runIfKernelExists()
  }

  /**
   * Starts kernel if needed, runs code on page, and initializes widgets.
   */
  async run() {
    // The logic to remove the status buttons is temporarily in
    // manager.js:_displayWidget since it's tricky to implement here.
    // TODO(sam): Move the logic here instead.
    util.setButtonsStatus('Initializing widgets...')

    // Normally, we wait until one widget displays before removing the show
    // widget buttons. However, if there are no widgets on the page, we should
    // just remove all buttons since the top level button is generated
    // regardless of whether the page contains widgets.
    if (util.codeCells().length === 0) {
      util.removeButtons()
    }

    const firstRun = !this.kernel || !this.manager
    try {
      this.kernel = await this._getOrStartKernel()
      this.manager = this.manager || new WidgetManager(this.kernel)
      this.manager.generateWidgets()

      if (firstRun) this._kernelHeartbeat()
    } catch (err) {
      debugger
      console.log('Error in widget initialization :(')
      throw err
    }
  }

  /**
   * Same as run(), but only runs code if kernel is already started.
   */
  async runIfKernelExists() {
    try {
      await this._getKernelModel()
    } catch (err) {
      console.log(
        'No kernel, stopping the runIfKernelExists() call. Use the',
        'run() method to automatically start a kernel if needed.',
      )
      return
    }

    this.run()
  }

  /**********************************************************************
   * Private methods
   **********************************************************************/

  /**
   * Checks kernel connection every seconds_between_check seconds. If the
   * kernel is dead, starts a new kernel and re-creates widgets.
   */
  async _kernelHeartbeat(seconds_between_check = 5) {
    try {
      await this._getKernelModel()
    } catch (err) {
      console.log('Looks like the kernel died:', err.toString())
      console.log('Starting a new kernel...')

      const kernel = await this._startKernel()
      this.kernel = kernel

      this.manager.setKernel(kernel)
      this.manager.generateWidgets()
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
    if (this.kernel) {
      return this.kernel
    }

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
      const { url, token } = await this.binder.startServer()

      // Connect to the notebook webserver.
      const serverSettings = ServerConnection.makeSettings({
        baseUrl: url,
        wsUrl: util.baseToWsUrl(url),
        token: token,
      })

      // Start a kernel
      const kernelSpecs = await Kernel.getSpecs(serverSettings)
      const kernel = await Kernel.startNew({
        name: kernelSpecs.default,
        serverSettings,
      })

      // Store the params in localStorage for later use
      localStorage.serverParams = JSON.stringify({ url, token })
      localStorage.kernelId = kernel.id

      console.log('Started kernel:', kernel.id)
      return kernel
    } catch (err) {
      debugger
      console.error('Error in kernel initialization :(')
      throw err
    }
  }

  async _killKernel() {
    const kernel = await this._getKernel()
    return kernel.shutdown()
  }
}
