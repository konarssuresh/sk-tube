import {
  getSessionEnv,
  resetSessionEnvCache,
} from "@/lib/env/session-env";
import {
  getServerEnv,
  resetServerEnvCache,
} from "@/lib/env/server-env";

export { getSessionEnv, resetSessionEnvCache } from "@/lib/env/session-env";
export { getServerEnv, resetServerEnvCache } from "@/lib/env/server-env";

export function getEnv() {
  return getServerEnv();
}

export function resetEnvCache() {
  resetSessionEnvCache();
  resetServerEnvCache();
}
