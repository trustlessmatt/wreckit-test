'use client';

import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { BinderShelf } from '@/components/BinderShelf';
import { BinderView } from '@/components/BinderView';
import { AddSetModal } from '@/components/AddSetModal';
import { AuthModal } from '@/components/AuthModal';
import { useAuthStore } from '@/store/useAuthStore';
import { useCollectionStore } from '@/store/useCollectionStore';
import { PokemonSet } from '@/db/schema';

export default function Home() {
  const { authenticated, getAccessToken } = usePrivy();
  const { isAuthenticated, setAuth, logout } = useAuthStore();
  const {
    sets,
    cards,
    selectedSet,
    isLoading,
    error,
    setSets,
    setCards,
    setSelectedSet,
    addSet,
    removeSet,
    updateCard,
    setLoading,
    setError,
  } = useCollectionStore();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAddSetModal, setShowAddSetModal] = useState(false);

  useEffect(() => {
    if (authenticated && !isAuthenticated) {
      handleAuthSuccess();
    } else if (!authenticated && isAuthenticated) {
      logout();
    }
  }, [authenticated]);

  const handleAuthSuccess = async () => {
    try {
      const token = await getAccessToken();
      if (!token) return;

      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: token }),
      });

      if (response.ok) {
        const data = await response.json();
        setAuth(data.user, token);
        localStorage.setItem('privy_token', token);
        await fetchUserSets();
      }
    } catch (error) {
      console.error('Auth success handler error:', error);
    }
  };

  const fetchUserSets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('privy_token');
      const response = await fetch('/api/sets', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setSets(data.sets || []);
      }
    } catch (error) {
      console.error('Failed to fetch sets:', error);
      setError('Failed to load your collection');
    } finally {
      setLoading(false);
    }
  };

  const fetchSetCards = async (setApiId: string) => {
    try {
      const token = localStorage.getItem('privy_token');
      const response = await fetch(`/api/cards?setApiId=${setApiId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setCards(data.cards || []);
      }
    } catch (error) {
      console.error('Failed to fetch cards:', error);
    }
  };

  const handleBinderClick = async (set: PokemonSet) => {
    setSelectedSet(set);
    await fetchSetCards(set.setApiId);
  };

  const handleAddSet = (newSet: PokemonSet) => {
    addSet(newSet);
    setShowAddSetModal(false);
  };

  const handleToggleCard = async (cardId: string, collected: boolean) => {
    try {
      const token = localStorage.getItem('privy_token');
      const response = await fetch('/api/cards', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cardId, collected }),
      });

      if (response.ok) {
        const data = await response.json();
        updateCard(data.card.id, data.card.collected);

        // Update set progress
        if (selectedSet) {
          const updatedSets = sets.map((s) =>
            s.id === selectedSet.id
              ? { ...s, collectedCards: collected ? s.collectedCards + 1 : s.collectedCards - 1 }
              : s
          );
          setSets(updatedSets);
          setSelectedSet(updatedSets.find((s) => s.id === selectedSet.id) || null);
        }
      }
    } catch (error) {
      console.error('Failed to update card:', error);
    }
  };

  const handleBackToShelf = () => {
    setSelectedSet(null);
    setCards([]);
  };

  // Show auth prompt for unauthenticated users
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-8xl mb-8">🎴</div>
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Pokemon TCG Master Set Tracker
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Track your collection progress across all sets
          </p>
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            Sign In to Get Started
          </button>
          <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main shelf view */}
      {!selectedSet && (
        <BinderShelf
          sets={sets}
          onBinderClick={handleBinderClick}
          onAddSet={() => setShowAddSetModal(true)}
        />
      )}

      {/* Binder view */}
      {selectedSet && (
        <BinderView
          set={selectedSet}
          cards={cards}
          onBack={handleBackToShelf}
          onToggleCard={handleToggleCard}
        />
      )}

      {/* Add set modal */}
      <AddSetModal
        isOpen={showAddSetModal}
        onClose={() => setShowAddSetModal(false)}
        onAddSet={handleAddSet}
      />

      {/* Error toast */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
          {error}
        </div>
      )}
    </>
  );
}
