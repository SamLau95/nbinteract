import pytest
import os
import nbinteract.cli as cli
import toolz as tz
import re
from contextlib import contextmanager
from os.path import basename, join
from glob import glob

curdir = os.path.abspath(os.path.dirname(__file__))

TEST_NOTEBOOKS_FOLDER = join(curdir, 'test_notebooks')
TEST_NOTEBOOKS_SUBFOLDER = join(TEST_NOTEBOOKS_FOLDER, 'subdir')

TEST_NOTEBOOKS = {
    'empty':
        join(TEST_NOTEBOOKS_FOLDER, 'empty.ipynb'),
    'interact':
        join(TEST_NOTEBOOKS_FOLDER, 'basic_interact.ipynb'),
    'nbinteract':
        join(TEST_NOTEBOOKS_FOLDER, 'basic_nbinteract.ipynb'),
    'cleared_interact':
        join(TEST_NOTEBOOKS_FOLDER, 'cleared_interact.ipynb'),
    'cleared_nbinteract':
        join(TEST_NOTEBOOKS_FOLDER, 'cleared_nbinteract.ipynb'),
    'images':
        join(TEST_NOTEBOOKS_FOLDER, 'matplotlib_plots.ipynb'),
    'nested':
        join(TEST_NOTEBOOKS_SUBFOLDER, 'nested_basic_interact.ipynb'),
}

TEST_SPEC = 'a/test/spec'

NBINTERACT_SCRIPT = (
    '<script src="https://unpkg.com/nbinteract-core" async></script>'
)

TOP_BUTTON_RE = re.compile(r'<div class="cell text_cell">')

WIDGET_BUTTON_RE = re.compile(r'<button class="js-nbinteract-widget">')


def args(new_args):
    return tz.merge({
        '--help': False,
        '--images': None,
        '--no-top-button': False,
        '--output': None,
        '--recursive': None,
        '--spec': TEST_SPEC,
        '--template': 'full',
        '--execute': False,
        'NOTEBOOKS': [],
        'init': False
    }, new_args)


def html_name(nb):
    return nb.replace('.ipynb', '.html')


@contextmanager
def convert_one(notebook, cli_args={}, name_only=False):
    """
    Runs cli.run_converter on one notebook file and yields a file object opened
    on the resulting HTML file.

    If name_only=True, only returns the file name without opening the file.

    Removes file when exiting context.
    """
    cli_args['NOTEBOOKS'] = [notebook]
    [html_file] = cli.run_converter(args(cli_args))

    if name_only:
        yield html_file
    else:
        with open(html_file, encoding='utf-8') as f:
            yield f

    os.remove(html_file)


@contextmanager
def convert_many(notebooks, cli_args={}):
    """
    Runs cli.run_converter on multiple notebook files and yields the list of
    HTML file paths.

    Removes all generated files when exiting context.
    """
    cli_args['NOTEBOOKS'] = notebooks
    html_files = cli.run_converter(args(cli_args))

    yield html_files

    for html_file in html_files:
        os.remove(html_file)


class TestCli(object):
    """Tests for cli.py."""

    def test_basic(self):
        """
        Tests that converter produces the correct HTML file.
        """
        with convert_one(TEST_NOTEBOOKS['empty'], name_only=True) as html_file:
            assert os.path.isfile(html_file)

    def test_spec(self):
        """
        Tests that spec is set correctly in NbInteract initialization
        """
        with convert_one(TEST_NOTEBOOKS['empty']) as f:
            assert any("spec: '{}'".format(TEST_SPEC) in line for line in f)

        with convert_one(
            TEST_NOTEBOOKS['empty'], {
                '--spec': 'another/test/spec',
            }
        ) as f:
            assert any(
                "spec: '{}'".format('another/test/spec') in line for line in f
            )

    def test_plain_template(self):
        """
        Tests that nbinteract is not loaded in the plain template but that
        widget buttons are generated.
        """
        with convert_one(
            TEST_NOTEBOOKS['interact'], {
                '--template': 'plain',
            }
        ) as f:
            html = ''.join(f.readlines())
            assert NBINTERACT_SCRIPT not in html
            assert WIDGET_BUTTON_RE.search(html)

    def test_partial_template(self):
        """
        Tests that nbinteract is loaded in the partial template and that the
        template doesn't output a complete HTML page.
        """
        with convert_one(
            TEST_NOTEBOOKS['interact'], {
                '--template': 'partial',
            }
        ) as f:
            html = ''.join(f.readlines())
            assert NBINTERACT_SCRIPT in html
            assert '<html>' not in html
            assert WIDGET_BUTTON_RE.search(html)

    def test_full_template(self):
        """
        Tests that nbinteract is loaded in the full template and that the
        template outputs a complete HTML page.
        """
        with convert_one(TEST_NOTEBOOKS['interact'], {
            '--template': 'full',
        }) as f:
            html = ''.join(f.readlines())
            assert NBINTERACT_SCRIPT in html
            assert '<html>' in html
            assert WIDGET_BUTTON_RE.search(html)

    def test_top_button(self):
        """
        Tests that by default, a button at the top of the page is generated.

        Also tests that the --no-top-button flag switches off the button.
        """
        with convert_one(TEST_NOTEBOOKS['interact'], {
            '--template': 'plain'
        }) as f:
            html = ''.join(f.readlines())
            assert TOP_BUTTON_RE.search(html)

        with convert_one(
            TEST_NOTEBOOKS['interact'], {
                '--template': 'plain',
                '--no-top-button': True,
            }
        ) as f:
            html = ''.join(f.readlines())
            assert not TOP_BUTTON_RE.search(html)

    def test_output(self, tmpdir):
        """
        Tests that the output flag sends HTML files to the specified directory.
        """
        with convert_many(
            [TEST_NOTEBOOKS['nbinteract'], TEST_NOTEBOOKS['interact']], {
                '--output': str(tmpdir)
            }
        ) as html_files:
            assert all(
                basename(f) in os.listdir(str(tmpdir)) for f in html_files
            )

    def test_images(self, tmpdir):
        """
        Tests that the images flag sends images to the specified directory.
        """
        with convert_many([TEST_NOTEBOOKS['empty'], TEST_NOTEBOOKS['images']],
                          {
                              '--output': str(tmpdir),
                              '--images': str(tmpdir),
                          }):
            assert len(glob('{}/*.png'.format(tmpdir))) == 2

    def test_folder(self):
        """
        Tests that passing in a folder converts all notebooks in the folder.
        """
        expected_files = {
            'empty.html', 'basic_interact.html', 'basic_nbinteract.html',
            'cleared_interact.html', 'cleared_nbinteract.html',
            'matplotlib_plots.html'
        }
        with convert_many([TEST_NOTEBOOKS_FOLDER]) as html_files:
            assert set(map(basename, html_files)) == expected_files

    def test_recursive(self):
        """
        Tests that the recursive flag also converts notebooks in subfolders.
        """
        expected_files = {
            'empty.html', 'basic_interact.html', 'basic_nbinteract.html',
            'cleared_interact.html', 'cleared_nbinteract.html',
            'matplotlib_plots.html', 'nested_basic_interact.html'
        }
        with convert_many([TEST_NOTEBOOKS_FOLDER], {
            '--recursive': True
        }) as html_files:
            assert set(map(basename, html_files)) == expected_files

    def test_recursive_output(self, tmpdir):
        """
        Tests that the recursive flag with output flag converts notebooks
        in subfolders into a flat output folder.
        """
        expected_files = {
            'empty.html', 'basic_interact.html', 'basic_nbinteract.html',
            'cleared_interact.html', 'cleared_nbinteract.html',
            'matplotlib_plots.html', 'nested_basic_interact.html'
        }
        with convert_many([TEST_NOTEBOOKS_FOLDER], {
            '--recursive': True,
            '--output': str(tmpdir)
        }):
            assert set(map(basename,
                           os.listdir(str(tmpdir)))) == expected_files

    @pytest.mark.slow
    def test_execute(self):
        """
        Tests that converting a notebook with the --execute flag corrently
        generates widgets for `ipywidgets.interact()` calls.
        """
        with convert_one(
            TEST_NOTEBOOKS['cleared_interact'], {
                '--execute': True,
            }
        ) as f:
            html = ''.join(f.readlines())
            assert TOP_BUTTON_RE.search(html)
            assert WIDGET_BUTTON_RE.search(html)

        with convert_one(
            TEST_NOTEBOOKS['cleared_nbinteract'], {
                '--execute': True,
            }
        ) as f:
            html = ''.join(f.readlines())
            assert TOP_BUTTON_RE.search(html)
            assert WIDGET_BUTTON_RE.search(html)
