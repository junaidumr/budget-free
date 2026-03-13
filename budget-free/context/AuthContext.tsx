import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
    phone?: string;
    avatar_url?: string | null;
    cover_url?: string | null;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    setUser: (user: User | null, token: string | null) => void;
    updateUserProfile: (updatedUser: User) => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUserState] = useState<User | null>(null);
    const [token, setTokenState] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const clearAuth = useCallback(async () => {
        setUserState(null);
        setTokenState(null);
        await AsyncStorage.removeItem('user');
        await AsyncStorage.removeItem('token');
    }, []);

    useEffect(() => {
        // Load user and token from storage on app start, then validate the token
        const loadAndVerifyUser = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('token');
                const storedUser = await AsyncStorage.getItem('user');

                if (!storedToken || !storedUser) {
                    // No stored session — user needs to log in
                    setIsLoading(false);
                    return;
                }

                // Validate the stored token against the backend
                const response = await fetch('http://localhost:5001/api/verify-token', {
                    headers: { 'Authorization': `Bearer ${storedToken}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    // Token is valid — restore session with fresh user data from server
                    setUserState(data.user);
                    setTokenState(storedToken);
                } else {
                    // Token is expired or invalid — force logout
                    console.log('Stored token is invalid/expired — clearing session');
                    await clearAuth();
                }
            } catch (e) {
                // Network error — keep the stored session so offline use still works
                console.warn('Could not verify token (network issue), loading from storage:', e);
                try {
                    const storedUser = await AsyncStorage.getItem('user');
                    const storedToken = await AsyncStorage.getItem('token');
                    if (storedUser) setUserState(JSON.parse(storedUser));
                    if (storedToken) setTokenState(storedToken);
                } catch (storageErr) {
                    console.error('Failed to load from storage:', storageErr);
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadAndVerifyUser();
    }, [clearAuth]);

    const setUser = async (newUser: User | null, newToken: string | null) => {
        setUserState(newUser);
        setTokenState(newToken);
        if (newUser && newToken) {
            await AsyncStorage.setItem('user', JSON.stringify(newUser));
            await AsyncStorage.setItem('token', newToken);
        } else {
            await AsyncStorage.removeItem('user');
            await AsyncStorage.removeItem('token');
        }
    };

    const updateUserProfile = async (updatedUser: User) => {
        setUserState(updatedUser);
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    };

    const logout = async () => {
        await clearAuth();
    };

    return (
        <AuthContext.Provider value={{ user, token, setUser, updateUserProfile, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
