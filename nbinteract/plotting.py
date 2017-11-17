import numpy as np
import bqplot
from IPython.display import display
import ipywidgets as widgets


def hist(hist_function, **kwargs):
    """
    This function generates an interactive histogram that allows users to
    interact with parameters of hist_function and visualize changes in the
    histogram.

    Args:
        ''hist_function'' -- (function)
        Function takes in parameters that should be interactive and returns
        an array of value that reflects the modified histogram data.

        ''kwargs'' --
        Parameters to pass into hist_function.

    Returns:
        None
    """
    x_sc = bqplot.LinearScale()
    y_sc = bqplot.LinearScale()
    ax_x = bqplot.Axis(label='X', scale=x_sc, grid_lines='solid')
    ax_y = bqplot.Axis(label='Y', scale=y_sc, orientation='vertical',
                       grid_lines='solid')
    hist = bqplot.Hist(sample=np.array(np.arange(0, 1, 0.1)),
                       scales={'sample': x_sc, 'count': y_sc})
    fig = bqplot.Figure(axes=[ax_x, ax_y], marks=[hist],
                        title='First Example')

    def wrapped(**kwars):
        hist.sample = hist_function(**kwargs)

    display_widgets = widgets.interactive(wrapped, **kwargs)
    display(display_widgets)
    display(fig)
