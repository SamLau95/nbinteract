/**
 * Publicly usable class that has methods for starting kernels using BinderHub
 */

import { Kernel, ServerConnection } from '@jupyterlab/services'

import Image from './Image'

const PROVIDER = 'gh'
const SPEC = 'data-8/textbook/gh-pages'

export default class BinderHub {
  start_server() {
    return new Promise((resolve, reject) => {
      const image = new Image(PROVIDER, SPEC)

      image.onStateChange('*', (oldState, newState, data) => {
        if (data.message !== undefined) {
          console.log(data.message)
        } else {
          console.log(data)
        }
      })

      image.onStateChange('ready', (oldState, newState, data) => {
        image.close()
        const hi = Kernel
        const test = ServerConnection
        debugger
        resolve(data)
      })

      image.fetch()
    })
  }
}
