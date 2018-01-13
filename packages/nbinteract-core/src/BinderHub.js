/**
 * Publicly usable class that has methods for starting kernels using BinderHub
 */

import { Kernel, ServerConnection } from '@jupyterlab/services'

import Image from './Image'

const DEFAULT_PROVIDER = 'gh'
const DEFAULT_SPEC = 'SamLau95/nbinteract-image/master'

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
   * @param {String} spec - BinderHub spec for Jupyter image. Must be in the
   *     format: `${username}/${repo}/${branch}`.
   *
   * @param {String} provider - BinderHub provider
   *
   * @param {Object} [callbacks] - Mapping from state to callback fired when
   *     BinderHub transitions to that state.
   */
  constructor(spec, provider, callbacks = {}) {
    this.image = new Image(provider, spec)

    // Register all callbacks at once
    Object.entries(callbacks).map(([state, cb]) =>
      this.register_callback(state, cb),
    )
  }

  start_server() {
    return new Promise((resolve, reject) => {
      this.register_callback('*', (oldState, newState, data) => {
        if (data.message !== undefined) {
          console.log(data.message)
        } else {
          console.log(data)
        }
      })

      this.register_callback('ready', (oldState, newState, data) => {
        this.image.close()
        resolve(data)
      })

      this.image.fetch()
    })
  }

  register_callback(state, cb) {
    if (!VALID_STATES.has(state)) {
      console.error(`Tried to register callback on invalid state: ${state}`)
      return
    }

    this.image.onStateChange(state, cb)
  }
}
