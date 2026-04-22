interface AttendanceIndicatorProps {
  attended: boolean[]
}

export default function AttendanceIndicator({ attended }: AttendanceIndicatorProps) {
  const attendedCount = attended.filter(Boolean).length
  const missedCount = attended.length - attendedCount

  return (
    <div
      className="flex items-center gap-1"
      title={`Last ${attended.length} sessions: ${attendedCount} attended, ${missedCount} missed`}
    >
      {attended.map((present, i) => (
        <span
          key={i}
          className="inline-block w-2 h-2 rounded-full"
          style={{
            backgroundColor: present ? 'var(--color-grandmaster-gold)' : 'transparent',
            border: present ? 'none' : '1.5px solid var(--color-board-light)',
          }}
        />
      ))}
    </div>
  )
}
