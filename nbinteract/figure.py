"""
Methods of the Figure and Plot class to create more complex plots.
"""

import numpy as np
import bqplot as bq
import collections
import ipywidgets as widgets
import itertools
import functools
import logging
import toolz.curried as tz
from IPython.display import display
from . import util
from . import plotting

__all__ = ['Line', 'Plot']


def Line(x_fn, y_fn, options={}):
    """ Public API function to allow users to create a Line object used to
    pass into the Plot object,
    """
    return {'marker': 'line', 'x_fn': x_fn, 'y_fn': y_fn, 'options': options}


@plotting.use_options([
    'title', 'aspect_ratio', 'animation_duration', 'xlabel', 'ylabel', 'xlim',
    'ylim'
])
def _Line(x_fn, y_fn, options={}):
    """
    Internal Line function that generates the Line marker and the wrapper
    functions for the line.
    """
    fig = options.get('_fig', False)
    [line] = plotting._create_marks(fig=fig, marks=[bq.Lines], options=options)
    plotting._add_marks(fig, [line])

    def x_func_wrapped(**interact_params):
        line.x = util.maybe_call(x_fn, interact_params, prefix='x')

    def y_func_wrapped(**interact_params):
        line.y = util.maybe_call(y_fn, interact_params, prefix='y')

    return x_func_wrapped, y_func_wrapped


class Plot(object):

    NAME_TO_FUNC = {'line': _Line}

    def __init__(self, options={}, widgets={}, functions={}, marks={}):
        self.options = options
        self.widgets = widgets
        self.functions = functions
        self.marks = marks.values()
        self.figure = plotting._create_fig_with_options(options=options)
        self.plot = plotting._create_fig_with_options(options=options)
        self.create_plot()

    def create_plot(self):
        """
        Generates the appropriate plot markers for each marker in the marks
        dictionary and links them with the specified widgets.
        """
        for mark_features_dict in self.marks:
            mark_name = mark_features_dict['marker']
            mark_func = Plot.NAME_TO_FUNC[mark_name]
            # add in self.figure to options
            mark_features_dict['options'] = tz.assoc(
                mark_features_dict['options'], '_fig', self.figure
            )

            # removed mark from dictionary because it's not a param of
            # the plotting function
            no_marks_dict = self.minus_key('marker', mark_features_dict)
            x_func_wrapped, y_func_wrapped = mark_func(**no_marks_dict)
            self.link_interactive(mark_features_dict['x_fn'], x_func_wrapped)
            self.link_interactive(mark_features_dict['y_fn'], y_func_wrapped)
        return self

    def link_interactive(self, original_func, wrapped_func):
        """
        Creates a trailet link that maps the wrapper function to the
        appropriate widget as specified in the widgets dictionary. The widget
        specified by the API for the original_function will now be linekd
        with the wrapped function which allows dynamic updating.
        """
        if callable(original_func):
            req_arguments = util.get_required_args(original_func)
            req_widget_names = self.functions.get(original_func)
            argument_dict = dict(
                zip(
                    req_arguments,
                    [self.widgets.get(name) for name in req_widget_names]
                )
            )
            interactive_obj = widgets.interactive(
                wrapped_func, **argument_dict
            )
            initial_values = dict(
                zip(
                    req_arguments, [
                        self.widgets.get(name).get_interact_value()
                        for name in req_widget_names
                    ]
                )
            )
            wrapped_func(**initial_values)
        else:
            wrapped_func()

    def _ipython_display_(self):
        """
        Called when a Plot is returned on the last line of a Jupyter cell to
        automagically display the widgets and Figure.
        """
        display(widgets.VBox(list(self.widgets.values()) + [self.figure]))

    def minus_key(self, key, dictionary):
        """
        Creates copy of a dictionary with the specified key/value pair removed.
        """
        shallow_copy = dict(dictionary)
        del shallow_copy[key]
        return shallow_copy
