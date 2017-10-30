require(['gitbook'], function(gitbook) {
  gitbook.events.bind('page.change', function() {
    window.NbInteract.initializeInteract()
  })
})
