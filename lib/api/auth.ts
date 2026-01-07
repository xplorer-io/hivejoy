import type { User } from '@/types';
import { mockUsers } from './mock-data';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock OTP storage (in real app, this would be server-side)
const otpStore = new Map<string, string>();

export async function sendOTP(emailOrPhone: string): Promise<{ success: boolean; message: string }> {
  await delay(500);
  
  // Generate mock OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(emailOrPhone, otp);
  
  // In development, log the OTP
  console.log(`[DEV] OTP for ${emailOrPhone}: ${otp}`);
  
  return {
    success: true,
    message: 'OTP sent successfully',
  };
}

export async function verifyOTP(
  emailOrPhone: string,
  otp: string
): Promise<{ success: boolean; user?: User; message: string }> {
  await delay(500);
  
  const storedOTP = otpStore.get(emailOrPhone);
  
  // For development, accept "123456" as valid OTP
  if (otp !== storedOTP && otp !== '123456') {
    return {
      success: false,
      message: 'Invalid OTP',
    };
  }
  
  otpStore.delete(emailOrPhone);
  
  // Find or create user
  let user = mockUsers.find(
    u => u.email === emailOrPhone || u.phone === emailOrPhone
  );
  
  if (!user) {
    // Create new consumer user
    user = {
      id: `user-${Date.now()}`,
      email: emailOrPhone.includes('@') ? emailOrPhone : '',
      phone: !emailOrPhone.includes('@') ? emailOrPhone : undefined,
      role: 'consumer',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockUsers.push(user);
  }
  
  return {
    success: true,
    user,
    message: 'Verified successfully',
  };
}

export async function getCurrentUser(userId: string): Promise<User | null> {
  await delay(100);
  return mockUsers.find(u => u.id === userId) || null;
}

// Development helper to switch roles
export async function devSwitchRole(userId: string, role: User['role']): Promise<User | null> {
  await delay(100);
  
  const index = mockUsers.findIndex(u => u.id === userId);
  if (index === -1) return null;
  
  mockUsers[index].role = role;
  return mockUsers[index];
}

