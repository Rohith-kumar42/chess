import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 chess-pattern pointer-events-none" />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none" />

      <div className="relative z-10 text-center max-w-2xl mx-auto px-6 animate-fade-in">
        {/* Chess Icon */}
        <div className="mb-8 inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20">
          <span className="text-4xl">♛</span>
        </div>

        <h1 className="text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Chess Academy
        </h1>
        
        <p className="text-lg text-foreground-muted mb-10 leading-relaxed">
          Your all-in-one platform for managing chess tutoring — track students, 
          schedule sessions, monitor progress, and grow your academy.
        </p>

        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-base hover:bg-primary-hover transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20"
        >
          Sign In
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>

        <p className="mt-6 text-sm text-foreground-subtle">
          Secure · Role-Based Access · Real-Time Tracking
        </p>
      </div>

      {/* Decorative floating chess pieces */}
      <div className="absolute top-1/4 left-[10%] text-6xl opacity-[0.04] select-none pointer-events-none animate-pulse">♜</div>
      <div className="absolute top-1/3 right-[15%] text-7xl opacity-[0.04] select-none pointer-events-none animate-pulse" style={{ animationDelay: '1s' }}>♞</div>
      <div className="absolute bottom-1/4 left-[20%] text-5xl opacity-[0.04] select-none pointer-events-none animate-pulse" style={{ animationDelay: '0.5s' }}>♝</div>
      <div className="absolute bottom-1/3 right-[10%] text-8xl opacity-[0.04] select-none pointer-events-none animate-pulse" style={{ animationDelay: '1.5s' }}>♚</div>
    </div>
  )
}
