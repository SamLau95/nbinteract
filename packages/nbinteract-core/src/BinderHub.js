/**
 * Publicly usable class that has methods for starting kernels using BinderHub
 */

import { Kernel, ServerConnection } from '@jupyterlab/services'

import Image from './Image'

const PROVIDER = 'gh'
const SPEC = 'data-8/textbook/gh-pages'

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

export default class BinderHub {
  constructor(callbacks = {}) {
    this.image = new Image(PROVIDER, SPEC)

    // Register all callbacks at once
    Object.entries(callbacks).map(([state, cb]) =>
      this.register_callback(state, cb),
    )
  }

  start_server() {
    return new Promise((resolve, reject) => {
      this.image.onStateChange('*', (oldState, newState, data) => {
        if (data.message !== undefined) {
          console.log(data.message)
        } else {
          console.log(data)
        }
      })

      this.image.onStateChange('ready', (oldState, newState, data) => {
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
