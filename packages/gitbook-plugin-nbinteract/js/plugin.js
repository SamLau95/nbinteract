require(['gitbook'], function(gitbook) {
  var interact
  var auto_run

  gitbook.events.bind('page.change', function(e) {
    var config = gitbook.state.config.pluginsConfig.nbinteract

    if (interact === undefined) {
      console.log('Initializing interact...')
      interact = new window.NbInteract({
        baseUrl: config.baseUrl,
        spec: config.spec,
        provider: config.provider,
      })
      window.interact = interact
    }

    interact.prepare()
  })
})
