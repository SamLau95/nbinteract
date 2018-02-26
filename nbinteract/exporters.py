"""Utility to convert .ipynb files and their widgets to publicly viewable,
interactive HTML pages.

This file defines the Exporter for the NbInteract conversion utility. After
installing this package, the user can run

    nbinteract some_notebook.ipynb

To export their notebook.

The above command is an alias for:

    jupyter nbconvert --to interact some_notebook.ipynb

Reference: https://nbconvert.readthedocs.io/en/latest/external_exporters.html
"""

__all__ = ['InteractExporter', 'publish']

import os
import logging
import time
from subprocess import check_output, STDOUT, CalledProcessError
from IPython.display import display, Javascript, Markdown

from nbconvert import HTMLExporter
from traitlets import default

CONVERT_SUCCESS_MD = '''
Successfully converted!

<a href="{url}" target="_blank" download>Click to download your webpage.</a>

To host your webpage, see the documentation:
<a href="https://www.nbinteract.com/tutorial/tutorial_publishing.html"
        target="_blank">
    https://www.nbinteract.com/tutorial/tutorial_publishing.html
</a>
'''

ERROR_MESSAGE = '''
Error when converting :(

Double check that you didn't misspell your filename. This is the filename you
wanted to publish: {filename}.

If you believe this is an error with the package, please report an issue at
https://github.com/SamLau95/nbinteract/issues/new and include the error output
below:

==============

{error}
'''


class InteractExporter(HTMLExporter):
    """
    nbconvert Exporter that converts a notebook to an HTML page with widgets
    enabled.

    Valid templates:

    - 'full': Outputs a complete standalone HTML page with default styling.
      Automatically loads the nbinteract JS library.
    - 'local': Like 'full', but uses a local copy of the JS package instead of
      the live one. Used for development only.
    - 'partial': Outputs an HTML partial that can be embedded in another page.
        Automatically loads the nbinteract JS library.
    - 'gitbook': Outputs an HTML partial used to embed in a Gitbook or other
      environments where the nbinteract JS library is already loaded.
    """

    def __init__(self, config=None, **kw):
        """
        Public constructor

        Parameters
        ----------
        config : config
            User configuration instance.
        extra_loaders : list[of Jinja Loaders]
            ordered list of Jinja loader to find templates. Will be tried in
            order before the default FileSystem ones.
        template : str (optional, kw arg)
            Template to use when exporting.
        """
        super(InteractExporter, self).__init__(config=config, **kw)

        # Add current dir to template_path so we can find the template
        self.template_path.insert(
            0, os.path.join(os.path.dirname(__file__), 'templates')
        )

    @default('template_file')
    def _template_file_default(self):
        return 'full.tpl'


def publish(nb_name, save_first=True):
    """
    Converts nb_name to an HTML file. Preserves widget functionality.

    Outputs a link to download HTML file after conversion if called in a
    notebook environment.

    Equivalent to running `nbinteract ${nb_name}` on the command line.

    Args:
        nb_name (str): Complete name of the notebook file to convert. Can be a
            relative path (eg. './foo/test.ipynb').

        save_first (bool): If True, saves the currently opened notebook before
            converting nb_name. Used to ensure notebook is written to
            filesystem before starting conversion. Does nothing if not in a
            notebook environment.

    Returns:
        None
    """
    if not os.path.isfile(nb_name):
        raise ValueError(
            "{} isn't a path to a file. Double check your "
            "filename and try again.".format(nb_name)
        )

    if save_first:
        _save_nb(nb_name)

    print('Converting notebook...')
    try:
        check_output(['jupyter', 'nbconvert', '--to', 'interact', nb_name],
                     stderr=STDOUT)
    except CalledProcessError as err:
        logging.warning(
            ERROR_MESSAGE.format(
                filename=nb_name, error=str(err.output, 'utf-8')
            )
        )
        return

    html_filename = os.path.splitext(nb_name)[0] + '.html'
    display(Markdown(CONVERT_SUCCESS_MD.format(url=html_filename)))


def _save_nb(nb_name):
    """
    Attempts to save notebook. If unsuccessful, shows a warning.
    """
    display(Javascript('IPython.notebook.save_checkpoint();'))
    display(Javascript('IPython.notebook.save_notebook();'))
    print('Saving notebook...', end=' ')

    if _wait_for_save(nb_name):
        print("Saved '{}'.".format(nb_name))
    else:
        logging.warning(
            "Could not save your notebook (timed out waiting for "
            "IPython save). Make sure your notebook is saved "
            "and export again."
        )


def _wait_for_save(nb_name, timeout=5):
    """Waits for nb_name to update, waiting up to TIMEOUT seconds.
    Returns True if a save was detected, and False otherwise.
    """
    modification_time = os.path.getmtime(nb_name)
    start_time = time.time()
    while time.time() < start_time + timeout:
        if (
            os.path.getmtime(nb_name) > modification_time
            and os.path.getsize(nb_name) > 0
        ):
            return True
        time.sleep(0.2)
    return False
