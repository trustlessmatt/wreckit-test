import axios from 'axios';

const POKEMON_TCG_API_BASE = 'https://api.pokemontcg.io/v2';
const API_KEY = process.env.POKEMON_TCG_API_KEY;

const api = axios.create({
  baseURL: POKEMON_TCG_API_BASE,
  headers: API_KEY ? { 'X-Api-Key': API_KEY } : {},
});

export interface PokemonSet {
  id: string;
  name: string;
  series: string;
  total: number;
  releaseDate: string;
  images: {
    symbol: string;
    logo: string;
  };
}

export interface PokemonCard {
  id: string;
  name: string;
  number: string;
  set: {
    id: string;
    name: string;
  };
  images: {
    small: string;
    large: string;
  };
}

export const pokemonTCGApi = {
  // Get all available sets
  getSets: async () => {
    const response = await api.get('/sets');
    return response.data.data as PokemonSet[];
  },

  // Get specific set by ID
  getSet: async (setId: string) => {
    const response = await api.get(`/sets/${setId}`);
    return response.data.data as PokemonSet;
  },

  // Get cards for a specific set
  getSetCards: async (setId: string, page = 1, pageSize = 250) => {
    const response = await api.get(`/cards`, {
      params: {
        q: `set.id:${setId}`,
        page,
        pageSize,
      },
    });
    return response.data.data as PokemonCard[];
  },

  // Get specific card by ID
  getCard: async (cardId: string) => {
    const response = await api.get(`/cards/${cardId}`);
    return response.data.data as PokemonCard;
  },
};
