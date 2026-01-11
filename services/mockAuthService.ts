
import { UserProfile } from "../types";

/**
 * Simulates a Google OAuth Handshake.
 * In a real app, this would use Firebase Auth or Google Identity Services.
 */
export const performGoogleHandshake = async (): Promise<UserProfile> => {
  // Simulate network latency and handshake negotiation
  await new Promise(resolve => setTimeout(resolve, 2500));

  // Return a mock user profile that looks like it came from Google
  return {
    id: 'google_' + Math.random().toString(36).substr(2, 9),
    name: 'Void Walker', // This would come from googleUser.displayName
    email: 'user@habitquest.ai',
    avatarUrl: 'https://ui-avatars.com/api/?name=Void+Walker&background=6366f1&color=fff',
    xp: 1250, // Simulating a returning user or new user boost
    level: 3,
    joinedAt: new Date().toISOString(),
    streakFreezes: 2
  };
};

export const performAppleHandshake = async (): Promise<UserProfile> => {
  // Simulate network latency for Apple Secure Enclave
  await new Promise(resolve => setTimeout(resolve, 2500));

  return {
    id: 'apple_' + Math.random().toString(36).substr(2, 9),
    name: 'Apple User',
    email: 'user@privaterelay.appleid.com',
    avatarUrl: 'https://ui-avatars.com/api/?name=Apple+User&background=000000&color=fff',
    xp: 500,
    level: 2,
    joinedAt: new Date().toISOString(),
    streakFreezes: 1
  };
};

export const performStandardLogin = async (email: string): Promise<UserProfile> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return {
    id: 'std_' + Math.random().toString(36).substr(2, 9),
    name: email.split('@')[0],
    email: email,
    xp: 0,
    level: 1,
    joinedAt: new Date().toISOString(),
    streakFreezes: 1
  };
};

export const requestPasswordReset = async (email: string): Promise<void> => {
  // Simulate searching for user and sending email
  await new Promise(resolve => setTimeout(resolve, 2000));
};

export const sendPhoneOtp = async (phone: string): Promise<void> => {
  // Simulate SMS gateway latency
  await new Promise(resolve => setTimeout(resolve, 1500));
};

export const performPhoneLogin = async (phone: string, otp: string): Promise<UserProfile> => {
  // Simulate OTP verification
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    id: 'phone_' + Math.random().toString(36).substr(2, 9),
    name: 'Mobile Operative',
    email: phone + '@mobile.habitquest.ai',
    avatarUrl: 'https://ui-avatars.com/api/?name=Mobile+Op&background=10b981&color=fff',
    xp: 100,
    level: 1,
    joinedAt: new Date().toISOString(),
    streakFreezes: 1
  };
};
