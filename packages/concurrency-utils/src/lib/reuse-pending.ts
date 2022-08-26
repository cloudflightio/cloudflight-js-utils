export function reusePending<Args extends unknown[], Return>(
  fn: (...params: Args) => Promise<Return>
): (...args: Args) => Promise<Return> {
  let pending: Promise<Return> | undefined = undefined;

  return async (...args: Args) => {
    if (pending != null) {
      return pending;
    }

    pending = fn(...args);

    try {
      const result = await pending;
      return result;
    } finally {
      pending = undefined;
    }
  };
}
