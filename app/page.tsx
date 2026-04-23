'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { KnightIcon } from '@/components/icons/ChessPieces'
import ChessBoardVisual from '@/components/shared/ChessBoardVisual'
import ThemeToggle from '@/components/shared/ThemeToggle'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
}

export default function HomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Hero Grid */}
      <div className="hero-grid max-w-7xl mx-auto px-6 lg:px-12">
        {/* Left Column — Copy */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col justify-center"
        >
          <motion.div variants={itemVariants} className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/40 bg-surface/60 text-foreground-muted text-xs tracking-wide uppercase">
              <KnightIcon size={14} className="text-accent" />
              Academy Management
            </div>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-foreground leading-[1.05] font-bold"
            style={{
              fontSize: 'clamp(2.5rem, 5.5vw, 5rem)',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
            }}
          >
            Every game.{' '}
            <span className="text-accent">Every student.</span>{' '}
            Every edge.
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-6 text-foreground-muted text-lg leading-relaxed max-w-xl"
          >
            The management platform built for chess academies that take results
            seriously. Track ratings, plan sessions, and watch your students
            improve — in one place.
          </motion.p>

          <motion.div variants={itemVariants} className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-accent text-primary-foreground font-semibold text-base hover:bg-accent-hover transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-accent/20"
            >
              Start your academy
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg border border-border text-foreground-muted font-medium text-base hover:bg-surface-raised hover:text-foreground transition-all duration-200"
            >
              See how it works
            </Link>
          </motion.div>

          {/* Social proof / micro-stats */}
          <motion.div
            variants={itemVariants}
            className="mt-12 flex items-center gap-6 text-sm text-foreground-subtle"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent" />
              Tournament-grade security
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-warning" />
              Academy-grade simplicity
            </div>
          </motion.div>
        </motion.div>

        {/* Right Column — Board Visual */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="flex items-center justify-center"
        >
          <ChessBoardVisual />
        </motion.div>
      </div>

      {/* Feature Cards */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="max-w-7xl mx-auto px-6 lg:px-12 pb-20"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              title: 'Live Insight',
              copy: 'Know where every student stands before they walk in the door.',
            },
            {
              title: 'Role Clarity',
              copy: 'Coaches see their classes. Directors see everything.',
            },
            {
              title: 'Built for Chess',
              copy: 'Tournament-grade security. Academy-grade simplicity.',
            },
          ].map((card) => (
            <div
              key={card.title}
              className="bg-surface border border-border p-6 rounded-xl hover:border-accent/30 transition-colors duration-300"
            >
              <h3
                className="text-foreground text-lg font-semibold mb-2"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {card.title}
              </h3>
              <p className="text-foreground-muted text-sm leading-relaxed">{card.copy}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <style jsx global>{`
        .hero-grid {
          display: grid;
          grid-template-columns: 55fr 45fr;
          gap: clamp(2rem, 5vw, 5rem);
          align-items: center;
          min-height: 80vh;
          padding-top: clamp(3rem, 8vw, 7rem);
          padding-bottom: clamp(3rem, 8vw, 7rem);
        }
        @media (max-width: 768px) {
          .hero-grid {
            grid-template-columns: 1fr;
            min-height: auto;
          }
        }
      `}</style>
    </div>
  )
}
