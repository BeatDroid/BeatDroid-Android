"""Main server."""

import asyncio
import dataclasses
import io
import json
import logging
import sys
import traceback

import mason
import mason.io
from mason.storages import filesystem

import sanic
import sanic_cors

_ROOT_LOG = logging.getLogger()


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
        if 'sanic' in record.name:
            return

        if getattr(self._queue, 'subscribers', None):
            msg = self.format(record)
            try:
                self._queue.put_nowait(msg + '\n')
            except asyncio.QueueFull:
                pass


app = sanic.Sanic('mason')
sanic_cors.CORS(app)


@app.get('/library')
async def get_libary(
        request: sanic.request.Request) -> sanic.response.HTTPResponse:
    """Returns the library schema."""
    del request  # Unused.
    return sanic.response.json(mason.io.dump_library())


@app.get('/storage')
async def list_storage(
        request: sanic.request.Request) -> sanic.response.HTTPResponse:
    """Gets all the storage items."""
    del request  # Unused.
    storage = app.config.storage
    items = await storage.list_items()
    return sanic.response.json([dataclasses.asdict(item) for item in items])


@app.get('/storage/<fullpath:path>')
async def get_blueprint(
        request: sanic.request.Request,
        fullpath: str) -> sanic.response.HTTPResponse:
    """Load a blueprint and return it."""
    extra_names = request.args.get('extras').split(',')
    data = await app.config.storage.load_item(fullpath, extras=extra_names)
    return sanic.response.json({'blueprint': data.pop(''), 'extras': data})


@app.post('/storage/<fullpath:path>')
async def save_blueprint(
        request: sanic.request.Request,
        fullpath: str) -> sanic.response.HTTPResponse:
    """Update an existing blueprint."""
    data = request.json or {}
    item = {'': data['blueprint']}
    item.update(data.get('extras', {}))
    await app.config.storage.save_item(fullpath, item)
    return sanic.response.json({'status': 'ok'})


@app.post('/blueprints/execute')
@app.post('/blueprints/execute/<fullpath:path>')
async def execute_blueprint(
        request: sanic.request.Request,
        fullpath: str = '') -> sanic.response.HTTPResponse:
    """Executes the blueprint."""
    data = request.json or {}

    # Configure logging.
    curr_level = _ROOT_LOG.level
    request_level = getattr(logging, data.get('level', 'INFO'))
    _ROOT_LOG.setLevel(request_level)

    storage = app.config.storage
    middleware = app.config.middleware
    inputs = data.get('inputs', {})
    try:
        if not fullpath:
            bp_data = data['blueprint']
            bp = mason.io.parse_blueprint(bp_data, middleware=middleware)
        else:
            bp, _ = await storage.load_blueprint(
                fullpath, middleware=middleware)
        result = await bp(**inputs)
        return sanic.response.json({'status': 'ok', 'result': result})
    except Exception:  # pylint: disable=broad-except
        traceback.print_exc()
        return sanic.response.json({'status': 'error'})
    finally:
        _ROOT_LOG.setLevel(curr_level)


@app.websocket('/streams/profile')
async def stream_profile(
        request: sanic.request.Request,
        sock: sanic.websocket.WebSocketProtocol):
    """Steam profiling information."""
    del request  # Unused.
    profile_queue = app.config.profile_queue
    profile_queue.subscribers += 1
    throttle = 0.1
    try:
        while True:
            buffer = []
            while not profile_queue.empty():
                buffer.append(await profile_queue.get())

            if buffer:
                await sock.send(json.dumps(buffer))
            await asyncio.sleep(throttle)
    finally:
        profile_queue.subscribers -= 1


@app.websocket('/streams/log')
async def stream_logs(
        request: sanic.request.Request,
        sock: sanic.websocket.WebSocketProtocol):
    """Connect to streaming logs during runs."""
    del request  # Unused.
    stream_queue = app.config.stream_queue
    stream_queue.subscribers += 1
    throttle = 0.01
    try:
        while True:
            buffer = []
            while not stream_queue.empty():
                buffer.append(await stream_queue.get())
            if buffer:
                await sock.send(''.join(buffer))
            await asyncio.sleep(throttle)
    finally:
        stream_queue.subscribers -= 1


@app.listener('after_server_start')
async def setup_logging(*args):
    """Sets up the logging listener."""
    del args  # Unused.
    stream_queue = asyncio.Queue()
    stream_queue.subscribers = 0

    handler = QueueHandler(stream_queue)

    _ROOT_LOG.setLevel(logging.INFO)
    _ROOT_LOG.addHandler(handler)

    sys.stdout = StreamWrapper(sys.stdout, stream_queue)
    sys.stderr = StreamWrapper(sys.stderr, stream_queue)
    app.config.stream_queue = stream_queue

    logging.getLogger('sanic.access').handlers[0].setStream(sys.stdout)


@app.listener('after_server_start')
async def setup_middleware(*args):
    """Set up blueprint middleware."""
    del args  # Unused.
    profile_queue = asyncio.Queue()
    profile_queue.subscribers = 0
    middleware = mason.Middleware([profile_handler(profile_queue)])
    app.config.middleware = middleware
    app.config.profile_queue = profile_queue


def serve(host: str = '0.0.0.0', port: int = 8000, storage: mason.Storage = None):
    """Runs the server."""
    app.config.storage = storage
    return app.run(host=host, port=port)
