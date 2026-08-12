export function applyAuthMutationError(error, setError) {
  if (error?.code === "VALIDATION" && error.details?.length) {
    for (const detail of error.details) {
      if (detail.path) {
        setError(detail.path, { message: detail.message });
      }
    }
  }

  return error?.message ?? "Something went wrong. Please try again.";
}
