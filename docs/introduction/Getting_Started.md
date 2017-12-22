# Getting Started

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

[install-nb]: http://jupyter.readthedocs.io/en/latest/install.html
