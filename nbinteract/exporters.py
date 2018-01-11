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
from subprocess import run, PIPE
from IPython.display import display, Javascript, Markdown

from nbconvert import HTMLExporter
from traitlets import default

CONVERT_SUCCESS_MD = '''
Successfully converted!

<a href="{url}" target="_blank" download>Click to download your webpage.</a>

To host your webpage, see the documentation:
https://samlau95.gitbooks.io/nbinteract/tutorial/tutorial_publishing.html
'''

ERROR_MESSAGE = '''
Error when converting :(

Double check that you didn't misspell your filename. This is the filename you
wanted to publish: {filename}.

If you believe this is an error with the package, please report an issue at
https://github.com/SamLau95/nbinteract/issues/new and include the error output
below:

stderr output:
==============
{res.stderr}

stdout output:
==============
{res.stdout}
'''


class InteractExporter(HTMLExporter):
    """
    Custom exporter for nbconvert that outputs the same thing as the default
    HTMLExporter with a line to load the nbinteract Javascript bundle instead
    of the default JS libraries.
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
        self.template_path.append(os.path.dirname(__file__))

    @default('template_file')
    def _template_file_default(self):
        return 'interact_template.tpl'


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
        raise ValueError("{} isn't a path to a file. Double check your "
                         "filename and try again.".format(nb_name))

    if save_first:
        _save_nb(nb_name)

    print('Converting notebook...')
    process = run(['jupyter', 'nbconvert', '--to', 'interact', nb_name],
                  stdout=PIPE, stderr=PIPE)
    if process.returncode != 0:
        logging.warning(ERROR_MESSAGE.format(filename=nb_name, res=process))
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
        logging.warning("Could not save your notebook (timed out waiting for "
                        "IPython save). Make sure your notebook is saved "
                        "and export again.")


def _wait_for_save(nb_name, timeout=5):
    """Waits for nb_name to update, waiting up to TIMEOUT seconds.
    Returns True if a save was detected, and False otherwise.
    """
    modification_time = os.path.getmtime(nb_name)
    start_time = time.time()
    while time.time() < start_time + timeout:
        if (os.path.getmtime(nb_name) > modification_time
                and os.path.getsize(nb_name) > 0):
            return True
        time.sleep(0.2)
    return False
