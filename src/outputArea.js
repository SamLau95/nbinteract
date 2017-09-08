const outputArea = {
  // Shim
};

export default new Proxy(outputArea, {
  get(target, name) {
    return (...args) => { console.log(name, args); }
  }
});
