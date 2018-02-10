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

const BASE_URL = 'https://mybinder.org'

const MAX_CONNECTION_ATTEMPTS = 3

function Image(provider, spec) {
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
  var apiUrl = `${BASE_URL}/build/${this.provider}/${this.spec}`
  this.eventSource = new EventSource(apiUrl)
  var that = this
  this.eventSource.onerror = function(err) {
    console.error('Failed to construct event stream', err)
    that.changeState('failed', {
      message: 'Failed to connect to event stream\n',
    })

    that.failed_connection_attempts++
    if (that.failed_connection_attempts >= MAX_CONNECTION_ATTEMPTS) {
      console.error('Maximum number of failed connection attempts reached.',
                    'Aborting nbinteract initialization...')
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

Image.prototype.launch = function(url, token, filepath) {
  // redirect a user to a running server with a token
  if (filepath) {
    // strip trailing /
    url = url.replace(/\/$/, '')
    // /tree is safe because it allows redirect to files
    url = url + '/tree/' + encodeURI(filepath)
  }
  url = url + '?' + $.param({ token: token })
  window.location.href = url
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

// var repo = $('#repository').val().trim();
// var ref =  $('#ref').val().trim();
// repo = repo.replace(/^(https?:\/\/)?github.com\//, '');
// // trim trailing or leading '/' on repo
// repo = repo.replace(/(^\/)|(\/?$)/g, '');
// var image = new Image('gh', repo + '/' + ref);

// var url = updateUrl();
// // add fixed build URL to window history so that reload with refill the form
// if (window.location.href !== url) {
//   window.history.pushState({}, '', url);
// }

// $('#build-progress .progress-bar').addClass('hidden');
// log.clear();

// $('.on-build').removeClass('hidden');

// image.onStateChange('*', function(oldState, newState, data) {
//     if (data.message !== undefined) {
//         log.fit();
//         log.write(data.message);
//     } else {
//         console.log(data);
//     }
// });

// image.onStateChange('waiting', function(oldState, newState, data) {
//     $('#phase-waiting').removeClass('hidden');
// });

// image.onStateChange('building', function(oldState, newState, data) {
//     $('#phase-building').removeClass('hidden');
// });

// image.onStateChange('pushing', function(oldState, newState, data) {
//     $('#phase-pushing').removeClass('hidden');
// });
// image.onStateChange('failed', function(oldState, newState, data) {
//     failed = true;
//     $('#build-progress .progress-bar').addClass('hidden');
//     $('#phase-failed').removeClass('hidden');
//     // If we fail for any reason, we will show logs!
//     if (!logsVisible) {
//         $('#toggle-logs').click();
//     }
//     image.close();
// });

// image.onStateChange('built', function(oldState, newState, data) {
//     if (oldState === null) {
//         $('#phase-already-built').removeClass('hidden');
//         $('#phase-launching').removeClass('hidden');
//     }
// });

// image.onStateChange('ready', function(oldState, newState, data) {
//     image.close();
//     // fetch runtime params!
//     var filepath = $("#filepath").val().trim();
//     image.launch(data.url, data.token, filepath);
// });

// image.fetch();
// return false;
