nbinteract
=================

nbinteract is a tool to convert Jupyter Notebooks to interactive webpages. It
allows notebooks that use [ipywidgets][] or [bqplot][] to be hosted online as
HTML pages for anyone to view and interact with.

[Here's a demo of an interact textbook page on correlation created using
nbinteract.][demo]

## Motivation

Making interactive webpages is challenging since it requires deep knowledge of
web technologies and especially Javascript. Python developers/data scientists
might not have this skillset but can create interactive demos in a Jupyter
notebook through [Jupyter widgets][widgets]. Unfortunately, sharing these
interactive demos requires other users to download the notebook and run a
notebook server on their own machines.

nbinteract allows users to author a notebook using widgets and convert it to an
HTML page that still retains interactivity. These pages can then be hosted
online using, for example, [Github Pages][gh-pages] or [Gitbook][gitbook].

## Getting Started

To install the package, you must first have
[Jupyter Notebook installed][install-nb]. Then, run:

```
pip install nbinteract
```

Navigate to a folder containing notebooks you'd like to convert, then run:

```
jupyter nbconvert --to interact YOUR_NOTEBOOK.ipynb
```

Replace `YOUR_NOTEBOOK.ipynb` with the name of your notebook file. You will now
have an HTML file in the same directory. You can open that HTML file in your
browser and interact with widgets there.

## Documentation

[Here's a link to the documentation for this project.][docs]

## Developer Install

If you are interested in developing this project locally, run the following:

```
git clone https://github.com/SamLau95/nbinteract
cd nbinteract

# Installs the nbconvert exporter
pip install -e .

# To export a notebook to interactive HTML format:
jupyter nbconvert --to interact notebooks/Test.ipynb

pip install -U ipywidgets
jupyter nbextension enable --py --sys-prefix widgetsnbextension

brew install yarn
yarn install

# Start notebook and webpack servers
make -j2 serve
```

[demo]: https://samlau95.gitbooks.io/nbinteract/content/examples/Correlation.html
[ipywidgets]: https://github.com/jupyter-widgets/ipywidgets
[bqplot]: https://github.com/bloomberg/bqplot
[widgets]: http://jupyter.org/widgets.html
[gh-pages]: https://pages.github.com/
[gitbook]: http://gitbook.com/
[install-nb]: http://jupyter.readthedocs.io/en/latest/install.html
[docs]: https://samlau95.gitbooks.io/nbinteract/content/
