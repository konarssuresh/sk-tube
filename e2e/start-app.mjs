import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { startYouTubeMock } from "./helpers/youtube-mock-server.mjs";

const nextBin = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../node_modules/.bin/next",
);

const youtubeMock = await startYouTubeMock();

function run(command, args, extraEnv = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      env: {
        ...process.env,
        ...extraEnv,
      },
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(" ")} exited with ${code}`));
    });
  });
}

await run(nextBin, ["build"]);

const server = spawn(nextBin, ["start", "--port", "3100"], {
  stdio: "inherit",
  env: {
    ...process.env,
    YOUTUBE_API_BASE: youtubeMock.baseUrl,
    NEXT_PUBLIC_APP_URL: "http://127.0.0.1:3100",
  },
});

function shutdown() {
  server.kill("SIGTERM");
  youtubeMock.server.close();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
process.on("exit", shutdown);

server.on("exit", () => {
  youtubeMock.server.close();
});
