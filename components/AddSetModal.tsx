'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { PokemonSet as PokemonTCGSet } from '@/lib/pokemon-tcg';
import { PokemonSet as DBPokemonSet } from '@/db/schema';

interface AddSetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSet: (set: DBPokemonSet) => void;
}

export function AddSetModal({ isOpen, onClose, onAddSet }: AddSetModalProps) {
  const [availableSets, setAvailableSets] = useState<PokemonTCGSet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchSets();
    }
  }, [isOpen]);

  const fetchSets = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/pokemon/sets');
      const data = await response.json();
      setAvailableSets(data.sets || []);
    } catch (error) {
      console.error('Failed to fetch sets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSets = availableSets.filter((set) =>
    set.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddSet = async (set: PokemonTCGSet) => {
    try {
      const response = await fetch('/api/sets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('privy_token')}`,
        },
        body: JSON.stringify({
          setApiId: set.id,
          setName: set.name,
          setSeries: set.series,
          totalCards: set.total,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        onAddSet(data.set);

        // Fetch and initialize cards for this set
        await initializeCards(set.id);
      }
    } catch (error) {
      console.error('Failed to add set:', error);
    }
  };

  const initializeCards = async (setApiId: string) => {
    try {
      const response = await fetch(`/api/pokemon/cards?setApiId=${setApiId}`);
      const data = await response.json();

      if (data.cards) {
        await fetch('/api/cards', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('privy_token')}`,
          },
          body: JSON.stringify({
            setApiId,
            cards: data.cards,
          }),
        });
      }
    } catch (error) {
      console.error('Failed to initialize cards:', error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden pointer-events-auto"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Add Pokemon Set</h2>
                  <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {/* Search */}
                <div className="mt-4">
                  <input
                    type="text"
                    placeholder="Search sets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/20 placeholder-white/60 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                </div>
              </div>

              {/* Sets list */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="mt-4 text-gray-600">Loading sets...</p>
                  </div>
                ) : filteredSets.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">🔍</div>
                    <p className="text-gray-600">
                      {searchQuery ? 'No sets found matching your search.' : 'No sets available.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredSets.map((set) => (
                      <motion.div
                        key={set.id}
                        whileHover={{ scale: 1.02 }}
                        className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer"
                      >
                        <div className="flex items-start gap-4">
                          {/* Set logo */}
                          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                            {set.name.charAt(0)}
                          </div>

                          {/* Set info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-800 truncate">{set.name}</h3>
                            <p className="text-sm text-gray-500">{set.series}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              {set.total} cards • Released {new Date(set.releaseDate).getFullYear()}
                            </p>
                          </div>

                          {/* Add button */}
                          <button
                            onClick={() => handleAddSet(set)}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"
                          >
                            Add
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
