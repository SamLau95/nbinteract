require(['gitbook'], function(gitbook) {
  var interact
  var auto_run

  gitbook.events.bind('page.change', function(e) {
    var config = gitbook.state.config.pluginsConfig.nbinteract
    var auto_run = config.auto_run

    if (interact === undefined) {
      console.log('Initializing interact...')
      interact = new window.NbInteract(
        (spec = config.spec),
        (provider = config.provider),
      )
      window.interact = interact
    }

    if (auto_run) {
      console.log('Running interact:')
      interact.run()
      return
    }

    var el = document.querySelector('#nbinteract')
    if (!el) {
      console.log(
        `No HTML element with id="nbinteract" found. nbinteract is disabled for this page.`,
      )
      return
    }

    el.addEventListener('click', function(e) {
      e.preventDefault()

      // We're starting a kernel that will persist between page views so we
      // might as well run whenever we can.
      auto_run = true

      console.log('Running interact:')
      interact.run()
    })
  })
})
