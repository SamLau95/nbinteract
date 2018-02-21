"""
Copied from ds8/textbook.

This script takes the .ipynb files in the notebooks/ folder and removes the
hidden cells as well as the newlines before closing </div> tags so that the
resulting HTML partial can be embedded in a Gitbook page easily.

For reference:
https://nbconvert.readthedocs.org/en/latest/nbconvert_library.html
http://nbconvert.readthedocs.org/en/latest/nbconvert_library.html#using-different-preprocessors
"""

import glob
import re
import os

import nbformat
from nbinteract import InteractExporter
from traitlets.config import Config

# Use ExtractOutputPreprocessor to extract the images to separate files
config = Config()
config.InteractExporter.preprocessors = [
    'nbconvert.preprocessors.ExtractOutputPreprocessor',
]

# Output a HTML partial, not a complete page
html_exporter = InteractExporter(config=config)
html_exporter.template_file = 'gitbook'

INPUT_NOTEBOOKS = 'textbook/*.ipynb'

# Output notebook HTML partials into this directory
NOTEBOOK_HTML_DIR = 'notebooks-html'

# Output notebook HTML images into this directory
NOTEBOOK_IMAGE_DIR = 'notebooks-images'

# The prefix for each notebook + its dependencies
PATH_PREFIX = 'path=notebooks/{}'

# Used to ensure all the closing div tags are on the same line for Markdown to
# parse them properly
CLOSING_DIV_REGEX = re.compile('\s+</div>')


def convert_notebooks_to_html_partial(notebook_paths):
    """
    Converts notebooks in notebook_paths to HTML partials in NOTEBOOK_HTML_DIR
    """
    for notebook_path in notebook_paths:
        # Computes <name>.ipynb from notebooks/<name>.ipynb
        filename = notebook_path.split('/')[-1]
        # Computes <name> from <name>.ipynb
        basename = filename.split('.')[0]
        # Computes <name>.html from notebooks/<name>.ipynb
        outfile_name = basename + '.html'

        # This results in images like AB_5_1.png for a notebook called AB.ipynb
        unique_image_key = basename
        # This sets the img tag URL in the rendered HTML. This restricts the
        # the chapter markdown files to be one level deep. It isn't ideal, but
        # the only way around it is to buy a domain for the staging textbook as
        # well and we'd rather not have to do that.
        output_files_dir = '/' + NOTEBOOK_IMAGE_DIR

        extract_output_config = {
            'unique_key': unique_image_key,
            'output_files_dir': output_files_dir,
        }

        notebook = nbformat.read(notebook_path, 4)
        html, resources = html_exporter.from_notebook_node(
            notebook, resources=extract_output_config
        )

        # Remove newlines before closing div tags
        final_output = CLOSING_DIV_REGEX.sub('</div>', html)

        # Write out HTML
        outfile_path = os.path.join(os.curdir, NOTEBOOK_HTML_DIR, outfile_name)
        with open(outfile_path, 'w') as outfile:
            outfile.write(final_output)

        # Write out images
        for relative_path, image_data in resources['outputs'].items():
            image_name = relative_path.split('/')[-1]
            final_image_path = '{}/{}'.format(NOTEBOOK_IMAGE_DIR, image_name)
            with open(final_image_path, 'wb') as outimage:
                outimage.write(image_data)
        print(outfile_path + " written.")


if __name__ == '__main__':
    notebook_paths = glob.glob(INPUT_NOTEBOOKS)
    os.makedirs(NOTEBOOK_HTML_DIR, exist_ok=True)
    os.makedirs(NOTEBOOK_IMAGE_DIR, exist_ok=True)
    convert_notebooks_to_html_partial(notebook_paths)
