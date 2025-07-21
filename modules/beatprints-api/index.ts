// Reexport the native module. On web, it will be resolved to BeatprintsApiModule.web.ts
// and on native platforms to BeatprintsApiModule.ts
export { default } from './src/BeatprintsApiModule';
export { default as BeatprintsApiView } from './src/BeatprintsApiView';
export * from  './src/BeatprintsApi.types';
