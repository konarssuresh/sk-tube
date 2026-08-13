import http from "node:http";

const CHANNEL_ID = "UCBa659QWEk1AI4Tg--mrJ2A";
const UPLOADS_PLAYLIST_ID = "UUBa659QWEk1AI4Tg--mrJ2A";
const THUMBNAIL_URL = "https://i.ytimg.com/vi/jNQXAC9IVRw/hqdefault.jpg";

const PAGE_ONE_IDS = Array.from(
  { length: 50 },
  (_, index) => `e2e-video-${index}`,
);
const PAGE_TWO_IDS = ["e2e-video-50"];

function sendJson(response, body) {
  response.writeHead(200, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
}

function channelItem() {
  return {
    id: CHANNEL_ID,
    snippet: {
      title: "Fireship",
      customUrl: "@Fireship",
      thumbnails: {
        high: { url: THUMBNAIL_URL },
      },
    },
    contentDetails: {
      relatedPlaylists: {
        uploads: UPLOADS_PLAYLIST_ID,
      },
    },
  };
}

function videoItem(id) {
  return {
    id,
    snippet: {
      title: `Eligible ${id}`,
      publishedAt: "2026-01-01T00:00:00.000Z",
      liveBroadcastContent: "none",
      thumbnails: {
        high: { url: THUMBNAIL_URL },
      },
    },
    contentDetails: {
      duration: "PT12M",
    },
    status: {
      privacyStatus: "public",
    },
  };
}

function playlistItems(videoIds, nextPageToken) {
  return {
    items: videoIds.map((videoId) => ({
      contentDetails: { videoId },
    })),
    ...(nextPageToken ? { nextPageToken } : {}),
  };
}

export function startYouTubeMock() {
  const server = http.createServer((request, response) => {
    const url = new URL(request.url, "http://127.0.0.1");
    const endpoint = url.pathname.split("/").filter(Boolean).at(-1);

    if (endpoint === "channels") {
      sendJson(response, { items: [channelItem()] });
      return;
    }

    if (endpoint === "playlistItems") {
      const pageToken = url.searchParams.get("pageToken");

      if (pageToken === "page-2") {
        sendJson(response, playlistItems(PAGE_TWO_IDS));
        return;
      }

      sendJson(response, playlistItems(PAGE_ONE_IDS, "page-2"));
      return;
    }

    if (endpoint === "videos") {
      const ids = (url.searchParams.get("id") ?? "")
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);

      sendJson(response, {
        items: ids.map((id) => videoItem(id)),
      });
      return;
    }

    response.writeHead(404);
    response.end();
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({
        server,
        baseUrl: `http://127.0.0.1:${port}/youtube/v3`,
      });
    });
  });
}
