let _verbose = false;

export function setVerbose(v: boolean) {
  _verbose = v;
}

export function info(...args: unknown[]) {
  if (_verbose) console.log(...args);
}

export function debug(...args: unknown[]) {
  if (_verbose) console.debug(...args);
}

export function warn(...args: unknown[]) {
  console.warn(...args);
}

export function error(...args: unknown[]) {
  console.error(...args);
}

export default { setVerbose, info, debug, warn, error };
