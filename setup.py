"""
A Jupyter nbconvert exporter to convert notebooks and their widgets to publicly
runnable HTML files.
"""
# Always prefer setuptools over distutils
from setuptools import setup
from setuptools.command.test import test as TestCommand

# To use a consistent encoding
from codecs import open
from os import path
import sys

# Package version
version = '0.2.4'

here = path.abspath(path.dirname(__file__))

# Get the long description from the README file
with open(path.join(here, 'README.md'), encoding='utf-8') as f:
    long_description = f.read()

# Get requirements from requirements.txt
with open(path.join(here, 'requirements.txt'), encoding='utf-8') as f:
    install_requires = f.readlines()


class PyTest(TestCommand):
    user_options = [('pytest-args=', 'a', "Arguments to pass to py.test")]

    def initialize_options(self):
        TestCommand.initialize_options(self)
        self.pytest_args = ['tests']

    def finalize_options(self):
        TestCommand.finalize_options(self)

    def run_tests(self):
        # import here, cause outside the eggs aren't loaded
        import pytest
        errno = pytest.main(self.pytest_args)
        sys.exit(errno)


setup(
    name='nbinteract',
    version=version,
    description='Export interactive HTML pages from Jupyter Notebooks',
    long_description=long_description,
    url='https://github.com/SamLau95/nbinteract',
    author='Sam Lau',
    author_email='samlau95@gmail.com',
    license='MIT',

    # See https://pypi.python.org/pypi?%3Aaction=list_classifiers
    classifiers=[
        'Development Status :: 3 - Alpha',
        'Intended Audience :: Developers',
        'Topic :: Software Development :: Build Tools',
        'License :: OSI Approved :: MIT License',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.3',
        'Programming Language :: Python :: 3.4',
        'Programming Language :: Python :: 3.5',
        'Framework :: Jupyter',
    ],
    keywords='jupyter nbconvert interact',
    packages=['nbinteract'],
    package_data={'nbinteract': ['templates/*.tpl']},
    install_requires=install_requires,
    extras_require={
        'dev': ['check-manifest'],
        'test': ['pytest', 'coverage', 'coveralls'],
    },
    cmdclass={'test': PyTest},

    # Add exporter to nbconvert CLI:
    # https://nbconvert.readthedocs.io/en/latest/external_exporters.html
    entry_points={
        'nbconvert.exporters': ['interact = nbinteract:InteractExporter'],
        'console_scripts': ['nbinteract = nbinteract.cli:main'],
    }
)
