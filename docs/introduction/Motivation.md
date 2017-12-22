# Motivation

The goal of nbinteract is to allow authors and educators to **easily** create
interactive demos.

Interactive explanations of concepts are useful for commmunicating and
explaining tricky concepts. Consider these explanations for [linear
regression][linreg] and [conditional probability][cond], for example.

However, making an interactive webpage is challenging since it requires deep
knowledge of web technologies and especially Javascript. Python developers/data
scientists might not have this skillset but can create interactive demos in a
Jupyter notebook through [Jupyter widgets][widgets]. Unfortunately, sharing
these demos requires other users to download the notebook and run a notebook
server on their own machines.

nbinteract provides an easy way to convert Jupyter notebooks into HTML pages
with interactive widgets. In addition, nbinteract has helper methods built on
top of `ipywidgets` that allow users to create complicated visualizations with
single function calls.

[widgets]: http://jupyter.org/widgets.html
[linreg]: http://setosa.io/ev/ordinary-least-squares-regression/
[cond]: https://students.brown.edu/seeing-theory/compound-probability/index.html#third
