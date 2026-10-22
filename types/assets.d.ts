// ─── Static asset modules ──────────────────────────────────────
//
// Metro turns an imported image into a numeric handle, so
// `import map from './map.png'` has to be typed. React Native ships
// the type for the platform's own assets but not for the ones an app
// adds itself, so it is declared here.
//
// The file is a global SCRIPT (no top-level import or export), which
// is what makes `declare module` an ambient declaration rather than
// an augmentation of a module that does not exist.
//
// The inline `import(...)` type keeps it that way: a top-level
// `import` statement would turn this file into a module and the
// declaration would stop working.

declare module '*.png' {
  const content: import('react-native').ImageSourcePropType;
  export default content;
}

declare module '*.jpg' {
  const content: import('react-native').ImageSourcePropType;
  export default content;
}

declare module '*.jpeg' {
  const content: import('react-native').ImageSourcePropType;
  export default content;
}
