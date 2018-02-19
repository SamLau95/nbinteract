import NbInteract from 'nbinteract-core'

const interact = new NbInteract({
  baseUrl: 'https://staging.mybinder.org',
})
window.interact = interact

document.querySelectorAll('.js-nbinteract-widget').forEach(button => {
  button.addEventListener('click', e => {
    interact.run()
  })
})
