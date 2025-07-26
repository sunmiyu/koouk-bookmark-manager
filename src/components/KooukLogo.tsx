export default function KooukLogo() {
  return (
    <div className="flex flex-col items-center">
      {/* Combined logo as a visual unit */}
      <div className="relative">
        {/* Main KOOUK text */}
        <div className="text-2xl sm:text-3xl font-bold text-white leading-none tracking-[0.15em] text-center">
          KOOUK
        </div>
        {/* Subtitle with equal width */}
        <div className="text-[10px] sm:text-xs text-gray-400 font-light tracking-[0.25em] leading-none mt-1 text-center">
          your precious!
        </div>
      </div>
    </div>
  )
}