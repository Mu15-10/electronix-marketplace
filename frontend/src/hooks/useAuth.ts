'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { authApi, usersApi } from '@/lib/api';
import toast from 'react-hot-toast';

export function useAuth() {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    isLoading,
    setUser,
    setTokens,
    setLoading,
    logout: storeLogout,
  } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token && !user) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await usersApi.getProfile();
      setUser(response.data);
    } catch {
      storeLogout();
    }
  };

  const login = useCallback(
    async (email: string, password: string, rememberMe?: boolean) => {
      try {
        const response = await authApi.login({ email, password });
        const { access, refresh, user: userData } = response.data;
        setTokens(access, refresh);
        setUser(userData);
        if (rememberMe) {
          localStorage.setItem('remembered_email', email);
        }
        toast.success('Welcome back!');
        router.push('/dashboard');
        return { success: true };
      } catch (error: any) {
        const message = error.response?.data?.detail || 'Login failed';
        toast.error(message);
        return { success: false, error: message };
      }
    },
    [router, setTokens, setUser]
  );

  const register = useCallback(
    async (data: Record<string, unknown>) => {
      try {
        const response = await authApi.register(data);
        const { access, refresh, user: userData } = response.data;
        setTokens(access, refresh);
        setUser(userData);
        toast.success('Account created successfully!');
        router.push('/verify-email');
        return { success: true };
      } catch (error: any) {
        const message =
          error.response?.data?.detail ||
          Object.values(error.response?.data || {}).flat().join(', ') ||
          'Registration failed';
        toast.error(message);
        return { success: false, error: message };
      }
    },
    [router, setTokens, setUser]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    storeLogout();
    router.push('/');
    toast.success('Logged out successfully');
  }, [router, storeLogout]);

  const forgotPassword = useCallback(async (email: string) => {
    try {
      await authApi.forgotPassword(email);
      toast.success('Password reset email sent');
      return { success: true };
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to send reset email';
      toast.error(message);
      return { success: false, error: message };
    }
  }, []);

  const resetPassword = useCallback(
    async (token: string, password: string) => {
      try {
        await authApi.resetPassword({ token, password });
        toast.success('Password reset successfully');
        return { success: true };
      } catch (error: any) {
        const message = error.response?.data?.detail || 'Failed to reset password';
        toast.error(message);
        return { success: false, error: message };
      }
    },
    []
  );

  const twoFactor = useCallback(
    async (code: string, tempToken: string) => {
      try {
        const response = await authApi.twoFactor({ code, tempToken });
        const { access, refresh, user: userData } = response.data;
        setTokens(access, refresh);
        setUser(userData);
        router.push('/dashboard');
        return { success: true };
      } catch (error: any) {
        const message = error.response?.data?.detail || 'Invalid code';
        toast.error(message);
        return { success: false, error: message };
      }
    },
    [router, setTokens, setUser]
  );

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    twoFactor,
    fetchProfile,
  };
}
