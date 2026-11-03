export default function ProgressBar({ valor, max, cor, label }) {
  const percentual = max > 0 ? Math.min((valor / max) * 100, 100) : 0
  return (
    <div
      className="w-full h-2 rounded-full bg-gray-800 overflow-hidden"
      role="progressbar"
      aria-valuenow={Math.round(percentual)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${percentual}%`, backgroundColor: cor || '#00E08F' }}
      />
    </div>
  )
}
