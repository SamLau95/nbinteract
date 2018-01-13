# `gitbook-plugin-nbinteract`

This package contains the Gitbook plugin for [`nbinteract`][nbi].

## Usage

Add `"nbinteract"` to the plugins in your `book.json`:

```javascript
{
  "plugins": ["nbinteract"],
  "pluginsConfig": {
    "nbinteract": {
      // Optional parameters. For example:
      //
      // "auto_run": false
    }
  }
}
```

Configure the plugin using the following parameters:

```javascript
{
  "spec": {
    "type": "String",
    "description": [
      "Spec for the BinderHub image. Must be in the format ",
      "${username}/${repo}/${branch}. By default uses the nbinteract ",
      "image."
    ],
    "default": "SamLau95/nbinteract-image/master"
  },
  "provider": {
    "type": "String",
    "description": [
      "Provider for the BinderHub image. ",
      "By default uses Github."
    ],
    "default": "gh"
  },
  "auto_run": {
    "type": "bool",
    "description": [
      "If true (default), automatically starts kernel and runs code when ",
      "page with widgets is loaded. If false, will look for a DOM ",
      "element with id nbinteract and attach a click handler to run."
    ],
    "default": true
  }
}
```

[nbi]: https://github.com/SamLau95/nbinteract
