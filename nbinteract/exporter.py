"""NbInteract is a utility to convert .ipynb files and their widgets to
publicly viewable, interact HTML pages.

This file defines the Exporter for the NbInteract conversion utility. After
installing this package, the user can run

    jupyter nbconvert --to interact SomeNotebook.ipynb

To export their notebook.

Reference: https://nbconvert.readthedocs.io/en/latest/external_exporters.html
"""

__all__ = ['InteractExporter']

from nbconvert import HTMLExporter
import os
from traitlets import default


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
