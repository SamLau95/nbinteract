"""
Utilities for test cases. This file doesn't actually contain any test cases.
"""
import doctest

FLAGS = (
    doctest.NORMALIZE_WHITESPACE
    | doctest.IGNORE_EXCEPTION_DETAIL
    | doctest.ELLIPSIS
)


def run_doctests(module, flags=FLAGS):
    """
    Runs doctests with our default flags
    """
    return doctest.testmod(module, optionflags=flags)
