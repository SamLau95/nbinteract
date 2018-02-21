# `nbinteract-core`

This package contains the Javascript API for [`nbinteract`][nbi].

[nbi]: https://github.com/SamLau95/nbinteract

## Basic Usage

```javascript
import NbInteract from 'nbinteract-core'

const interact = new NbInteract()

// Initializes nbinteract, starts Binder kernel, and generates widgets
interact.run()
```
