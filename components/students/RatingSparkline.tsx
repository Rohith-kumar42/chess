interface RatingSparklineProps {
  data: number[]
  width?: number
  height?: number
}

export default function RatingSparkline({ data, width = 64, height = 24 }: RatingSparklineProps) {
  if (!data || data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width
      const y = height - ((v - min) / range) * (height - 4) - 2
      return `${x},${y}`
    })
    .join(' ')

  const trend = data[data.length - 1] - data[0]
  const strokeColor =
    trend > 0
      ? 'var(--color-grandmaster-gold)'
      : trend < 0
        ? 'var(--color-rook-copper)'
        : 'var(--color-dust)'

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      className="inline-block"
    >
      <polyline
        points={points}
        stroke={strokeColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}
