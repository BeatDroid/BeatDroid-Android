import { registerWebModule, NativeModule } from 'expo';

import { ChangeEventPayload } from './BeatprintsApi.types';

type BeatprintsApiModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
}

class BeatprintsApiModule extends NativeModule<BeatprintsApiModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
};

export default registerWebModule(BeatprintsApiModule, 'BeatprintsApiModule');
