'use client';

import { motion } from 'framer-motion';
import { Binder } from './Binder';
import { PokemonSet } from '@/db/schema';

interface BinderShelfProps {
  sets: PokemonSet[];
  onBinderClick: (set: PokemonSet) => void;
  onAddSet: () => void;
}

export function BinderShelf({ sets, onBinderClick, onAddSet }: BinderShelfProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold text-gray-800 mb-4"
          >
            Pokemon TCG Master Set Tracker
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600"
          >
            Track your collection progress
          </motion.p>
        </div>

        {/* Add Set Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-12 flex justify-center"
        >
          <button
            onClick={onAddSet}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            + Add New Set
          </button>
        </motion.div>

        {/* Empty State */}
        {sets.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              Your shelf is empty
            </h2>
            <p className="text-gray-500">
              Add a Pokemon set to start tracking your collection!
            </p>
          </motion.div>
        )}

        {/* Binder Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8 justify-items-center">
          {sets.map((set, index) => (
            <Binder
              key={set.id}
              set={set}
              onClick={() => onBinderClick(set)}
              index={index}
            />
          ))}
        </div>

        {/* Shelf base */}
        {sets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 h-4 bg-gradient-to-r from-amber-800 via-amber-700 to-amber-800 rounded shadow-lg"
          />
        )}
      </div>
    </div>
  );
}
