/**
 * In case a previous invocation is still running, return the result
 * of that invocation when it is done instead of executing the
 * function again.
 */
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
