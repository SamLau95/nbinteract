import numpy as np
import bqplot as bq
import collections
import ipywidgets as widgets
from IPython.display import display

from . import util

__all__ = ['hist', 'bar', 'scatter_drag']


DARK_BLUE = '#475A77'
GOLDENROD = '#FEC62C'

# Default plot options
_default_options = {
    'title': '',
    'xlabel': '',
    'ylabel': '',
    'xlim': (None, None),
    'ylim': (None, None),
}

PLACEHOLDER_ZEROS = np.zeros(10)
PLACEHOLDER_RANGE = np.arange(10)


def hist(hist_function, options={}, **interact_params):
    """
    Generates an interactive histogram that allows users to change the
    parameters of the input hist_function.

    Args:
        hist_function (Array | (*args -> Array int | Array float)):
            Function that takes in parameters to interact with and returns an
            array of numbers. These numbers will be plotted in the resulting
            histogram.

        options (dict): Options for the plot. Available options:

            title: Title of the plot
            xlabel: Label of the x-axis
            ylabel: Label of the y-axis
            xlim: Tuple containing (lower, upper) for x-axis
            ylim: Tuple containing (lower, upper) for y-axis

        interact_params (dict): Keyword arguments in the same format as
            `ipywidgets.interact`. One argument is required for each argument
            of `hist_function`.

    Returns:
        None

    >>> def gen_random(n_points):
    ...     return np.random.normal(size=n_points)
    >>> hist(gen_random, n_points=(0, 1000, 10))
    interactive(...)
    """
    options = {**_default_options, **options}

    x_sc = bq.LinearScale(min=options['xlim'][0], max=options['xlim'][1])
    y_sc = bq.LinearScale(min=options['ylim'][0], max=options['ylim'][1])

    ax_x = bq.Axis(label=options['xlabel'], scale=x_sc, grid_lines='solid')
    ax_y = bq.Axis(label=options['ylabel'], scale=y_sc, orientation='vertical',
                   grid_lines='solid')

    hist = bq.Hist(sample=_array_or_placeholder(hist_function),
                   scales={'sample': x_sc, 'count': y_sc},
                   colors=[DARK_BLUE],
                   stroke=DARK_BLUE)
    fig = bq.Figure(axes=[ax_x, ax_y], marks=[hist], title=options['title'])

    def wrapped(**interact_params):
        hist.sample = util.call_if_needed(hist_function, interact_params)

    display_widgets = widgets.interactive(wrapped, **interact_params)
    display(display_widgets)
    display(fig)


def bar(x_fn, y_fn, options={}, **interact_params):
    """
    Generates an interactive bar chart that allows users to change the
    parameters of the inputs x_fn and y_fn.

    Args:
        x_fn (Array | (*args -> Array str | Array int | Array float)):
            If array, uses array values for categories of bar chart.

            If function, must take parameters to interact with and return an
            array of strings or numbers. These will become the categories on
            the x-axis of the bar chart.

        y_fn (Array | (Array, *args -> Array int | Array float)):
            If array, uses array values for heights of bars.

            If function, must take in the output of x_fn as its first parameter
            and optionally other parameters to interact with. Must return an
            array of numbers. These will become the heights of the bars on the
            y-axis.

        options (dict): Options for the plot. Available options:

            title: Title of the plot
            xlabel: Label of the x-axis
            ylabel: Label of the y-axis
            ylim: Tuple containing (lower, upper) for y-axis

        interact_params (dict): Keyword arguments in the same format as
            `ipywidgets.interact`. One argument is required for each argument
            of both `x_fn` and `y_fn`. If `x_fn` and `y_fn` have conflicting
            parameter names, prefix the corresponding kwargs with `x__` and
            `y__`.

    Returns:
        None

    >>> bar(['a', 'b', 'c'], [4, 7, 10])
    interactive(...)

    >>> def categories(n): return np.arange(n)
    >>> def heights(xs, offset):
    ...     return xs + offset
    >>> bar(categories, heights, n=(0, 10), offset=(1, 10))
    interactive(...)

    >>> def multiply(xs, n):
    ...     return xs * n
    >>> bar(categories, multiply, x__n=(0, 10), y__n=(1, 10))
    interactive(...)
    """
    options = {**_default_options, **options}

    x_sc = bq.OrdinalScale()
    y_sc = bq.LinearScale(min=options['ylim'][0], max=options['ylim'][1])

    ax_x = bq.Axis(label=options['xlabel'], scale=x_sc, grid_lines='solid')
    ax_y = bq.Axis(label=options['ylabel'], scale=y_sc, orientation='vertical',
                   grid_lines='solid')

    bar = bq.Bars(x=_array_or_placeholder(x_fn, PLACEHOLDER_RANGE),
                  y=_array_or_placeholder(y_fn),
                  scales={'x': x_sc, 'y': y_sc},
                  colors=[DARK_BLUE],
                  stroke=DARK_BLUE)
    fig = bq.Figure(axes=[ax_x, ax_y], marks=[bar], title=options['title'])

    def wrapped(**interact_params):
        x_data = util.call_if_needed(x_fn, interact_params, prefix='x')
        bar.x = x_data

        y_bound = util.maybe_curry(y_fn, x_data)
        bar.y = util.call_if_needed(y_bound, interact_params, prefix='y')

    display_widgets = widgets.interactive(wrapped, **interact_params)
    display(display_widgets)
    display(fig)


def scatter_drag(x_points: 'Array', y_points: 'Array', show_eqn=True,
                 options={}):
    """
    Generates an interactive scatter plot with the best fit line plotted over
    the points. The points can be dragged by the user and the line will
    automatically update.

    Args:
        x_points (Array Number): x-values of points to plot

        y_points (Array Number): y-values of points to plot

        show_eqn (bool): If True (default), displays the best fit line's
            equation above the scatterplot.

        options (dict): Options for the plot. Available options:

            title: Title of the plot
            xlabel: Label of the x-axis
            ylabel: Label of the y-axis
            xlim: Tuple containing (lower, upper) for x-axis
            ylim: Tuple containing (lower, upper) for y-axis

    Returns:
        None

    >>> xs = np.arange(10)
    >>> ys = np.arange(10) + np.random.rand(10)
    >>> scatter_drag(xs, ys)
    VBox(...)
    """
    options = {**_default_options, **options}

    x_sc = bq.LinearScale(min=options['xlim'][0], max=options['xlim'][1])
    y_sc = bq.LinearScale(min=options['ylim'][0], max=options['ylim'][1])

    ax_x = bq.Axis(label=options['xlabel'], scale=x_sc, grid_lines='solid')
    ax_y = bq.Axis(label=options['ylabel'], scale=y_sc, orientation='vertical',
                   grid_lines='solid')

    scat = bq.Scatter(x=x_points,
                      y=y_points,
                      scales={'x': x_sc, 'y': y_sc},
                      colors=[DARK_BLUE],
                      stroke=DARK_BLUE,
                      enable_move=True)

    lin = bq.Lines(scales={'x': x_sc, 'y': y_sc},
                   animation_duration=5000,
                   colors=[GOLDENROD])
    fig = bq.Figure(marks=[scat, lin],
                    axes=[ax_x, ax_y],
                    title=options['title'])

    # equation label
    label = widgets.Label()

    # create line fit to data and display equation
    def update_line(change=None):
        lin.x = [x_sc.min if x_sc.min is not None else np.min(scat.x),
                 x_sc.max if x_sc.max is not None else np.max(scat.x)]
        poly = np.polyfit(scat.x, scat.y, deg=1)
        lin.y = np.polyval(poly, lin.x)
        if show_eqn:
            label.value = 'y = {:.2f} + {:.2f}x'.format(poly[1], poly[0])
    update_line()

    scat.observe(update_line, names=['x', 'y'])

    layout = widgets.VBox([label, fig])
    display(layout)


def _array_or_placeholder(maybe_iterable,
                          placeholder=PLACEHOLDER_ZEROS) -> np.array:
    """
    Return maybe_iterable's contents or a placeholder array.

    Used to give bqplot its required initial points to plot even if we're using
    a function to generate points.
    """
    if isinstance(maybe_iterable, collections.Iterable):
        return np.array([i for i in maybe_iterable])
    return placeholder
