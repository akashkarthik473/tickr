/**
 * User store using Zustand
 * Manages user authentication state including lockdown/approval status.
 */
import { create } from 'zustand';
import { api, isAuthenticated, getCurrentUser } from '../services/api';

const LOCKDOWN = import.meta.env.VITE_LOCKDOWN === 'true';

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} username
 * @property {string} name
 * @property {boolean} [approved]
 */

/**
 * @typedef {Object} UserStore
 * @property {User|null} user
 * @property {boolean} loading
 * @property {boolean} lockdown
 * @property {function} fetchUser
 * @property {function} setUser
 * @property {function} clearUser
 * @property {function} isApproved
 */

export const useUser = create((set, get) => ({
  user: null,
  loading: true,
  lockdown: LOCKDOWN,
  
  /**
   * Fetch user profile from API
   */
  fetchUser: async () => {
    if (!isAuthenticated()) {
      set({ user: null, loading: false });
      return null;
    }
    
    set({ loading: true });
    
    try {
      const response = await api.getProfile();
      if (response.success && response.user) {
        set({ user: response.user, loading: false });
        return response.user;
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
    
    // Fallback to token data
    const tokenUser = getCurrentUser();
    set({ user: tokenUser, loading: false });
    return tokenUser;
  },
  
  /**
   * Set user data directly (e.g., after login)
   */
  setUser: (user) => {
    set({ user, loading: false });
  },
  
  /**
   * Clear user data (logout)
   */
  clearUser: () => {
    localStorage.removeItem('token');
    set({ user: null, loading: false });
  },
  
  /**
   * Check if user is approved (for lockdown mode)
   */
  isApproved: () => {
    const { user, lockdown } = get();
    // If lockdown is disabled, everyone is "approved"
    if (!lockdown) return true;
    // If no user, not approved
    if (!user) return false;
    // Check approved flag
    return user.approved === true;
  }
}));

export default useUser;

