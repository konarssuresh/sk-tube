export function YoutubePlayer({ src, title }) {
  return (
    <div className="relative aspect-video overflow-hidden rounded-[15px] border border-[#353542] bg-[#08080c] shadow-[var(--shadow)]">
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
