import * as React from 'react';

import { BeatprintsApiViewProps } from './BeatprintsApi.types';

export default function BeatprintsApiView(props: BeatprintsApiViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
