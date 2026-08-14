import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/shared/empty-state", () => ({
  EmptyState: ({ title, description, action }) =>
    createElement("div", null, title, description, action),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children }) => children,
}));

vi.mock("lucide-react", () => ({
  ExternalLink: () => createElement("span"),
}));

import { EmbeddedPlaybackFallback } from "@/features/videos/components/embedded-playback-fallback";

describe("EmbeddedPlaybackFallback", () => {
  it("renders fallback copy and an Open on YouTube link without an iframe", () => {
    const markup = renderToStaticMarkup(
      createElement(EmbeddedPlaybackFallback, { videoId: "dQw4w9WgXcQ" }),
    );

    expect(markup).toContain("This video can&#x27;t play here.");
    expect(markup).toContain(
      "YouTube does not allow this video to be embedded in SKTube.",
    );
    expect(markup).toContain("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    expect(markup).toContain("Open on YouTube");
    expect(markup).not.toContain("<iframe");
  });
});
