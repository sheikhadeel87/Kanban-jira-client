import toast from 'react-hot-toast';

/**
 * Wraps a promise: on resolve shows success toast and calls onSuccess; on reject shows error toast.
 * @param {Promise} promise
 * @param {{ success: string, error?: string, onSuccess?: () => void }} options
 */
export function withToast(promise, { success, error = 'Operation failed', onSuccess }) {
  return promise
    .then((res) => {
      toast.success(success);
      onSuccess?.();
      return res;
    })
    .catch((err) => {
      toast.error(err.response?.data?.msg || error);
      throw err;
    });
}
