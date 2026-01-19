'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { UserCard, PokemonSet } from '@/db/schema';
import { CardSlot } from './CardSlot';
import { gsap } from 'gsap';

interface BinderViewProps {
  set: PokemonSet;
  cards: UserCard[];
  onBack: () => void;
  onToggleCard: (cardId: string, collected: boolean) => void;
}

export function BinderView({ set, cards, onBack, onToggleCard }: BinderViewProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isOpening, setIsOpening] = useState(true);
  const cardsPerPage = 12; // 3x4 grid

  const totalPages = Math.ceil(cards.length / cardsPerPage);
  const currentCards = cards.slice(
    currentPage * cardsPerPage,
    (currentPage + 1) * cardsPerPage
  );

  useEffect(() => {
    // Opening animation
    const tl = gsap.timeline({
      onComplete: () => setIsOpening(false),
    });

    tl.fromTo(
      '#binder-view',
      { scale: 0.8, opacity: 0, rotateY: -30 },
      { scale: 1, opacity: 1, rotateY: 0, duration: 0.8, ease: 'power3.out' }
    );
  }, []);

  const handlePageChange = (newPage: number) => {
    gsap.to('#card-grid', {
      opacity: 0,
      x: -50,
      duration: 0.3,
      onComplete: () => {
        setCurrentPage(newPage);
        gsap.fromTo(
          '#card-grid',
          { opacity: 0, x: 50 },
          { opacity: 1, x: 0, duration: 0.3 }
        );
      },
    });
  };

  const handleBack = () => {
    gsap.to('#binder-view', {
      scale: 0.8,
      opacity: 0,
      rotateY: 30,
      duration: 0.5,
      ease: 'power3.in',
      onComplete: onBack,
    });
  };

  return (
    <div id="binder-view" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-5xl bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg shadow-2xl overflow-hidden"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Binder header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">{set.setName}</h2>
            <p className="text-blue-200 mt-1">
              {set.setSeries && `${set.setSeries} • `}
              Progress: {set.collectedCards}/{set.totalCards} cards
            </p>
          </div>
          <button
            onClick={handleBack}
            className="px-6 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-colors"
          >
            ← Back to Shelf
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-gray-300">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(set.collectedCards / set.totalCards) * 100}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
          />
        </div>

        {/* Card grid */}
        <div className="p-8">
          <div id="card-grid" className="grid grid-cols-3 md:grid-cols-4 gap-4">
            <AnimatePresence>
              {currentCards.map((card, index) => (
                <CardSlot
                  key={card.id}
                  card={card}
                  index={index}
                  onToggle={() => onToggleCard(card.id, !card.collected)}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Empty slots for current page */}
          {currentCards.length < cardsPerPage && (
            <>
              {Array.from({ length: cardsPerPage - currentCards.length }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="aspect-[3/4] bg-gray-300/50 rounded-lg border-2 border-dashed border-gray-400"
                />
              ))}
            </>
          )}
        </div>

        {/* Page navigation */}
        {totalPages > 1 && (
          <div className="bg-gray-100 px-6 py-4 flex items-center justify-center gap-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
            >
              ← Previous
            </button>
            <span className="text-lg font-semibold text-gray-700">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
