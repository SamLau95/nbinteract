import nbinteract as nbi

from .util import run_doctests


def test_doctests():
    results = run_doctests(nbi.questions)
    assert results.failed == 0
