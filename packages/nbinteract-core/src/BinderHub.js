/**
 * Methods for starting kernels using BinderHub.
 */

// States that you can register callbacks on
// Keep in sync with https://github.com/jupyterhub/binderhub/blob/master/doc/api.rst#events
const VALID_STATES = new Set([
  '*',
  'failed',
  'built',
  'waiting',
  'building',
  'fetching',
  'pushing',
  'launching',
  'ready',
])

/**
 * Implements the Binder API to start kernels.
 */
export default class BinderHub {
  /**
   *
   * @param {Object} [config] - Config for BinderHub
   *
   * @param {String} [config.spec] - BinderHub spec for Jupyter image. Must be
   *     in the format: `${username}/${repo}/${branch}`.
   *
   * @param {String} [config.baseUrl] - Binder URL to start server.
   *
   * @param {String} [config.provider] - BinderHub provider (e.g. 'gh' for
   * Github)
   *
   * @param {Object} [config.callbacks] - Mapping from state to callback fired
   *     when BinderHub transitions to that state.
   *
   * @param {String} [config.nbUrl] - Full URL of a running notebook server.
   *     If set, NbInteract ignores all Binder config and will directly request
   *     Python kernels from the notebook server.
   *
   *     Defaults to `false`; by default we use Binder to start a notebook
   *     server.
   */
  constructor({
    spec,
    baseUrl,
    provider,
    callbacks = {},
    nbUrl = false,
  } = {}) {
    this.baseUrl = baseUrl
    this.provider = provider
    this.spec = spec
    this.nbUrl = nbUrl

    this.callbacks = callbacks
    this.state = null

    // Logs all messages sent by Binder
    this.registerCallback('*', (oldState, newState, data) => {
      if (data.message !== undefined) {
        console.log(data.message)
      } else {
        console.log(data)
      }
    })
  }

  apiUrl() {
    return `${this.baseUrl}/build/${this.provider}/${this.spec}`
  }

  startServer() {
    if (this.nbUrl) {
      return Promise.resolve({
        url: this.nbUrl,
      })
    }

    return new Promise((resolve, reject) => {
      const eventSource = new EventSource(this.apiUrl())

      eventSource.onerror = err => {
        console.error(
          'Failed to connect to Binder. Stopping nbinteract...',
          err,
        )
        eventSource.close()
        reject(new Error(err))
      }

      eventSource.onmessage = event => {
        const data = JSON.parse(event.data)

        if (data.phase) {
          this.changeState(data.phase.toLowerCase(), data)
        }
      }

      this.registerCallback('failed', (oldState, newState, data) => {
        console.error(
          'Failed to build Binder image. Stopping nbinteract...',
          data,
        )
        eventSource.close()
        reject(new Error(data))
      })

      // When the Binder server is ready, `data` contains the information
      // needed to connect.
      this.registerCallback('ready', (oldState, newState, data) => {
        eventSource.close()
        resolve(data)
      })
    })
  }

  registerCallback(state, cb) {
    if (!VALID_STATES.has(state)) {
      console.error(`Tried to register callback on invalid state: ${state}`)
      return
    }

    if (this.callbacks[state] === undefined) {
      this.callbacks[state] = [cb]
    } else {
      this.callbacks[state].push(cb)
    }
  }

  changeState(newState, data) {
    ;[newState, '*'].map(key => {
      const callbacks = this.callbacks[key]
      if (callbacks) {
        callbacks.forEach(callback => callback(this.state, newState, data))
      }
    })

    if (newState) {
      this.state = newState
    }
  }
}
