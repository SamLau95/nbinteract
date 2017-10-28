import { initializeInteract } from 'nbinteract-core'

export default {
  hooks: {
    page: function(page) {
      initializeInteract()
      return page
    },
  },
}
