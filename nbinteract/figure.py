"""
Methods of the Figure and Plot class to create more complex plots.
"""

import bqplot as bq
import ipywidgets as widgets
import toolz.curried as tz
from collections import namedtuple
from IPython.display import display
from . import util
from . import plotting

__all__ = ['Hist', 'Bar', 'Scatter', 'Line', 'Figure']

Hist = namedtuple('Hist', ['x_fn', 'options'])
Bar = namedtuple('Bar', ['x_fn', 'y_fn', 'options'])
Scatter = namedtuple('Scatter', ['x_fn', 'y_fn', 'options'])
Line = namedtuple('Line', ['x_fn', 'y_fn', 'options'])
"""
Sets options to be an empty dict by default for the namedtuples above.
https://stackoverflow.com/a/18348004
"""
for mark_type in [Hist, Bar, Scatter, Line]:
    mark_type.__new__.__defaults__ = {},


@plotting.use_options([
    'title', 'aspect_ratio', 'animation_duration', 'xlabel', 'ylabel', 'xlim',
    'ylim', 'bins', 'normalized'
])
def _Hist(fig, x_fn, *, options={}):
    """
    Internal Hist function that generates the Hist marker and the wrapper
    functions for the histogram.
    """
    params = {
        'marks': [{
            'sample': plotting._array_or_placeholder(x_fn),
            'bins': plotting._get_option('bins'),
            'normalized': plotting._get_option('normalized'),
            'scales': (
                lambda opts: {'sample': opts['x_sc'], 'count': opts['y_sc']}
            ),
        }],
    }
    [hist] = plotting._create_marks(
        fig=fig, marks=[bq.Hist], options=options, params=params
    )

    def x_fn_wrapped(**interact_params):
        hist.sample = util.maybe_call(x_fn, interact_params)

    return hist, [x_fn_wrapped]


@plotting.use_options([
    'title', 'aspect_ratio', 'animation_duration', 'xlabel', 'ylabel', 'ylim'
])
def _Bar(fig, x_fn, y_fn, *, options={}):
    params = {
        'marks': [{
            'x':
                plotting._array_or_placeholder(
                    x_fn, plotting.PLACEHOLDER_RANGE
                ),
            'y':
                plotting._array_or_placeholder(y_fn)
        }]
    }
    [bar] = plotting._create_marks(
        fig=fig, marks=[bq.Bars], options=options, params=params
    )

    def x_fn_wrapped(**interact_params):
        x_data = util.maybe_call(x_fn, interact_params, prefix='x')
        bar.x = x_data

    def y_fn_wrapped(**interact_params):
        y_data = util.maybe_call(y_fn, interact_params, prefix='y')
        bar.y = y_data

    return bar, [x_fn_wrapped, y_fn_wrapped]


@plotting.use_options([
    'title', 'aspect_ratio', 'animation_duration', 'xlabel', 'ylabel', 'xlim',
    'ylim', 'marker'
])
def _Scatter(fig, x_fn, y_fn, *, options={}):
    params = {
        'marks': [{
            'x': plotting._array_or_placeholder(x_fn),
            'y': plotting._array_or_placeholder(y_fn),
            'marker': plotting._get_option('marker'),
        }]
    }
    [scat] = plotting._create_marks(
        fig=fig, marks=[bq.Scatter], options=options, params=params
    )

    def x_fn_wrapped(**interact_params):
        x_data = util.maybe_call(x_fn, interact_params, prefix='x')
        scat.x = x_data

    def y_fn_wrapped(**interact_params):
        y_data = util.maybe_call(y_fn, interact_params, prefix='y')
        scat.y = y_data

    return scat, [x_fn_wrapped, y_fn_wrapped]


@plotting.use_options([
    'title', 'aspect_ratio', 'animation_duration', 'xlabel', 'ylabel', 'xlim',
    'ylim'
])
def _Line(fig, x_fn, y_fn, *, options={}):
    """
    Internal Line function that generates the Line marker and the wrapper
    functions for the line.
    """

    [line] = plotting._create_marks(fig=fig, marks=[bq.Lines], options=options)

    def x_fn_wrapped(**interact_params):
        x_data = util.maybe_call(x_fn, interact_params, prefix='x')
        line.x = x_data

    def y_fn_wrapped(**interact_params):
        y_data = util.maybe_call(y_fn, interact_params, prefix='y')
        line.y = y_data

    return line, [x_fn_wrapped, y_fn_wrapped]


class Figure(object):

    MARK_TO_MARK_GENERATORS = {
        Hist: _Hist,
        Bar: _Bar,
        Scatter: _Scatter,
        Line: _Line
    }

    def __init__(self, options={}, widgets={}, functions={}, marks={}):
        """
        nbi.Plot(
            options = {'xlim': (0, 100), 'ylim':(0,100)},
            widgets={'widget_x': widgets.IntSlider(5, 0, 50)},
            functions={x_values: ['widget_x'], y_values: ['widget_x']},
            marks={'scat1': nbi.Scatter(x_values, y_values)}
        )
        """
        self.options = options
        self.widgets = widgets
        self.functions = functions
        self.marks = list(marks.values())
        self.figure = plotting._create_fig_with_options(options=options)
        self._create_plot()

    def _create_plot(self):
        """
        Generates the appropriate plot markers for each marker in the marks
        dictionary and links them with the specified widgets.
        """
        for mark in self.marks:
            mark_fn = self.MARK_TO_MARK_GENERATORS[type(mark)]
            bq_mark, wrapped_fns = mark_fn(self.figure, **mark._asdict())
            self.figure.marks = self.figure.marks + [bq_mark]

            if 'x_fn' in mark._fields:
                self._link_widgets_to_function(mark.x_fn, wrapped_fns[0])
            if 'y_fn' in mark._fields:
                self._link_widgets_to_function(mark.y_fn, wrapped_fns[1])

    def _link_widgets_to_function(self, original_fn, wrapped_fn):
        """
        Original_fn returns data, wrapped_fn wraps the original_fn so that
        its data outputs modify the figure marks. This function links the
        widgets passed in by the user to the parameters of wrapped_fn.

        In order initial output, we make one call to wrapped_fn with
        the initial values of the widgets. If the original_fn is not callable,
        e.g. is data, wrapped_fn takes in no parameters so we call it without
        linking widgets.
        """
        if not callable(original_fn):
            wrapped_fn()
            return

        args = util.get_all_args(original_fn)
        widget_names = self.functions[original_fn]
        fn_widgets = [self.widgets[name] for name in widget_names]
        initial_widget_values = [w.get_interact_value() for w in fn_widgets]

        widget_args = dict(zip(args, fn_widgets))
        # this links widgets to the wrapped_fn
        widgets.interactive(wrapped_fn, **widget_args)

        initial_values = dict(zip(args, initial_widget_values))
        # calling wrapped_fn generates initial plot mark
        wrapped_fn(**initial_values)

    def _ipython_display_(self):
        """
        Called when a Plot is returned on the last line of a Jupyter cell to
        automagically display the widgets and Figure.
        """
        display(widgets.VBox(list(self.widgets.values()) + [self.figure]))
