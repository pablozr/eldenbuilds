/**
 * Utility functions for initializing Supabase storage and policies
 */

import { SHARED_BUCKET } from '@/lib/supabase';

/**
 * Initialize the storage bucket and policies
 * This function is called automatically when needed
 */
export async function initializeStorage(): Promise<boolean> {
  try {
    // First, initialize the bucket
    const bucketReady = await initializeBucket();
    if (!bucketReady) {
      console.error('Failed to initialize storage bucket');
      return false;
    }

    // Then, set up the policies
    const policiesReady = await setupPolicies();
    if (!policiesReady) {
      console.error('Failed to set up storage policies');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error initializing storage:', error);
    return false;
  }
}

/**
 * Initialize the storage bucket
 */
async function initializeBucket(): Promise<boolean> {
  try {
    const response = await fetch('/api/storage/init', {
      method: 'POST',
    });

    if (!response.ok) {
      console.error('Failed to initialize bucket:', await response.text());
      return false;
    }

    const data = await response.json();
    console.log(`Storage bucket '${SHARED_BUCKET}' initialized successfully`);
    return data.success;
  } catch (error) {
    console.error('Error initializing bucket:', error);
    return false;
  }
}

/**
 * Set up the storage policies
 */
async function setupPolicies(): Promise<boolean> {
  try {
    const response = await fetch('/api/storage/setup-policies', {
      method: 'POST',
    });

    if (!response.ok) {
      console.error('Failed to set up policies:', await response.text());
      return false;
    }

    const data = await response.json();
    console.log('Storage policies configured successfully');
    return data.success;
  } catch (error) {
    console.error('Error setting up policies:', error);
    return false;
  }
}
