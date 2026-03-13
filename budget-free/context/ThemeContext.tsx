import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
    theme: ThemeMode;
    toggleTheme: () => void;
    setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<ThemeMode>('light');

    // Load theme on startup
    useEffect(() => {
        const loadTheme = async () => {
            try {
                // Try local storage
                const localTheme = await AsyncStorage.getItem('user-theme');
                if (localTheme) {
                    setTheme(localTheme as ThemeMode);
                }
            } catch (err) {
                console.error('Error loading theme:', err);
            }
        };

        loadTheme();
    }, []);

    const setThemeMode = async (mode: ThemeMode) => {
        console.log('Setting theme mode to:', mode);
        setTheme(mode);
        try {
            await AsyncStorage.setItem('user-theme', mode);
        } catch (err) {
            console.error('Error saving theme:', err);
        }
    };

    const toggleTheme = () => {
        const nextTheme = theme === 'light' ? 'dark' : 'light';
        console.log('Toggling theme from', theme, 'to', nextTheme);
        // Alert.alert('Toggle Triggered', `Internal State: theme=${theme}, next=${nextTheme}`);
        setThemeMode(nextTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setThemeMode }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
