"""Command line interface for mason."""

import click
import mason
from mason.storages import filesystem

try:
    from mason.http import sanic as sanic_server
except ImportError:
    sanic_server = None

try:
    from mason.http import aiohttp as aiohttp_server
except ImportError:
    aiohttp_server = None

default_server = sanic_server or aiohttp_server


@click.group()
def cli():
    """Mason command line interface."""


@cli.command()
def version():
    """Print out the current version."""
    print(mason.__version__)


@cli.command()
@click.option('--host', default='0.0.0.0')
@click.option('--port', default=8000)
@click.option('--storage_path', default='')
@click.option('--server', default='')
def serve(host: str, port: int, storage_path: str, server: str):
    """Runs the server."""
    if server == 'aiohttp':
        runner = aiohttp_server
    elif server == 'sanic':
        runner = sanic_server
    else:
        runner = default_server

    if runner is None:
        raise RuntimeError('You need to install sanic or aiohttp as a dependency for the server.')

    if storage_path:
        storage = mason.Storage(filesystem.FileSystem(rootpath=storage_path))
    else:
        storage = None

    return runner.serve(host=host, port=int(port), storage=storage)
