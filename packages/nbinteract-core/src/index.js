import './bqplot.css'
import NbInteract from './NbInteract'

// Define globally for use in browser.
// For example, this allows the Gitbook plugin to use NbInteract
if (typeof window !== 'undefined') {
  window.NbInteract = NbInteract
}

export default NbInteract
