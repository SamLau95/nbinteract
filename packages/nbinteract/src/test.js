/**
 * Entry file used to test module inclusion/exclusion
 */

// import { Kernel, ServerConnection } from '@jupyterlab/services'
// import { OutputAreaModel, OutputArea } from '@jupyterlab/outputarea'
// import { RenderMimeRegistry, standardRendererFactories } from '@jupyterlab/rendermime'
import { nbformat, hello } from '@jupyterlab/coreutils';

(() => {
  const a = hello
  const b = nbformat
  debugger
})()
