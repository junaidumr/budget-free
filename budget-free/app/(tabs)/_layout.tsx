import { Tabs } from 'expo-router';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: '#94A3B8',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#FFFFFF', // Clean white background
          borderTopWidth: 1,
          borderTopColor: '#F1F5F9',
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
          borderTopLeftRadius: 40,
          borderTopRightRadius: 40,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          shadowOpacity: 0.05,
          shadowColor: '#6366F1',
          shadowOffset: { width: 0, height: -4 },
          shadowRadius: 10,
        },
        tabBarShowLabel: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <IconSymbol name="house.fill" size={24} color={focused ? '#FFFFFF' : color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <IconSymbol name="chart.bar.fill" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="swap" // Placeholder for the swap icon
        options={{
          tabBarIcon: ({ focused, color }) => (
            <IconSymbol name="arrow.left.arrow.right" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="layers" // Placeholder for layers
        options={{
          tabBarIcon: ({ focused, color }) => (
            <IconSymbol name="square.stack.3d.up.fill" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile" // Placeholder for profile
        options={{
          tabBarIcon: ({ focused, color }) => (
            <IconSymbol name="person.fill" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="edit-profile"
        options={{
          href: null, // This hides it from the tab bar
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="change-password"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIconContainer: {
    backgroundColor: '#4F46E5',
  },
});
