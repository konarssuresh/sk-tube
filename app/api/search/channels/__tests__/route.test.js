import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AppError, AppErrorCode } from "@/lib/errors";

const mockRequireCurrentUser = vi.fn();
const mockFetchSearchChannels = vi.fn();
const mockSavedChannelFind = vi.fn();

vi.mock("@/lib/auth/require-current-user", () => ({
  requireCurrentUser: (...args) => mockRequireCurrentUser(...args),
}));

vi.mock("@/lib/db", () => ({
  connectDB: vi.fn(async () => undefined),
}));

vi.mock("@/lib/youtube-client", () => ({
  fetchSearchChannels: (...args) => mockFetchSearchChannels(...args),
}));

vi.mock("@/models/SavedChannel", () => ({
  default: {
    find: (...args) => mockSavedChannelFind(...args),
  },
}));

const channels = [
  {
    youtubeChannelId: "UCBa659QWEk1AI4Tg--mrJ2A",
    title: "Fireship",
    handle: "@Fireship",
    thumbnailUrl: "https://yt3.ggpht.com/high",
    description: "High-intensity code explanations.",
    subscriberCount: 3_700_000,
    videoCount: 630,
    viewCount: 550_000_000,
    uploadsPlaylistId: "UUBa659QWEk1AI4Tg--mrJ2A",
  },
  {
    youtubeChannelId: "UCdiscoverychannel",
    title: "Frontend Masters",
    handle: "@FrontendMasters",
    thumbnailUrl: "https://yt3.ggpht.com/discovery",
    description: "In-depth web development courses.",
    subscriberCount: 420_000,
    videoCount: 1200,
    viewCount: 28_000_000,
    uploadsPlaylistId: "UUdiscoverychannel",
  },
];

describe("GET /api/search/channels", () => {
  beforeEach(() => {
    mockRequireCurrentUser.mockReset();
    mockFetchSearchChannels.mockReset();
    mockSavedChannelFind.mockReset();
    mockRequireCurrentUser.mockResolvedValue({
      id: "507f1f77bcf86cd799439011",
    });
    mockFetchSearchChannels.mockResolvedValue({
      channels,
      nextCursor: "next-page",
    });
    mockSavedChannelFind.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue([
          { youtubeChannelId: "UCBa659QWEk1AI4Tg--mrJ2A" },
        ]),
      }),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when the user is not authenticated", async () => {
    const { GET } = await import("@/app/api/search/channels/route");

    mockRequireCurrentUser.mockRejectedValue(
      new AppError(AppErrorCode.UNAUTHORIZED, "Authentication required."),
    );

    const response = await GET(
      new Request("http://localhost:3000/api/search/channels?q=frontend"),
    );
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.code).toBe(AppErrorCode.UNAUTHORIZED);
    expect(mockFetchSearchChannels).not.toHaveBeenCalled();
  });

  it("marks channels that are already saved", async () => {
    const { GET } = await import("@/app/api/search/channels/route");

    const response = await GET(
      new Request("http://localhost:3000/api/search/channels?q=frontend"),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(mockSavedChannelFind).toHaveBeenCalledWith({
      userId: "507f1f77bcf86cd799439011",
      youtubeChannelId: {
        $in: ["UCBa659QWEk1AI4Tg--mrJ2A", "UCdiscoverychannel"],
      },
    });
    expect(payload.channels).toEqual([
      { ...channels[0], isSaved: true },
      { ...channels[1], isSaved: false },
    ]);
    expect(payload.nextCursor).toBe("next-page");
  });

  it("rejects empty queries and blank cursors", async () => {
    const { GET } = await import("@/app/api/search/channels/route");

    const emptyQueryResponse = await GET(
      new Request("http://localhost:3000/api/search/channels?q=%20%20"),
    );
    const blankCursorResponse = await GET(
      new Request(
        "http://localhost:3000/api/search/channels?q=frontend&cursor=%20%20",
      ),
    );

    expect(emptyQueryResponse.status).toBe(400);
    expect(blankCursorResponse.status).toBe(400);
    expect(mockFetchSearchChannels).not.toHaveBeenCalled();
  });
});
