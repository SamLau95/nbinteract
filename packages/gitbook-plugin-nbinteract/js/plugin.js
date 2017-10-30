require(['gitbook'], function(gitbook) {
  gitbook.events.bind('page.change', function() {
    console.log('Running interact:');
    window.interact.run()
  })
})
