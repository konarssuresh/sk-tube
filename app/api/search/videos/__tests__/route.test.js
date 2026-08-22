import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AppError, AppErrorCode } from "@/lib/errors";

const mockRequireCurrentUser = vi.fn();
const mockFetchSearchEligibleVideos = vi.fn();

vi.mock("@/lib/auth/require-current-user", () => ({
  requireCurrentUser: (...args) => mockRequireCurrentUser(...args),
}));

vi.mock("@/lib/youtube-client", () => ({
  fetchSearchEligibleVideos: (...args) => mockFetchSearchEligibleVideos(...args),
}));

const videos = [
  {
    videoId: "video-1",
    title: "Eligible Video",
    thumbnailUrl: "https://i.ytimg.com/vi/video-1/hqdefault.jpg",
    duration: "PT2M",
    publishedAt: "2026-01-01T00:00:00.000Z",
    watchUrl: "https://www.youtube.com/watch?v=video-1",
    channelTitle: "Fireship",
  },
];

describe("GET /api/search/videos", () => {
  beforeEach(() => {
    mockRequireCurrentUser.mockReset();
    mockFetchSearchEligibleVideos.mockReset();
    mockRequireCurrentUser.mockResolvedValue({
      id: "507f1f77bcf86cd799439011",
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when the user is not authenticated", async () => {
    const { GET } = await import("@/app/api/search/videos/route");

    mockRequireCurrentUser.mockRejectedValue(
      new AppError(AppErrorCode.UNAUTHORIZED, "Authentication required."),
    );

    const response = await GET(
      new Request("http://localhost:3000/api/search/videos?q=react"),
    );
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.code).toBe(AppErrorCode.UNAUTHORIZED);
    expect(mockFetchSearchEligibleVideos).not.toHaveBeenCalled();
  });

  it("returns mapped videos and nextCursor", async () => {
    const { GET } = await import("@/app/api/search/videos/route");

    mockFetchSearchEligibleVideos.mockResolvedValue({
      videos,
      nextCursor: "next-page",
    });

    const response = await GET(
      new Request("http://localhost:3000/api/search/videos?q=react"),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(mockFetchSearchEligibleVideos).toHaveBeenCalledWith({
      query: "react",
      pageToken: undefined,
    });
    expect(payload).toEqual({
      videos,
      nextCursor: "next-page",
    });
  });

  it("passes the cursor query param through to the YouTube client", async () => {
    const { GET } = await import("@/app/api/search/videos/route");

    mockFetchSearchEligibleVideos.mockResolvedValue({
      videos,
      nextCursor: null,
    });

    await GET(
      new Request(
        "http://localhost:3000/api/search/videos?q=react&cursor=next-page",
      ),
    );

    expect(mockFetchSearchEligibleVideos).toHaveBeenCalledWith({
      query: "react",
      pageToken: "next-page",
    });
  });

  it("rejects empty queries and blank cursors", async () => {
    const { GET } = await import("@/app/api/search/videos/route");

    const emptyQueryResponse = await GET(
      new Request("http://localhost:3000/api/search/videos?q=%20%20"),
    );
    const blankCursorResponse = await GET(
      new Request(
        "http://localhost:3000/api/search/videos?q=react&cursor=%20%20",
      ),
    );

    expect(emptyQueryResponse.status).toBe(400);
    expect(blankCursorResponse.status).toBe(400);
    expect(mockFetchSearchEligibleVideos).not.toHaveBeenCalled();
  });
});
