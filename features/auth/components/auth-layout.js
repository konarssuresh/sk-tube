export function AuthLayout({ children, visual }) {
  return (
    <div className="grid min-h-[100vh] lg:grid-cols-[minmax(340px,0.94fr)_minmax(420px,1.06fr)]">
      <div className="flex h-full items-center justify-center bg-[#101016] px-6 py-12 lg:items-center lg:py-12">
        <div className="w-full max-w-[390px]">{children}</div>
      </div>
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-[#2b0b19] via-[#17101b] to-[#101018] lg:flex lg:items-center lg:p-[clamp(38px,8vw,100px)]">
        <div
          className="pointer-events-none absolute -bottom-[18vw] -right-[12vw] size-[46vw] rounded-full border border-white/10"
          aria-hidden="true"
        />
        <div className="relative z-10 max-w-[500px]">{visual}</div>
      </aside>
    </div>
  );
}
