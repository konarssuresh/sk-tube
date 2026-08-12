async function postJson(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(
      payload?.message ?? "Something went wrong. Please try again.",
    );
    error.code = payload?.code ?? "INTERNAL";
    error.details = payload?.details;
    throw error;
  }

  return payload;
}

export function loginUser(data) {
  return postJson("/api/auth/login", data);
}

export function registerUser(data) {
  return postJson("/api/auth/register", data);
}

export function logoutUser() {
  return postJson("/api/auth/logout");
}
