"""
Utilities for test cases. This file doesn't actually contain any test cases.
"""
import doctest

FLAGS = (
    doctest.NORMALIZE_WHITESPACE
    | doctest.IGNORE_EXCEPTION_DETAIL
    | doctest.ELLIPSIS
)

OC = doctest.OutputChecker


class AEOutputChecker(OC):
    """
    Hack to allow [...] as ellipsis in doctests in addition to the default ...
    """
    def check_output(self, want, got, optionflags):
        from re import sub
        if optionflags & doctest.ELLIPSIS:
            want = sub(r'\[\.\.\.\]', '...', want)
        return OC.check_output(self, want, got, optionflags)


doctest.OutputChecker = AEOutputChecker


def run_doctests(module, flags=FLAGS):
    """
    Runs doctests with our default flags
    """
    return doctest.testmod(module, optionflags=flags)
