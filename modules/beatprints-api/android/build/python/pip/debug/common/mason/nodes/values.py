"""Define value conversion nodes."""

import mason

@mason.nodify
def bytes_to_int(x: bytes, byteorder: str = 'little', signed: bool = False) -> int:
    """Converts bytes to int"""
    return int.from_bytes(x, byteorder, signed)


@mason.nodify
def int_to_bytes(x: int, length: int, byteorder: str = 'little', signed: bool = False) -> bytes:
    """Converts int to bytes."""
    return int.to_bytes(length, byteorder, signed)


@mason.nodify
def bytes_to_hex(x: bytes) -> str:
    """Converts bytes to hex string."""
    return x.hex()


@mason.nodify
def hex_to_bytes(x: str) -> bytes:
    """Converts hex to byte string."""
    return bytes.fromhex(x)
