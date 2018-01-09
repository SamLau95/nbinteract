import nbinteract as nbi

from .util import run_doctests


def test_doctests():
    results = run_doctests(nbi.plotting)
    assert results.failed == 0
