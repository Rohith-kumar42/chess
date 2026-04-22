'use client'

import { KingIcon, QueenIcon, RookIcon, KnightIcon, BishopIcon } from '@/components/icons/ChessPieces'

// King's Indian Defence after ~6 moves — a few key pieces placed for visual interest
const pieces: { row: number; col: number; Piece: typeof KingIcon; delay: number; animate?: boolean }[] = [
  { row: 0, col: 4, Piece: KingIcon, delay: 0.3 },
  { row: 0, col: 3, Piece: QueenIcon, delay: 0.5, animate: true },
  { row: 0, col: 0, Piece: RookIcon, delay: 0.2 },
  { row: 0, col: 6, Piece: KnightIcon, delay: 0.6, animate: true },
  { row: 2, col: 3, Piece: BishopIcon, delay: 0.4 },
  { row: 7, col: 4, Piece: KingIcon, delay: 0.35 },
  { row: 7, col: 6, Piece: KnightIcon, delay: 0.55, animate: true },
  { row: 5, col: 5, Piece: BishopIcon, delay: 0.45 },
]

export default function ChessBoardVisual() {
  const squares = Array.from({ length: 64 }, (_, i) => {
    const row = Math.floor(i / 8)
    const col = i % 8
    const isDark = (row + col) % 2 === 1
    return { row, col, isDark }
  })

  return (
    <div
      className="relative w-full aspect-square max-w-[420px] mx-auto"
      style={{
        transform: 'rotate(-8deg) scale(1.05)',
      }}
    >
      {/* Board shadow */}
      <div
        className="absolute inset-0 rounded-lg"
        style={{
          boxShadow: '0 40px 120px oklch(0 0 0 / 0.6)',
        }}
      />

      {/* 8x8 grid */}
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full rounded-lg overflow-hidden border border-board-light/30">
        {squares.map(({ row, col, isDark }) => {
          const piece = pieces.find(p => p.row === row && p.col === col)
          return (
            <div
              key={`${row}-${col}`}
              className="relative flex items-center justify-center"
              style={{
                backgroundColor: isDark
                  ? 'var(--color-board-mid)'
                  : 'var(--color-board-dark)',
              }}
            >
              {piece && (
                <div
                  className="chess-piece-enter"
                  style={{
                    animationDelay: `${piece.delay}s`,
                    ...(piece.animate ? { animation: `chessPieceEnter 0.6s ease-out ${piece.delay}s forwards, chessPiecePulse 4s ease-in-out ${piece.delay + 0.6}s infinite` } : { animation: `chessPieceEnter 0.6s ease-out ${piece.delay}s forwards` }),
                  }}
                >
                  <piece.Piece
                    size={28}
                    className="text-grandmaster-gold"
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Gradient overlays to fade edges */}
      <div
        className="absolute inset-0 pointer-events-none rounded-lg"
        style={{
          background: 'linear-gradient(to right, var(--color-obsidian) 0%, transparent 15%, transparent 85%, var(--color-obsidian) 100%)',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none rounded-lg"
        style={{
          background: 'linear-gradient(to bottom, var(--color-obsidian) 0%, transparent 10%, transparent 90%, var(--color-obsidian) 100%)',
        }}
      />

      <style jsx>{`
        .chess-piece-enter {
          opacity: 0;
        }
        @keyframes chessPieceEnter {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes chessPiecePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.92; }
        }
      `}</style>
    </div>
  )
}
