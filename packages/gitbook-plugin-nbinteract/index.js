var nbinteract = require('nbinteract-core');

module.exports = {
  hooks: {
    page: function(page) {
      nbinteract.initializeInteract();
      return page;
    },
  },
};
