'use client';

import { motion } from 'framer-motion';
import { UserCard } from '@/db/schema';

interface CardSlotProps {
  card: UserCard;
  index: number;
  onToggle: () => void;
}

export function CardSlot({ card, index, onToggle }: CardSlotProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="relative aspect-[3/4] bg-white rounded-lg shadow-lg overflow-hidden group cursor-pointer"
      onClick={onToggle}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Card background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200" />

      {/* Card info */}
      <div className="relative p-3 h-full flex flex-col">
        {/* Checkbox */}
        <div className="flex justify-end mb-2">
          <div
            className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${
              card.collected
                ? 'bg-green-500 border-green-500'
                : 'bg-white/50 border-gray-300 group-hover:border-green-400'
            }`}
          >
            {card.collected && (
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </div>
        </div>

        {/* Card placeholder */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">🃏</div>
            <div className="text-xs text-gray-400">Card Image</div>
          </div>
        </div>

        {/* Card details */}
        <div className="mt-2">
          <div className="text-xs text-gray-500 font-medium">#{card.cardNumber}</div>
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-tight">
            {card.cardName}
          </h3>
        </div>
      </div>

      {/* Collected overlay */}
      {card.collected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-green-500/10 pointer-events-none"
        />
      )}

      {/* Hover effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/0 via-black/0 to-black/10 group-hover:from-black/0 group-hover:via-transparent group-hover:to-black/20 transition-all duration-300" />
    </motion.div>
  );
}
