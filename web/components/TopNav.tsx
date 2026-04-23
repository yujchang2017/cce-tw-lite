import Link from 'next/link';

export default function TopNav() {
  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur border-b border-earth/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl">🌍</span>
          <span className="font-bold text-xl text-earth tracking-tight">
            cce<span className="text-sun">.tw</span>
          </span>
          <span className="hidden md:inline text-xs text-mute ml-1 pt-1">氣候變遷教案社群</span>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-xl mx-2 hidden sm:block">
          <div className="relative">
            <svg
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-mute"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="search"
              placeholder="搜尋教案…（例：天氣、氣候）"
              className="w-full pl-9 pr-4 py-2 rounded-full bg-sand/60 border border-earth/15 text-sm focus:outline-none focus:ring-2 focus:ring-sun focus:bg-white transition"
            />
          </div>
        </div>

        {/* Right nav */}
        <div className="flex items-center gap-3 shrink-0 ml-auto">
          <Link href="/" className="hidden md:inline text-sm text-ink hover:text-sun transition">
            瀏覽教案
          </Link>
          <Link href="/admin" className="hidden md:inline text-sm text-ink hover:text-sun transition">
            Admin
          </Link>
          <div
            className="w-9 h-9 rounded-full bg-gradient-to-br from-forest to-earth text-white flex items-center justify-center font-semibold text-sm"
            title="陳老師"
          >
            陳
          </div>
          <button className="hidden sm:inline px-3 py-1.5 text-sm rounded-full border border-earth/30 text-earth hover:bg-earth hover:text-white transition">
            登入
          </button>
        </div>
      </div>
    </header>
  );
}
