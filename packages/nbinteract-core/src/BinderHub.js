/**
 * Publicly usable class that has methods for starting kernels using BinderHub
 */

import { Kernel, ServerConnection } from '@jupyterlab/services'

import Image from './Image'

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

// This is hard-coded to the server started using `make start_notebook`
const LOCAL_SERVER_URL = 'http://localhost:8889/'

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
   * @param {Boolean} [config.local] - If true, uses locally running notebook
   *     server instead of mybinder.org server. Used for development only.
   */
  constructor(
    { spec, baseUrl, provider, callbacks = {}, local = false } = {},
  ) {
    this.image = new Image({ spec, baseUrl, provider })
    this.local = local

    // Register all callbacks at once
    Object.entries(callbacks).map(([state, cb]) =>
      this.registerCallback(state, cb),
    )
  }

  startServer() {
    if (this.local) {
      return Promise.resolve({
        url: LOCAL_SERVER_URL,
      })
    }

    return new Promise((resolve, reject) => {
      this.registerCallback('*', (oldState, newState, data) => {
        if (data.message !== undefined) {
          console.log(data.message)
        } else {
          console.log(data)
        }
      })

      this.registerCallback('ready', (oldState, newState, data) => {
        this.image.close()
        resolve(data)
      })

      this.image.fetch()
    })
  }

  registerCallback(state, cb) {
    if (!VALID_STATES.has(state)) {
      console.error(`Tried to register callback on invalid state: ${state}`)
      return
    }

    this.image.onStateChange(state, cb)
  }
}
