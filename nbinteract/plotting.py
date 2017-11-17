import numpy as np
import bqplot as bq
import ipywidgets as widgets
from IPython.display import display



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
    x_sc = bq.LinearScale()
    y_sc = bq.LinearScale()
    ax_x = bq.Axis(label='X', scale=x_sc, grid_lines='solid')
    ax_y = bq.Axis(label='Y', scale=y_sc, orientation='vertical',
                       grid_lines='solid')
    hist = bq.Hist(sample=np.array(np.arange(0, 1, 0.1)),
                       scales={'sample': x_sc, 'count': y_sc})
    fig = bq.Figure(axes=[ax_x, ax_y], marks=[hist],
                        title='First Example')

    def wrapped(**kwargs):
        hist.sample = hist_function(**kwargs)

    display_widgets = widgets.interactive(wrapped, **kwargs)
    display(display_widgets)
    display(fig)


def scatter(x_points, y_points, fit_reg=True):
    """
    This function generates an interactive scatter plot where the points
    can be dragged by users and linked to an update function.

    Args:
        ''x_points'' -- (array of ints)
        X values of data
        ''y_points'' -- (array of ints)
        Y values of data
        ''fit_reg'' -- (boolean)
        If true, plot linear regression line that updates when points are
        moved, else just plot the points without a line.

    Returns:
        None
    """
    # create line fit to data and display equation
    def update_line(change):
        lin.x = [np.min(scat.x), np.max(scat.x)]
        poly = np.polyfit(scat.x, scat.y, 1)
        lin.y = np.polyval(poly, lin.x)
        label.value = 'y = {:.2f} + {:.2f}x'.format(poly[1], poly[0])

    sc_x = bq.LinearScale()
    sc_y = bq.LinearScale()
    ax_x = bq.Axis(scale=sc_x)
    ax_y = bq.Axis(scale=sc_y, tick_format='0.2f', orientation='vertical')
    scat = bq.Scatter(x=x_points,
                   y=y_points,
                   scales={'x': sc_x, 'y': sc_y},
                   enable_move=True)

    # equation label
    label = widgets.Label()
    if fit_reg:
        # set up callback
        scat.observe(update_line, names=['x', 'y'])
        lin = bq.Lines(scales={'x': sc_x, 'y': sc_y}, animation_duration=5000)
        fig = bq.Figure(marks=[scat, lin], axes=[ax_x, ax_y])
        update_line(None)
    else:
        fig = bq.Figure(marks=[scat], axes=[ax_x, ax_y])
    # containers
    box = widgets.VBox([label, fig])
    # initialize plot and equation and display
    display(box)

