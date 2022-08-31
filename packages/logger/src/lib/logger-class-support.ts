const classLoggerMarker = Symbol('ClassLoggerMarker');

export function LoggerMark(name: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (target: any): any => {
    Object.defineProperty(target.prototype, classLoggerMarker, {
      configurable: false,
      enumerable: false,
      writable: false,
      value: name,
    });

    return target;
  };
}

export function nameOf(source: unknown): string {
  if (
    typeof source === 'object' &&
    source != null &&
    classLoggerMarker in source
  ) {
    // @ts-expect-error we already checked that is this property exists
    return source[classLoggerMarker];
  } else {
    return 'unknown';
  }
}
