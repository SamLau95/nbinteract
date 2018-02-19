import NbInteract from 'nbinteract-core'

const interact = new NbInteract({
  baseUrl: 'https://staging.mybinder.org',
})
window.interact = interact

interact.prepare()
