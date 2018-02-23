# Getting Started

In the following set of pages, we will show you how to use `nbinteract` and its
related tools. At the end of this tutorial, you will have a publicly viewable
interactive webpage to share with the world!

## Following Along

The simplest way to follow this tutorial is to click the button below. It will
launch a Jupyter server using Binder that comes pre-built with the necessary
libraries.

[![Binder](https://mybinder.org/badge.svg)](https://staging.mybinder.org/v2/gh/SamLau95/nbinteract-image/master?filepath=tutorial.ipynb)

Clicking the button above opens an empty Jupyter Notebook you can fill in
while going through the rest of this tutorial. (We've assumed you've worked
with Jupyter notebooks before, so we won't go over how to use Jupyter.)

Once you have your notebook open, you may skip to the next page of this
tutorial.

### Installing Locally

If you prefer to work on your local machine, you can install the `nbinteract`
package. To install the package, you must first have
[Jupyter Notebook installed][install-nb]. Then, run:

```
pip install nbinteract
# The next two commands can be skipped for notebook version 5.3 and above
jupyter nbextension enable --py --sys-prefix bqplot
jupyter nbextension enable --py --sys-prefix widgetsnbextension
```

Then, start your Jupyter notebook server using

```
jupyter notebook
```

Create a new notebook called `tutorial.ipynb` (we will use this filename in
later parts of this tutorial).

[install-nb]: http://jupyter.readthedocs.io/en/latest/install.html
