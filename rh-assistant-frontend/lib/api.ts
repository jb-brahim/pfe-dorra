const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://pfe-dorra.onrender.com/api';

export const api = {
  get: async (endpoint: string) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`);
    return res.json();
  },
  
  post: async (endpoint: string, data: any) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to post to ${endpoint}`);
    return res.json();
  },

  put: async (endpoint: string, data: any) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to update ${endpoint}`);
    return res.json();
  },

  delete: async (endpoint: string) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`Failed to delete ${endpoint}`);
    return res.json();
  },
};
