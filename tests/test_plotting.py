import doctest

import nbinteract as nbi

FLAGS = doctest.NORMALIZE_WHITESPACE | doctest.IGNORE_EXCEPTION_DETAIL


def test_doctests():
    results = doctest.testmod(nbi.plotting, optionflags=FLAGS)
    assert results.failed == 0
