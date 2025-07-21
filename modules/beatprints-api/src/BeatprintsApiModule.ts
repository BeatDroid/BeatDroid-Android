import { NativeModule, requireNativeModule } from 'expo';

import { BeatprintsApiModuleEvents } from './BeatprintsApi.types';

declare class BeatprintsApiModule extends NativeModule<BeatprintsApiModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<BeatprintsApiModule>('BeatprintsApi');
