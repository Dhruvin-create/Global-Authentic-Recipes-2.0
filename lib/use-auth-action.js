'use client';

import { useState } from 'react';
import { useAuth } from './auth-context';

/**
 * Custom hook to handle actions that require authentication
 * Shows auth modal if user is not logged in
 * 
 * Usage:
 * const { requireAuth, AuthModal } = useAuthAction();
 * 
 * const handleAction = requireAuth(() => {
 *   // Your action code here
 *   console.log('User is authenticated, performing action...');
 * });
 * 
 * return (
 *   <>
 *     <button onClick={handleAction}>Add to Favorites</button>
 *     <AuthModal />
 *   </>
 * );
 */
export function useAuthAction() {
  const { isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  /**
   * Wraps an action to require authentication
   * If user is not authenticated, shows auth modal
   * If user is authenticated, executes the action immediately
   */
  const requireAuth = (action, mode = 'login') => {
    return (...args) => {
      if (isAuthenticated) {
        // User is authenticated, execute action immediately
        return action(...args);
      } else {
        // User is not authenticated, show auth modal
        setPendingAction(() => () => action(...args));
        setShowAuthModal(true);
      }
    };
  };

  /**
   * Called when user successfully authenticates
   * Executes the pending action if any
   */
  const handleAuthSuccess = () => {
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
    setShowAuthModal(false);
  };

  /**
   * Closes the auth modal without executing pending action
   */
  const handleAuthClose = () => {
    setShowAuthModal(false);
    setPendingAction(null);
  };

  return {
    requireAuth,
    showAuthModal,
    setShowAuthModal,
    handleAuthSuccess,
    handleAuthClose,
    isAuthenticated
  };
}
