'use client';

import { motion } from 'framer-motion';
import { PokemonSet } from '@/db/schema';
import { gsap } from 'gsap';

interface BinderProps {
  set: PokemonSet;
  onClick: () => void;
  index: number;
}

export function Binder({ set, onClick, index }: BinderProps) {
  const completionPercentage = Math.round(
    (set.collectedCards / set.totalCards) * 100
  );

  const handleMouseEnter = () => {
    gsap.to(`#binder-${set.id}`, {
      scale: 1.05,
      rotationY: 5,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  const handleMouseLeave = () => {
    gsap.to(`#binder-${set.id}`, {
      scale: 1,
      rotationY: 0,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  return (
    <motion.div
      id={`binder-${set.id}`}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="relative cursor-pointer group"
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: '1000px' }}
    >
      {/* Binder spine */}
      <div className="relative w-32 h-44 md:w-40 md:h-52 bg-gradient-to-br from-blue-600 to-blue-800 rounded-r-lg shadow-2xl transform-gpu">
        {/* Binder texture effect */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiPjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMCAwaDJ2Mkgwem0zIDBoMnYySDN6IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')]"></div>
        </div>

        {/* Set label area */}
        <div className="absolute inset-x-2 top-4 bottom-8 flex flex-col items-center justify-between py-4">
          {/* Series name */}
          {set.setSeries && (
            <div className="text-xs text-blue-200 font-medium tracking-wider uppercase text-center line-clamp-1">
              {set.setSeries}
            </div>
          )}

          {/* Set name */}
          <div className="flex-1 flex items-center justify-center">
            <h3 className="text-sm md:text-base font-bold text-white text-center leading-tight">
              {set.setName}
            </h3>
          </div>

          {/* Completion badge */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border-2 border-white/20">
              <span className="text-lg font-bold text-white">
                {completionPercentage}%
              </span>
            </div>
            <div className="text-xs text-blue-200 font-medium">
              {set.collectedCards}/{set.totalCards}
            </div>
          </div>
        </div>

        {/* Binder edge details */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
        <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-l from-blue-400/30 to-transparent" />

        {/* Hover glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-blue-400/0 group-hover:from-white/10 group-hover:via-transparent group-hover:to-blue-400/20 transition-all duration-300 rounded-r-lg" />
      </div>

      {/* Shadow */}
      <div className="absolute -bottom-2 left-2 right-2 h-3 bg-black/40 blur-md rounded-full" />
    </motion.div>
  );
}
