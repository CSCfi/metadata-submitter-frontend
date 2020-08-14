//@flow
// Add type definitions for module-type and its hot-method
declare var module: {
  hot: {
    accept(path: string, callback: () => void): void,
  },
}
