require(['gitbook'], function(gitbook) {
  console.log('Initializing interact...');
  var interact = new window.NbInteract()

  window.interact = interact

  gitbook.events.bind('page.change', function() {
    console.log('Running interact:');
    interact.run()
  })
})
