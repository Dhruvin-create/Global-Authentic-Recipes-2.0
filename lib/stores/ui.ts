// UI State Store for theme, sidebar, filters, and general UI state

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { FilterState, UIState, ViewportSize } from '../types';

interface UIStoreState extends UIState {
  // Viewport and responsive state
  viewportSize: ViewportSize;
  isMobile: boolean;
  
  // Loading states
  isLoading: boolean;
  loadingMessage?: string;
  
  // Modal and overlay states
  activeModal?: string;
  overlayOpen: boolean;
  
  // Search state
  searchHistory: string[];
  searchSuggestions: string[];
  
  // Actions
  setTheme: (theme: UIState['theme']) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSearch: () => void;
  setSearchOpen: (open: boolean) => void;
  
  // Filter actions
  setFilters: (filters: Partial<FilterState>) => void;
  clearFilters: () => void;
  resetFilters: () => void;
  
  // View mode actions
  setViewMode: (mode: UIState['viewMode']) => void;
  toggleViewMode: () => void;
  
  // Viewport actions
  setViewportSize: (size: ViewportSize) => void;
  updateIsMobile: (isMobile: boolean) => void;
  
  // Loading actions
  setLoading: (loading: boolean, message?: string) => void;
  
  // Modal actions
  openModal: (modalId: string) => void;
  closeModal: () => void;
  setOverlayOpen: (open: boolean) => void;
  
  // Search actions
  addToSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
  setSearchSuggestions: (suggestions: string[]) => void;
}

const initialFilters: FilterState = {
  category: undefined,
  area: undefined,
  ingredient: undefined,
  searchQuery: undefined,
  sortBy: 'name',
  sortOrder: 'asc',
};

export const useUIStore = create<UIStoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      theme: 'system',
      sidebarOpen: false,
      searchOpen: false,
      filters: initialFilters,
      viewMode: 'grid',
      viewportSize: 'desktop',
      isMobile: false,
      isLoading: false,
      loadingMessage: undefined,
      activeModal: undefined,
      overlayOpen: false,
      searchHistory: [],
      searchSuggestions: [],

      // Theme actions
      setTheme: (theme) => {
        set({ theme });
      },

      // Sidebar actions
      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },

      setSidebarOpen: (open) => {
        set({ sidebarOpen: open });
      },

      // Search actions
      toggleSearch: () => {
        set((state) => ({ searchOpen: !state.searchOpen }));
      },

      setSearchOpen: (open) => {
        set({ searchOpen: open });
      },

      // Filter actions
      setFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters }
        }));
      },

      clearFilters: () => {
        set({ filters: initialFilters });
      },

      resetFilters: () => {
        set({ filters: initialFilters });
      },

      // View mode actions
      setViewMode: (mode) => {
        set({ viewMode: mode });
      },

      toggleViewMode: () => {
        set((state) => ({
          viewMode: state.viewMode === 'grid' ? 'list' : 'grid'
        }));
      },

      // Viewport actions
      setViewportSize: (size) => {
        set({ viewportSize: size });
      },

      updateIsMobile: (isMobile) => {
        set({ isMobile });
      },

      // Loading actions
      setLoading: (loading, message) => {
        set({ isLoading: loading, loadingMessage: message });
      },

      // Modal actions
      openModal: (modalId) => {
        set({ activeModal: modalId, overlayOpen: true });
      },

      closeModal: () => {
        set({ activeModal: undefined, overlayOpen: false });
      },

      setOverlayOpen: (open) => {
        set({ overlayOpen: open });
      },

      // Search history actions
      addToSearchHistory: (query) => {
        const { searchHistory } = get();
        const trimmedQuery = query.trim();
        
        if (trimmedQuery && !searchHistory.includes(trimmedQuery)) {
          const newHistory = [trimmedQuery, ...searchHistory.slice(0, 9)]; // Keep last 10
          set({ searchHistory: newHistory });
        }
      },

      clearSearchHistory: () => {
        set({ searchHistory: [] });
      },

      setSearchSuggestions: (suggestions) => {
        set({ searchSuggestions: suggestions });
      },
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        viewMode: state.viewMode,
        searchHistory: state.searchHistory,
        filters: state.filters,
      }),
    }
  )
);