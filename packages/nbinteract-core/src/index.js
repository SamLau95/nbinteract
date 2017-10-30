import NbInteract from './interact'

// Define globally for use in browser libraries
// For example, this allows Gitbook to use the window.NbInteract variable
if (typeof window !== 'undefined') {
  window.NbInteract = NbInteract
}

export default NbInteract
