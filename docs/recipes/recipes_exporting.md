## Exporting With `nbinteract`

`nbinteract` comes with two options for exporting Jupyter notebooks into
standalone HTML pages: running `nbi.publish()` in a
notebook cell and using the `nbinteract` command line tool.

### `nbi.publish()`

The `nbi.publish()` method can be run inside a Jupyter notebook cell. It has
the following signature:

```python
import nbinteract as nbi

nbi.publish(spec, nb_name, template='full', save_first=True)
'''
Converts nb_name to an HTML file. Preserves widget functionality.

Outputs a link to download HTML file after conversion if called in a
notebook environment.

Equivalent to running `nbinteract ${spec} ${nb_name}` on the command line.

Args:
    spec (str): BinderHub spec for Jupyter image. Must be in the format:
        `${username}/${repo}/${branch}`.

    nb_name (str): Complete name of the notebook file to convert. Can be a
        relative path (eg. './foo/test.ipynb').

    template (str): Template to use for conversion. Valid templates:

        - 'full': Outputs a complete standalone HTML page with default
          styling. Automatically loads the nbinteract JS library.
        - 'partial': Outputs an HTML partial that can be embedded in
          another page. Automatically loads the nbinteract JS library.
        - 'gitbook': Outputs an HTML partial used to embed in a Gitbook or
          other environments where the nbinteract JS library is already
          loaded.

    save_first (bool): If True, saves the currently opened notebook before
        converting nb_name. Used to ensure notebook is written to
        filesystem before starting conversion. Does nothing if not in a
        notebook environment.


Returns:
    None
'''
```

For example, to convert a notebook called `Hello.ipynb` using the Binder spec
`calebs11/nbinteract-image/master`:

```python
nbi.publish('calebs11/nbinteract-image/master', 'Hello.ipynb')
```

### The `nbinteract` CLI tool

Installing the `nbinteract` package also installs a command-line tool for
converting notebooks into HTML pages. It work identically to `nbi.publish()`
but can be used on the command line.

```
Usage:
  nbinteract SPEC NOTEBOOKS ...
  nbinteract [options] SPEC NOTEBOOKS ...
  nbinteract (-h | --help)

Arguments:
  SPEC       BinderHub spec for Jupyter image. Must be in the format:
             `{username}/{repo}/{branch}`. For example:
             'SamLau95/nbinteract-image/master'.

  NOTEBOOKS  List of notebooks or folders to convert. If folders are passed in,
             all the notebooks in each folder are converted. The resulting HTML
             files are created adjacent to their originating notebooks and will
             clobber existing files of the same name.

             By default, notebooks in subfolders will not be converted; use the
             --recursive flag to recursively convert notebooks in subfolders.

Options:
  -h --help                  Show this screen
  -t TYPE --template TYPE    Specifies the type of HTML page to generate. Valid
                             types: full (standalone page), partial (embeddable
                             page), or gitbook (embeddable page for GitBook).
                             [default: full]
  -r --recursive             Recursively convert notebooks in subdirectories.
  -o FOLDER --output=FOLDER  Outputs HTML files into FOLDER instead of
                             outputting files adjacent to their originating
                             notebooks. All files will be direct descendants of
                             the folder even if --recursive is set.
  -i FOLDER --images=FOLDER  Extracts images from HTML and writes into FOLDER
                             instead of encoding images in base64 in the HTML.
                             Requires -o option to be set as well.
```

For example, to convert a notebook called `Hello.ipynb` using the Binder spec
`calebs11/nbinteract-image/master`:

```bash
nbinteract calebs11/nbinteract-image/master Hello.ipynb
```

One advantage of the command line tool is that it can convert notebooks in
folders as well as individual notebooks:

```bash
# Using the -r flag tells nbinteract to recursively search for .ipynb files
# in nb_folder
nbinteract -r calebs11/nbinteract-image/master nb_folder/
```
