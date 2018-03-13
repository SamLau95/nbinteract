/*
  Implements the BinderHub API.

  Don't use this class directly; instead, use the BinderHub class

  Keep in sync with
  https://github.com/jupyterhub/binderhub/blob/master/binderhub/static/js/index.js

  State transitions that are valid are:
  start -> waiting
  start -> built
  start -> failed
  waiting -> building
  waiting -> failed
  building -> pushing
  building -> failed
  pushing -> built
  pushing -> failed
*/

const MAX_CONNECTION_ATTEMPTS = 3

function Image({ spec, baseUrl, provider }) {
  this.baseUrl = baseUrl
  this.provider = provider
  this.spec = spec

  this.callbacks = {}
  this.state = null
  this.failed_connection_attempts = 0
}

Image.prototype.onStateChange = function(state, cb) {
  if (this.callbacks[state] === undefined) {
    this.callbacks[state] = [cb]
  } else {
    this.callbacks[state].push(cb)
  }
}

Image.prototype.changeState = function(state, data) {
  var that = this
  ;[state, '*'].map(function(key) {
    var callbacks = that.callbacks[key]
    if (callbacks) {
      for (var i = 0; i < callbacks.length; i++) {
        callbacks[i](that.state, state || that.state, data)
      }
    }
  })

  // FIXME: Make sure this this is a valid state transition!
  if (state) {
    this.state = state
  }
}

Image.prototype.fetch = function() {
  var apiUrl = `${this.baseUrl}/build/${this.provider}/${this.spec}`
  this.eventSource = new EventSource(apiUrl)
  var that = this
  this.eventSource.onerror = function(err) {
    console.error('Failed to construct event stream', err)

    that.failed_connection_attempts++
    if (that.failed_connection_attempts >= MAX_CONNECTION_ATTEMPTS) {
      console.error(
        'Maximum number of failed connection attempts reached.',
        'Aborting nbinteract initialization...',
      )
      that.eventSource.close()
    }
  }
  this.eventSource.addEventListener('message', function(event) {
    var data = JSON.parse(event.data)
    // FIXME: Rename 'phase' to 'state' upstream
    // FIXME: fix case of phase/state upstream
    var state = null
    if (data.phase) {
      state = data.phase.toLowerCase()
    }
    that.changeState(state, data)
  })
}

Image.prototype.close = function() {
  if (this.eventSource !== undefined) {
    this.eventSource.close()
  }
}

function v2url(repository, ref, filepath) {
  // return a v2 url from a repository, ref, and filepath
  if (repository.length === 0) {
    // no repo, no url
    return null
  }
  var url = window.location.origin + '/v2/gh/' + repository + '/' + ref
  if (filepath && filepath.length > 0) {
    url = url + '?filepath=' + encodeURIComponent(filepath)
  }
  return url
}

export default Image
