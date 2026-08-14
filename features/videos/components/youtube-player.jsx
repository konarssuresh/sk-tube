export function YoutubePlayer({ src, title }) {
  return (
    <div className="relative aspect-video overflow-hidden rounded-none border-x-0 border-[#353542] bg-[#08080c] shadow-[var(--shadow)] sm:rounded-[15px] sm:border">
      <iframe
        src={src}
        title={title}
        className="absolute inset-0 h-full w-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}
