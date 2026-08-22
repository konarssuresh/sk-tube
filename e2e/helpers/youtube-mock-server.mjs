import http from "node:http";

const CHANNEL_ID = "UCBa659QWEk1AI4Tg--mrJ2A";
const DISCOVERY_CHANNEL_ID = "UCdiscoverychannel";
const UPLOADS_PLAYLIST_ID = "UUBa659QWEk1AI4Tg--mrJ2A";
const DISCOVERY_UPLOADS_PLAYLIST_ID = "UUdiscoverychannel";
const THUMBNAIL_URL = "https://i.ytimg.com/vi/jNQXAC9IVRw/hqdefault.jpg";

const PAGE_ONE_IDS = Array.from(
  { length: 50 },
  (_, index) => `e2e-video-${index}`,
);
const PAGE_TWO_IDS = ["e2e-video-50"];
const SEARCH_PAGE_ONE_IDS = Array.from(
  { length: 50 },
  (_, index) => `e2e-search-${index}`,
);
const SEARCH_PAGE_TWO_IDS = ["e2e-search-50"];
const INELIGIBLE_SEARCH_VIDEO_ID = "e2e-search-short";

function sendJson(response, body) {
  response.writeHead(200, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
}

function channelItem(id = CHANNEL_ID, title = "Fireship", handle = "@Fireship") {
  return {
    id,
    snippet: {
      title,
      customUrl: handle.replace(/^@/, ""),
      description: `${title} description for discovery search.`,
      thumbnails: {
        high: { url: THUMBNAIL_URL },
      },
    },
    contentDetails: {
      relatedPlaylists: {
        uploads:
          id === DISCOVERY_CHANNEL_ID
            ? DISCOVERY_UPLOADS_PLAYLIST_ID
            : UPLOADS_PLAYLIST_ID,
      },
    },
    statistics: {
      subscriberCount: id === DISCOVERY_CHANNEL_ID ? "420000" : "3700000",
      videoCount: id === DISCOVERY_CHANNEL_ID ? "1200" : "630",
      viewCount: id === DISCOVERY_CHANNEL_ID ? "28000000" : "550000000",
    },
  };
}

function videoItem(id) {
  const isShort = id === INELIGIBLE_SEARCH_VIDEO_ID;

  return {
    id,
    snippet: {
      title: `Eligible ${id}`,
      publishedAt: "2026-01-01T00:00:00.000Z",
      channelId: id.startsWith("e2e-search") ? DISCOVERY_CHANNEL_ID : CHANNEL_ID,
      channelTitle:
        id.startsWith("e2e-search") ? "Frontend Masters" : "Fireship",
      liveBroadcastContent: "none",
      thumbnails: {
        high: { url: THUMBNAIL_URL },
      },
    },
    contentDetails: {
      duration: isShort ? "PT30S" : "PT12M",
    },
    status: {
      privacyStatus: "public",
      embeddable: id !== "nonembedab1",
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

function searchItems(ids, idKey) {
  return ids.map((id) => ({
    id: {
      [idKey]: id,
    },
  }));
}

export function startYouTubeMock() {
  const server = http.createServer((request, response) => {
    const url = new URL(request.url, "http://127.0.0.1");
    const endpoint = url.pathname.split("/").filter(Boolean).at(-1);

    if (endpoint === "search") {
      const type = url.searchParams.get("type");
      const pageToken = url.searchParams.get("pageToken");

      if (type === "video") {
        if (pageToken === "search-page-2") {
          sendJson(response, {
            items: searchItems(SEARCH_PAGE_TWO_IDS, "videoId"),
          });
          return;
        }

        sendJson(response, {
          items: searchItems(
            [...SEARCH_PAGE_ONE_IDS, INELIGIBLE_SEARCH_VIDEO_ID],
            "videoId",
          ),
          nextPageToken: "search-page-2",
        });
        return;
      }

      if (type === "channel") {
        sendJson(response, {
          items: searchItems([CHANNEL_ID, DISCOVERY_CHANNEL_ID], "channelId"),
        });
        return;
      }
    }

    if (endpoint === "channels") {
      const ids = (url.searchParams.get("id") ?? "")
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);
      const forHandle = url.searchParams.get("forHandle");

      if (forHandle === "FrontendMasters") {
        sendJson(response, {
          items: [
            channelItem(
              DISCOVERY_CHANNEL_ID,
              "Frontend Masters",
              "@FrontendMasters",
            ),
          ],
        });
        return;
      }

      if (ids.length > 1 || ids[0] === DISCOVERY_CHANNEL_ID) {
        sendJson(response, {
          items: ids.map((id) =>
            id === DISCOVERY_CHANNEL_ID
              ? channelItem(
                  DISCOVERY_CHANNEL_ID,
                  "Frontend Masters",
                  "@FrontendMasters",
                )
              : channelItem(),
          ),
        });
        return;
      }

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
