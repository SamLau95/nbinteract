"""
Methods of the Figure and Plot class to create more complex plots.
"""

import bqplot as bq
import ipywidgets as widgets
import toolz.curried as tz
from IPython.display import display
from . import util
from . import plotting

__all__ = ['Hist', 'Bar', 'Scatter', 'Line', 'Plot']


def Hist(hist_function, *, options={}):
    """
    Creates a Hist object used to pass into the Plot object,
    """
    return {'marker': 'hist', 'x_fn': hist_function, 'options': options}


def Bar(x_fn, y_fn, *, options={}):
    """
    Creates a Bar object used to pass into the Plot object.
    """
    return {'marker': 'bar', 'x_fn': x_fn, 'y_fn': y_fn, 'options': options}


def Scatter(x_fn, y_fn, *, options={}):
    """
     Creates a Scatter object used to pass into the Plot object.
    """
    return {
        'marker': 'scatter',
        'x_fn': x_fn,
        'y_fn': y_fn,
        'options': options
    }


def Line(x_fn, y_fn, options={}):
    """
    Creates a Line object used to pass into the Plot object.
    """
    return {'marker': 'line', 'x_fn': x_fn, 'y_fn': y_fn, 'options': options}


@plotting.use_options([
    'title', 'aspect_ratio', 'animation_duration', 'xlabel', 'ylabel', 'xlim',
    'ylim', 'bins', 'normalized'
])
def _Hist(x_fn, *, options={}):
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
        fig=options.get('_fig'),
        marks=[bq.Hist],
        options=options,
        params=params
    )

    def x_fn_wrapped(**interact_params):
        hist.sample = util.maybe_call(x_fn, interact_params)

    return {'mark': hist, 'fns': [x_fn_wrapped]}


@plotting.use_options([
    'title', 'aspect_ratio', 'animation_duration', 'xlabel', 'ylabel', 'ylim'
])
def _Bar(x_fn, y_fn, *, options={}):
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
        fig=options.get('_fig'),
        marks=[bq.Bars],
        options=options,
        params=params
    )

    def x_fn_wrapped(**interact_params):
        x_data = util.maybe_call(x_fn, interact_params, prefix='x')
        bar.x = x_data

    def y_fn_wrapped(**interact_params):
        y_data = util.maybe_call(y_fn, interact_params, prefix='y')
        bar.y = y_data

    return {'mark': bar, 'fns': [x_fn_wrapped, y_fn_wrapped]}


@plotting.use_options([
    'title', 'aspect_ratio', 'animation_duration', 'xlabel', 'ylabel', 'xlim',
    'ylim', 'marker'
])
def _Scatter(x_fn, y_fn, *, options={}):
    params = {
        'marks': [{
            'x': plotting._array_or_placeholder(x_fn),
            'y': plotting._array_or_placeholder(y_fn),
            'marker': plotting._get_option('marker'),
        }]
    }
    [scat] = plotting._create_marks(
        fig=options.get('_fig'),
        marks=[bq.Scatter],
        options=options,
        params=params
    )

    def x_fn_wrapped(**interact_params):
        x_data = util.maybe_call(x_fn, interact_params, prefix='x')
        scat.x = x_data

    def y_fn_wrapped(**interact_params):
        y_data = util.maybe_call(y_fn, interact_params, prefix='y')
        scat.y = y_data

    return {'mark': scat, 'fns': [x_fn_wrapped, y_fn_wrapped]}


@plotting.use_options([
    'title', 'aspect_ratio', 'animation_duration', 'xlabel', 'ylabel', 'xlim',
    'ylim'
])
def _Line(x_fn, y_fn, *, options={}):
    """
    Internal Line function that generates the Line marker and the wrapper
    functions for the line.
    """

    [line] = plotting._create_marks(
        fig=options.get('_fig'), marks=[bq.Lines], options=options
    )

    def x_fn_wrapped(**interact_params):
        x_data = util.maybe_call(x_fn, interact_params, prefix='x')
        line.x = x_data

    def y_fn_wrapped(**interact_params):
        y_data = util.maybe_call(y_fn, interact_params, prefix='y')
        line.y = y_data

    return {'mark': line, 'fns': [x_fn_wrapped, y_fn_wrapped]}


class Plot(object):

    NAME_TO_FN = {
        'hist': _Hist,
        'bar': _Bar,
        'scatter': _Scatter,
        'line': _Line
    }

    def __init__(self, options={}, widgets={}, functions={}, marks={}):
        self.options = options
        self.widgets = widgets
        self.functions = functions
        self.marks = marks.values()
        self.figure = plotting._create_fig_with_options(options=options)
        self.plot = plotting._create_fig_with_options(options=options)
        self._create_plot()

    def _create_plot(self):
        """
        Generates the appropriate plot markers for each marker in the marks
        dictionary and links them with the specified widgets.
        """
        for mark_features_dict in self.marks:
            mark_name = mark_features_dict['marker']
            mark_fn = Plot.NAME_TO_FN[mark_name]
            # add in self.figure to options
            mark_features_dict['options'] = tz.assoc(
                mark_features_dict['options'], '_fig', self.figure
            )
            # removed mark from dictionary because it's not a param of
            # the plotting function
            no_marks_dict = tz.dissoc(mark_features_dict, 'marker')
            output_dict = mark_fn(**no_marks_dict)
            mark, wrapped_fns = output_dict['mark'], output_dict['fns']
            self.figure.marks = self.figure.marks + [mark]
            if 'x_fn' in mark_features_dict:
                self._link_interactive(
                    mark_features_dict['x_fn'], wrapped_fns[0]
                )
            if 'y_fn' in mark_features_dict:
                self._link_interactive(
                    mark_features_dict['y_fn'], wrapped_fns[1]
                )
        return self

    def _link_interactive(self, original_fn, wrapped_fn):
        """
        Creates a trailet link that maps the wrapper function to the
        appropriate widget as specified in the widgets dictionary. The widget
        specified by the API for the original_function will now be linekd
        with the wrapped function which allows dynamic updating.
        """
        if callable(original_fn):
            req_arguments = util.get_required_args(original_fn)
            req_widget_names = self.functions.get(original_fn)
            argument_dict = dict(
                zip(
                    req_arguments,
                    [self.widgets.get(name) for name in req_widget_names]
                )
            )
            interactive_obj = widgets.interactive(wrapped_fn, **argument_dict)
            initial_values = dict(
                zip(
                    req_arguments, [
                        self.widgets.get(name).get_interact_value()
                        for name in req_widget_names
                    ]
                )
            )
            wrapped_fn(**initial_values)
        else:
            wrapped_fn()

    def _ipython_display_(self):
        """
        Called when a Plot is returned on the last line of a Jupyter cell to
        automagically display the widgets and Figure.
        """
        display(widgets.VBox(list(self.widgets.values()) + [self.figure]))
