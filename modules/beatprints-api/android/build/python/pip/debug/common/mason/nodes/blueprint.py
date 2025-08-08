"""Blueprint nodes."""

from typing import Any

import mason


@mason.nodify
@mason.slot
def return_(value: Any = None):
    """Raises the value as a return."""
    raise mason.exceptions.ReturnException(value)


@mason.nodify
@mason.slot
def exit_(code: int = 0):
    """Raises the exit exception."""
    raise mason.exceptions.ExitException(code)


class Input(mason.Node):
    """Defines a node to extract an input variable from a flow."""

    __shape__ = mason.NodeShape.Round

    default: mason.inport(Any, visibility=mason.PortVisibility.Editable)
    value: mason.outport(Any)

    @mason.getter('value')
    def get_value(self) -> Any:
        """Extracts the value for the given output port from the context."""
        key = self._label or self.uid
        default = self.get('default')
        context = self.get_context()
        return context.args.get(key, default) if context else default


class Output(mason.Node):
    """Defines a node to add output values to the context."""

    name: str
    value: Any

    assigned: mason.Signal

    @mason.slot
    async def assign(self):
        """Assigns the value for this node to the context."""
        name, value = self.get('key', 'value')
        context = self.get_context()
        context.results[name] = value
        await self.emit('assigned')


class TriggerEvent(mason.Node):
    """Fires a generic event from a blueprint."""

    event: str

    finished: mason.Signal

    @mason.slot
    async def run(self):
        """Emits the signal through the blueprint for this node."""
        event_name = self.get('event')
        await self.blueprint.emit(event_name)
        await self.emit('finished')


class EventNode(mason.Node):
    """Run when a generic event is fired from a blueprint."""

    __shape__ = mason.NodeShape.Round
    __abstract__ = True

    triggered: mason.Signal

    def get_event_name(self) -> str:
        """Return the event name for this node."""
        raise NotImplementedError

    async def setup(self):
        event_name = self.get_event_name()
        signal = self.blueprint.ensure_signal(event_name)
        signal.connect(self.run)

    async def run(self):
        """Triggers when the blueprints signal is emitted."""
        with self:
            await self.emit('triggered')

    async def teardown(self):
        event_name = self.get_event_name()
        signal = self.blueprint.ensure_signal(event_name)
        signal.disconnect(self.run)


class OnEvent(EventNode):
    """Run when a custom event is triggered."""

    event: mason.inport(str, visibility=mason.PortVisibility.Hidden)

    def get_event_name(self) -> str:
        """Returns the event name from the port."""
        return self.get('event')


class Start(EventNode):
    """Run when the blueprint is executed."""

    def get_event_name(self):
        """Returns 'started' as the event name."""
        return 'started'


class Setup(EventNode):
    """Run when the blueprint is about to begin."""

    def get_event_name(self):
        """Returns 'started' as the event name."""
        return 'setup_started'


class Teardown(EventNode):
    """Run when the blueprint is about to teardown."""

    def get_event_name(self):
        """Returns 'started' as the event name."""
        return 'teardown_started'
