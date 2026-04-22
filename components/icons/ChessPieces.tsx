import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

export const KingIcon = ({ size = 24, className = "" }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M5 20h14" />
    <path d="M7 17h10" />
    <path d="M8 17v-4c0-2.5 2-4 4-4s4 1.5 4 4v4" />
    <path d="M12 9V5" />
    <path d="M10 7h4" />
  </svg>
);

export const QueenIcon = ({ size = 24, className = "" }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M5 20h14" />
    <path d="M7 17h10" />
    <path d="M12 17V8" />
    <path d="M8 17l1-9 3-3 3 3 1 9" />
    <circle cx="12" cy="4" r="1" />
  </svg>
);

export const RookIcon = ({ size = 24, className = "" }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M5 20h14" />
    <path d="M7 17h10" />
    <path d="M7 17v-9h2v2h2v-2h2v2h2v-2h2v9" />
  </svg>
);

export const KnightIcon = ({ size = 24, className = "" }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M5 20h14" />
    <path d="M8 17l1-10 4-3 4 3-1 4h-4l-1 6" />
  </svg>
);

export const BishopIcon = ({ size = 24, className = "" }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M5 20h14" />
    <path d="M7 17h10" />
    <path d="M12 17V7" />
    <path d="M9 17a3 3 0 0 1 6 0" />
    <path d="M12 7a2 2 0 0 1 0-4 2 2 0 0 1 0 4z" />
    <path d="M10.5 4.5l3 3" />
  </svg>
);

export const PieceIcons = {
  King: KingIcon,
  Queen: QueenIcon,
  Rook: RookIcon,
  Knight: KnightIcon,
  Bishop: BishopIcon,
};
