"""Defines logical nodes."""
from typing import Any
import functools

import mason


compare_node = functools.partial(
    mason.nodify,
    result_name='result',
    shape=mason.NodeShape.Round
)


@compare_node(default_label='==')
def equals(a: Any, b: Any) -> bool:
    """a == b"""
    return a == b


@compare_node(default_label='!=')
def not_equal(a: Any, b: Any) -> bool:
    """a != b"""
    return a != b


@compare_node(default_label='<')
def less_than(a: Any, b: Any) -> bool:
    """a < b"""
    return a < b


@compare_node(default_label='<=')
def less_than_or_equal(a: Any, b: Any) -> bool:
    """a <= b"""
    return a <= b


@compare_node(default_label='>')
def greater_than(a: Any, b: Any) -> bool:
    """a > b"""
    return a > b


@compare_node(default_label='>=')
def greater_than_or_equal(a: Any, b: Any) -> bool:
    """a >= b"""
    return a >= b



@compare_node
def nonzero(a: Any) -> bool:
    """Returns whether or not the item is empty."""
    return bool(a)
