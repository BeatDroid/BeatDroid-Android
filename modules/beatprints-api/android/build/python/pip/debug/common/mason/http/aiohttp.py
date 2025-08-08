"""Main server."""

import asyncio
import io
import json
import logging
import sys
import traceback

from aiohttp import web
import aiohttp_cors

import mason
import mason.io

from mason.http import utils


_ROOT_LOG = logging.getLogger()


def json_response(*args, **kwargs) -> web.Response:
    """Wraps the aiohttp.web.json_response to use custom json.dumps function."""
    kwargs.setdefault('dumps', utils.json_dumps)
    return web.json_response(*args, **kwargs)


def profile_handler(queue: asyncio.Queue):
    """Creates a profiler middleware handler."""
    def _middleware(event: mason.Event, next_: mason.Dispatcher):
        if queue.subscribers:
            try:
                queue.put_nowait(event.asdict())
            except asyncio.QueueFull:
                pass
        next_()
    return _middleware


class StreamWrapper:
    """Wraps the IO stream."""

    def __init__(self, stream: io.TextIOWrapper, queue: asyncio.Queue):
        self._stream = stream
        self._queue = queue

    def __getattr__(self, attr: str) -> any:
        """Passes along attributes to the stream instance."""
        return getattr(self._stream, attr)

    def write(self, text: str):
        """Overrides the stream write method."""
        self._stream.write(text)
        if getattr(self._queue, 'subscribers', None):
            try:
                self._queue.put_nowait(text)
            except asyncio.QueueFull:
                pass


class QueueHandler(logging.Handler):
    """Creates a logging handler to push async messages."""

    def __init__(self, queue: asyncio.Queue):
        super().__init__()

        self._queue = queue
        self.setFormatter(logging.Formatter(
            '%(asctime)s - (%(name)s)[%(levelname)s]: %(message)s '))

    def emit(self, record: logging.LogRecord):
        if getattr(self._queue, 'subscribers', None):
            msg = self.format(record)
            try:
                self._queue.put_nowait(msg + '\n')
            except asyncio.QueueFull:
                pass


async def get_library(request: web.Request) -> web.Response:
    """Returns the library schema."""
    del request  # Unused.
    return json_response(mason.io.dump_library())


async def list_storage(request: web.Request) -> web.Response:
    """Gets all the storage items."""
    storage = request.config_dict['storage']
    items = await storage.list_items()
    return json_response(items)


async def get_blueprint(request: web.Request) -> web.Response:
    """Load a blueprint and return it."""
    fullpath = request.match_info.get('fullpath')
    extra_names = request.args.get('extras').split(',')
    data = await request.config_dict['storage'].load_item(fullpath, extras=extra_names)
    return json_response({'blueprint': data.pop(''), 'extras': data})


async def save_blueprint(request: web.Request) -> web.Response:
    """Update an existing blueprint."""
    fullpath = request.match_info.get('fullpath')
    data = await request.json() or {}
    item = {'': data['blueprint']}
    item.update(data.get('extras', {}))
    await request.config_dict['storage'].save_item(fullpath, item)
    return json_response({'status': 'ok'})


async def execute_blueprint(request: web.Request) -> web.Response:
    """Executes the blueprint."""
    fullpath = request.match_info.get('fullpath')
    data = await request.json() or {}

    # Configure logging.
    curr_level = _ROOT_LOG.level
    request_level = getattr(logging, data.get('level', 'INFO'))
    _ROOT_LOG.setLevel(request_level)

    storage = request.config_dict['storage']
    middleware = request.config_dict['middleware']
    inputs = data.get('inputs', {})
    try:
        if not fullpath:
            bp_data = data['blueprint']
            bp = mason.io.parse_blueprint(bp_data, middleware=middleware)
        else:
            bp, _ = await storage.load_blueprint(
                fullpath, middleware=middleware)
        result = await bp(**inputs)
        return json_response({'status': 'ok', 'result': result})
    except Exception:  # pylint: disable=broad-except
        traceback.print_exc()
        return json_response({'status': 'error'})
    finally:
        _ROOT_LOG.setLevel(curr_level)


async def stream_profile(request: web.Request) -> web.WebSocketResponse:
    """Steam profiling information."""
    sock = web.WebSocketResponse()
    try:
        await sock.prepare(request)
    except ConnectionResetError:
        return

    profile_queue = request.config_dict['profile_queue']
    profile_queue.subscribers += 1
    throttle = 0.1
    try:
        while True:
            buffer = []
            while not profile_queue.empty():
                buffer.append(await profile_queue.get())

            if buffer:
                await sock.send_str(json.dumps(buffer))
            await asyncio.sleep(throttle)
    finally:
        profile_queue.subscribers -= 1
    return sock


async def stream_logs(request: web.Request) -> web.WebSocketResponse:
    """Connect to streaming logs during runs."""
    sock = web.WebSocketResponse()
    try:
        await sock.prepare(request)
    except ConnectionResetError:
        return

    stream_queue = request.config_dict['stream_queue']
    stream_queue.subscribers += 1
    throttle = 0.01
    try:
        while True:
            buffer = []
            while not stream_queue.empty():
                buffer.append(await stream_queue.get())
            if buffer:
                await sock.send_str(''.join(buffer))
            await asyncio.sleep(throttle)
    finally:
        stream_queue.subscribers -= 1
    return sock


async def setup_logging(app: web.Application):
    """Sets up the logging listener."""
    stream_queue = asyncio.Queue()
    stream_queue.subscribers = 0

    handler = QueueHandler(stream_queue)

    _ROOT_LOG.setLevel(logging.INFO)
    _ROOT_LOG.addHandler(handler)

    sys.stdout = StreamWrapper(sys.stdout, stream_queue)
    sys.stderr = StreamWrapper(sys.stderr, stream_queue)
    app['stream_queue'] = stream_queue


async def setup_middleware(app: web.Application):
    """Set up blueprint middleware."""
    profile_queue = asyncio.Queue()
    profile_queue.subscribers = 0
    middleware = mason.Middleware([profile_handler(profile_queue)])
    app['middleware'] = middleware
    app['profile_queue'] = profile_queue


def create_app(storage: mason.Storage = None) -> web.Application:
    """Creates the aiohttp web application."""
    app = web.Application()
    app['storage'] = storage

    app.on_startup.append(setup_logging)
    app.on_startup.append(setup_middleware)
    app.router.add_route('GET', '/streams/log', stream_logs)
    app.router.add_route('GET', '/streams/profile', stream_profile)
    app.router.add_route('GET', '/library', get_library)
    app.router.add_route('GET', '/storage', list_storage)
    app.router.add_route('GET', '/storage/{fullpath:.*}', get_blueprint)
    app.router.add_route('POST', '/storage/{fullpath:.*}', save_blueprint)
    app.router.add_route('POST', '/blueprints/execute', execute_blueprint)
    app.router.add_route('POST', '/blueprints/execute/{fullpath:.*}', execute_blueprint)
    return app


def serve(host: str = '0.0.0.0', port: int = 8000, storage: mason.Storage = None):
    """Runs the server."""
    app = create_app(storage)

    cors = aiohttp_cors.setup(app, defaults={
        '*': aiohttp_cors.ResourceOptions(
            allow_credentials=True,
            expose_headers='*',
            allow_headers='*',
        )
    })

    for route in list(app.router.routes()):
        cors.add(route)

    return web.run_app(app, host=host, port=port)
