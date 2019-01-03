# Changelog

This file contains the changes made for each version of `nbinteract`. Since
the package contains both a Python and a JavaScript component, we keep the
version numbers for both Python and JS packages the same so updates are easier
to keep track of.

## master

## 0.2.4

**JS**

- Enable users to specify notebook server instead of Binder server through the
  `nbUrl` config option when initializing the `NbInteract` object
  (https://github.com/SamLau95/nbinteract/pull/102).

## 0.2.3

**Python**

Bug fixes:

- Fix bug in initialization script for repos with dashes in the name.

## 0.2.2

**JS**

Features:

- Bundle size reduced to 1.23 MB unzipped (https://github.com/SamLau95/nbinteract/commit/cdb053f0018bdda0f4554ce5f0840b719a3af05e).

**Python**

Bug fixes:

- Require jinja2 version to be at least 2.10

## 0.2.1

**JS**

Bug fixes:

- Ensure top level button gets removed when widgets render (https://github.com/SamLau95/nbinteract/pull/92)

**Python**

Features:

- When publishing, the branch name of the spec is now optional (defaults to
  `master`) (https://github.com/SamLau95/nbinteract/pull/91).

## 0.2.0

**JS**

Bug fixes:

- Correctly remove top level widget button (https://github.com/SamLau95/nbinteract/commit/a3658f8105f01c1e63e0e719944a99afc58dac51)

**Python**

Features:

- Add layout flags (https://github.com/SamLau95/nbinteract/pull/88)

## 0.1.9

**JS**

Changes:

- Stop supporting Gitbook plugin (https://github.com/SamLau95/nbinteract/pull/83)

**Python**

Changes:

- Rename `gitbook` template to `plain` (https://github.com/SamLau95/nbinteract/pull/83)

Bug fixes:

- Fixes unicode issue on Windows (https://github.com/SamLau95/nbinteract/pull/84)
- Fixes spec issue in publish method (https://github.com/SamLau95/nbinteract/pull/85)

## 0.1.8

**JS**

Bug fixes:

- Fixes nbinteract-core loading on unpkg.

## 0.1.7

**Python**

Bug fixes:

- Ensures template files are included in package

## 0.1.6

**Python**

Features:

- Add `--execute` flag to CLI that correctly generates widget output.

Bug fixes:

- Fixes CLI `--output` flag for Python 3.4

**JS**

Features:

- Errors in widget code get displayed in the status buttons.

## 0.1.5

**Python**

Bug fixes:

- Fixes error when some plotting functions are called.

## 0.1.4

**Python**

Features:

- `nbinteract init` initializes a GitHub repo for nbinteract.

**JS**

Bug fixes:

- Fixes errors from cells that don't have widget output.

## 0.1.3

**Python**

Features:

- The `nbinteract` CLI now has a `--no-top-button` flag to remove the top-level
  button.

Bug fixes:

- Python 3.4 doesn't support the `{**dict1, **dict2}` syntax, so we merge
  dictionaries another way to support older versions of Python.
- Fixes an issue that broke `nbinteract` CLI completely (#52).
- The `nbinteract` CLI spec argument didn't actually set the spec properly.

**JS**

Bug fixes:

- Fixes `nbinteract-core` so that loading it in a webpage initializes the
  NbInteract variable properly.

## 0.1.2

**Python**

Changes:

- `nbi.publish()` and the `nbinteract` CLI tool now require a Binder spec as
  input.

Features:

- `nbi.publish()` and the `nbinteract` CLI tool now allow for template
  selection.
- The `nbinteract` CLI tool gets a major overhaul with options to recurse into
  subdirectories and output files in specified folders.

**JS**

Bug fixes:

- Fixed an issue where lots of error message were getting logged to the console
  in the GitBook (https://github.com/SamLau95/nbinteract/issues/41).

## 0.1.1

**Python**

Bugs fixed:

- Converting using `full.tpl` now correctly cells with `# HIDDEN`
  (https://github.com/SamLau95/nbinteract/pull/43/)
- Using `nbi.publish` now works on Python versions < 3.5
  (https://github.com/SamLau95/nbinteract/pull/43/)
