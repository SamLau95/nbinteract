window.ga =
  window.ga ||
  function() {
    ;(ga.q = ga.q || []).push(arguments)
  }
ga.l = +new Date()
ga('create', '{{ site.ga_id }}', 'auto')
ga('send', 'pageview')
