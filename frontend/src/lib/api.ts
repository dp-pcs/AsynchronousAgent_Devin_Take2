const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface Prediction {
  id: number;
  title: string;
  category?: string;
  stake: number;
  expires_at: string;
  status: 'open' | 'resolved';
  outcome?: 'success' | 'fail';
  username: string;
  created_at: string;
  resolved_at?: string;
}

export interface CreatePredictionData {
  title: string;
  category?: string;
  stake: number;
  expires_at: string;
  username: string;
}

export interface LeaderboardEntry {
  username: string;
  total_points: number;
  predictions_count: number;
}

export const api = {
  async createPrediction(data: CreatePredictionData): Promise<Prediction> {
    const response = await fetch(`${API_URL}/predictions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create prediction');
    }
    return response.json();
  },

  async getPredictions(status?: 'open' | 'resolved', username?: string): Promise<Prediction[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (username) params.append('username', username);
    
    const response = await fetch(`${API_URL}/predictions?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch predictions');
    }
    return response.json();
  },

  async resolvePrediction(id: number, outcome: 'success' | 'fail'): Promise<Prediction> {
    const response = await fetch(`${API_URL}/predictions/${id}/resolve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ outcome }),
    });
    if (!response.ok) {
      throw new Error('Failed to resolve prediction');
    }
    return response.json();
  },

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const response = await fetch(`${API_URL}/leaderboard`);
    if (!response.ok) {
      throw new Error('Failed to fetch leaderboard');
    }
    return response.json();
  },
};
