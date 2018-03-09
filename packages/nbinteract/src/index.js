import NbInteract from 'nbinteract-core'

const interact = new NbInteract({
  baseUrl: 'https://mybinder.org',
  spec: 'Calebs97/riemann_book/master',
})
window.interact = interact

interact.prepare()
