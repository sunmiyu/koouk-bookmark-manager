export default function KooukLogo() {
  return (
    <div className="flex flex-col items-start">
      {/* Main KOOUK text - left aligned */}
      <div className="text-2xl sm:text-3xl font-bold text-white leading-none tracking-[0.15em]">
        KOOUK
      </div>
      {/* Subtitle - left aligned */}
      <div className="text-[10px] sm:text-xs text-gray-400 font-light tracking-[0.1em] leading-none mt-1">
        Personal Life Hub
      </div>
    </div>
  )
}