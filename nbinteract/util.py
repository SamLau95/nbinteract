"""
Utility functions that aren't publicly exposed.
"""

import inspect


def get_fn_args(fn, kwargs: dict, prefix: str=None):
    """
    Given function and a dict of kwargs return a dict containing only the args
    used by the function.

    If prefix is specified, also search for args that begin with '{prefix}__'.
    Removes prefix in returned dict.

    Raises ValueError if a required arg is missing from the kwargs.

    Raises ValueError if both prefixed and unprefixed arg are given in kwargs.

    >>> from pprint import pprint as p # Use pprint to sort dict keys
    >>> kwargs = {'a': 1, 'b': 2, 'c': 3, 'x__d': 4}
    >>> def foo(a, b=10): return a + b
    >>> p(get_fn_args(foo, kwargs))
    {'a': 1, 'b': 2}

    >>> def bar(a, b, d): return a + b + d
    >>> p(get_fn_args(bar, kwargs, prefix='x'))
    {'a': 1, 'b': 2, 'd': 4}

    >>> p(get_fn_args(bar, kwargs))
    Traceback (most recent call last):
    ValueError: The following args are missing for the function bar: ['d']
    """
    all_args = get_all_args(fn)
    required_args = get_required_args(fn)
    fn_kwargs = pick_kwargs(kwargs, all_args, prefix)

    missing_args = [arg for arg in required_args if arg not in fn_kwargs]
    if missing_args:
        raise ValueError('The following args are missing for the function'
                         '{}: {}.'.format(fn.__name__, missing_args))

    return fn_kwargs


def get_all_args(fn) -> list:
    """
    Returns a list of required arguments for the function fn.

    >>> def foo(x, y, z=100): return x + y + z
    >>> get_all_args(foo)
    ['x', 'y', 'z']
    """
    sig = inspect.signature(fn)
    return list(sig.parameters)


def get_required_args(fn) -> list:
    """
    Returns a list of required arguments for the function fn.

    >>> def foo(x, y, z=100): return x + y + z
    >>> get_required_args(foo)
    ['x', 'y']
    """
    sig = inspect.signature(fn)
    return [name for name, param in sig.parameters.items()
            if param.default == inspect._empty]


def pick_kwargs(kwargs: dict, required_args: list, prefix: str=None):
    """
    Given a dict of kwargs and a list of required_args, return a dict
    containing only the args in required_args.

    If prefix is specified, also search for args that begin with '{prefix}__'.
    Removes prefix in returned dict.

    Raises ValueError if both prefixed and unprefixed arg are given in kwargs.

    >>> from pprint import pprint as p # Use pprint to sort dict keys
    >>> kwargs = {'a': 1, 'b': 2, 'c': 3, 'x__d': 4}
    >>> p(pick_kwargs(kwargs, ['a', 'd']))
    {'a': 1}
    >>> p(pick_kwargs(kwargs, ['a', 'd'], prefix='x'))
    {'a': 1, 'd': 4}

    >>> pick_kwargs({'a': 1, 'x__a': 2}, ['a'], prefix='x')
    Traceback (most recent call last):
    ValueError: Both prefixed and unprefixed args were specified for the
    following parameters: ['a']
    """
    picked = {k: v for k, v in kwargs.items() if k in required_args}

    prefixed = {}
    if prefix:
        prefix = prefix + '__'
        prefixed = {
            _remove_prefix(k, prefix): v
            for k, v in kwargs.items()
            if k.startswith(prefix)
            and _remove_prefix(k, prefix) in required_args
        }

    conflicting_args = [k for k in picked if k in prefixed]
    if conflicting_args:
        raise ValueError('Both prefixed and unprefixed args were specified '
                         'for the following parameters: {}'
                         .format(conflicting_args))

    return {**picked, **prefixed}


def _remove_prefix(string: str, prefix: str) -> str:
    return string.split(prefix, 1)[1]
