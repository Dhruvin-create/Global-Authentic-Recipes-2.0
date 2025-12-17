/**
 * Backend API Configuration
 * Use this to point your frontend to the backend server
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const apiClient = {
  async getRecipes() {
    const res = await fetch(`${API_BASE_URL}/api/recipes`);
    if (!res.ok) throw new Error('Failed to fetch recipes');
    return res.json();
  },

  async getRecipe(id: string | number) {
    const res = await fetch(`${API_BASE_URL}/api/recipes/${id}`);
    if (!res.ok) throw new Error('Failed to fetch recipe');
    return res.json();
  },

  async createRecipe(data: any) {
    const res = await fetch(`${API_BASE_URL}/api/recipes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create recipe');
    return res.json();
  },

  async updateRecipe(id: string | number, data: any) {
    const res = await fetch(`${API_BASE_URL}/api/recipes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update recipe');
    return res.json();
  },

  async deleteRecipe(id: string | number) {
    const res = await fetch(`${API_BASE_URL}/api/recipes/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete recipe');
    return res.json();
  },
};
