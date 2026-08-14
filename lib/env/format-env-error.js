export function formatEnvError(error) {
  const issues = error.issues.map((issue) => {
    const key = issue.path[0] ?? "environment";
    return `${String(key)}: ${issue.message}`;
  });

  return `Invalid environment configuration:\n- ${issues.join("\n- ")}`;
}
