import nbinteract as nbi

from .util import run_doctests


def test_doctests():
    results = run_doctests(nbi.util)
    assert results.failed == 0
