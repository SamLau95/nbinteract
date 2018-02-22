import NbInteract from 'nbinteract-core'

const interact = new NbInteract({
  baseUrl: 'https://mybinder.org',
})
window.interact = interact

interact.prepare()
