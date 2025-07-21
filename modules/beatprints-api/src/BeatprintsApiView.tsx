import { requireNativeView } from 'expo';
import * as React from 'react';

import { BeatprintsApiViewProps } from './BeatprintsApi.types';

const NativeView: React.ComponentType<BeatprintsApiViewProps> =
  requireNativeView('BeatprintsApi');

export default function BeatprintsApiView(props: BeatprintsApiViewProps) {
  return <NativeView {...props} />;
}
