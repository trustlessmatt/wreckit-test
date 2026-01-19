import { create } from 'zustand';

interface PokemonSet {
  id: string;
  userId: string;
  setApiId: string;
  setName: string;
  setSeries: string | null;
  totalCards: number;
  collectedCards: number;
  createdAt: string;
  updatedAt: string;
}

interface UserCard {
  id: string;
  userId: string;
  setApiId: string;
  cardApiId: string;
  cardName: string;
  cardNumber: string;
  collected: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CollectionState {
  sets: PokemonSet[];
  cards: UserCard[];
  selectedSet: PokemonSet | null;
  isLoading: boolean;
  error: string | null;

  setSets: (sets: PokemonSet[]) => void;
  setCards: (cards: UserCard[]) => void;
  setSelectedSet: (set: PokemonSet | null) => void;
  addSet: (set: PokemonSet) => void;
  removeSet: (setId: string) => void;
  updateCard: (cardId: string, collected: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useCollectionStore = create<CollectionState>((set) => ({
  sets: [],
  cards: [],
  selectedSet: null,
  isLoading: false,
  error: null,

  setSets: (sets) => set({ sets }),

  setCards: (cards) => set({ cards }),

  setSelectedSet: (selectedSet) => set({ selectedSet }),

  addSet: (newSet) =>
    set((state) => ({
      sets: [...state.sets, newSet],
    })),

  removeSet: (setId) =>
    set((state) => ({
      sets: state.sets.filter((s) => s.id !== setId),
      selectedSet:
        state.selectedSet?.id === setId ? null : state.selectedSet,
    })),

  updateCard: (cardId, collected) =>
    set((state) => ({
      cards: state.cards.map((card) =>
        card.id === cardId ? { ...card, collected } : card
      ),
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),
}));
