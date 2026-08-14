const YOUTUBE_IFRAME_API_SRC = "https://www.youtube.com/iframe_api";

let loadPromise = null;

export function loadYoutubeIframeApi() {
  if (typeof window === "undefined") {
    return Promise.reject(
      new Error("YouTube IFrame API requires a browser environment"),
    );
  }

  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise((resolve, reject) => {
    const previousReady = window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();

      if (window.YT?.Player) {
        resolve(window.YT);
        return;
      }

      reject(new Error("YouTube IFrame API loaded without YT.Player"));
    };

    const existingScript = document.querySelector(
      `script[src="${YOUTUBE_IFRAME_API_SRC}"]`,
    );

    if (existingScript) {
      return;
    }

    const script = document.createElement("script");
    script.src = YOUTUBE_IFRAME_API_SRC;
    script.async = true;
    script.onerror = () => {
      loadPromise = null;
      reject(new Error("Failed to load YouTube IFrame API"));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}

export function resetYoutubeIframeApiLoaderForTests() {
  loadPromise = null;
}
