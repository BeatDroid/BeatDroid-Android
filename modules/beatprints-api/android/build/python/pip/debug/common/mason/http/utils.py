"""Utility methods for HTTP calls."""

import dataclasses
import enum
import json

from typing import Any


def json_serializer(obj: Any) -> Any:
    """Implements a custom JSON serializer for custom objects."""
    if hasattr(obj, '__json__'):
        return obj.__json__()

    if isinstance(obj, enum.Enum):
        serializer = getattr(obj, '__json_format__', 'value')
        if serializer == 'name':
            return obj.name
        if serializer == 'object':
            return {
                'type': type(obj).__name__,
                'name': obj.name,
                'value': obj.value
            }
        return obj.value

    if isinstance(obj, set):
        return list(obj)

    if hasattr(obj, '__dataclass_fields__'):
        return dataclasses.asdict(obj)

    raise TypeError(f'Cannot serialize: {obj}')


def json_dumps(*args, **kwargs):
    """Wraps the standard json.dumps function to use the json_serializer."""
    kwargs.setdefault('default', json_serializer)
    return json.dumps(*args, **kwargs)
