import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, useWindowDimensions, Image, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

const MENU_ITEMS = [
    { id: '1', title: 'Edit Profile', icon: 'person.fill', color: '#6366F1' },
    { id: '2', title: 'Security', icon: 'shield.fill', color: '#4F46E5' },
    { id: '3', title: 'Setting', icon: 'gearshape.fill', color: '#6366F1' },
    { id: '4', title: 'Help', icon: 'questionmark.circle.fill', color: '#818CF8' },
    { id: '5', title: 'Logout', icon: 'rectangle.portrait.and.arrow.right', color: '#EF4444', isLogout: true },
];

const MenuItem = ({ title, icon, color, onPress, isLogout }: any) => {
    const { theme } = useTheme();
    const colors = Colors[theme];

    return (
        <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.menuLeft}>
                <View style={[styles.menuIconBox, { backgroundColor: `${color}15` }]}>
                    <IconSymbol name={icon} size={22} color={color} />
                </View>
                <Text style={[styles.menuText, { color: colors.text }, isLogout && { color: '#EF4444' }]}>{title}</Text>
            </View>
            {!isLogout && <IconSymbol name="chevron.right" size={20} color={colors.muted} />}
        </TouchableOpacity>
    );
};

export default function ProfileScreen() {
    const { height } = useWindowDimensions();
    const router = useRouter();
    const { theme } = useTheme();
    const colors = Colors[theme];
    const { user, setUser } = useAuth();

    // Data State (Real)
    const userName = user?.full_name || 'Elite User';
    const userEmail = user?.email || 'No Email';
    const avatarUrl = user?.avatar_url ? `http://localhost:5001${user.avatar_url}` : null;
    const coverUrl = user?.cover_url ? `http://localhost:5001${user.cover_url}` : null;


    const fetchData = useCallback(async () => {
        // Data is now primarily managed by AuthContext
    }, []);
    const handleLogout = async () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await setUser(null, null);
                        router.replace('/login');
                    }
                }
            ]
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <LinearGradient
                colors={coverUrl ? ['transparent', 'transparent'] : ['#4F46E5', '#6366F1']}
                style={[styles.headerGradient, { height: height * 0.28 }]}
            >
                {coverUrl && (
                    <Image
                        source={{ uri: coverUrl }}
                        style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]}
                        resizeMode="cover"
                    />
                )}
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.headerTop}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                            <IconSymbol name="chevron.left" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Profile</Text>
                        <TouchableOpacity style={styles.headerBtn}>
                            <IconSymbol name="bell.fill" size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <View style={[styles.contentSection, { backgroundColor: colors.background }]}>
                <View style={styles.profileInfoContainer}>
                    <TouchableOpacity style={styles.avatarWrapper} activeOpacity={0.8}>
                        <View style={styles.avatarBorder}>
                            {avatarUrl ? (
                                <Image
                                    source={{ uri: avatarUrl }}
                                    style={styles.avatar}
                                />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <IconSymbol name="person.fill" size={60} color="#94A3B8" />
                                </View>
                            )}
                        </View>
                        <View style={styles.cameraButton}>
                            <IconSymbol name="camera.fill" size={16} color="#FFFFFF" />
                        </View>
                    </TouchableOpacity>

                    <Text style={[styles.userNameText, { color: colors.text }]}>{userName}</Text>
                    <Text style={styles.userIdText}>{userEmail}</Text>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.menuScrollContent}
                >
                    <View style={[styles.menuWrapper, { backgroundColor: colors.card, shadowColor: colors.text }]}>
                        {MENU_ITEMS.map((item) => (
                            <MenuItem
                                key={item.id}
                                title={item.title}
                                icon={item.icon}
                                color={item.color}
                                isLogout={item.isLogout}
                                onPress={
                                    item.isLogout
                                        ? handleLogout
                                        : item.title === 'Edit Profile'
                                            ? () => router.push('/edit-profile')
                                            : item.title === 'Setting'
                                                ? () => router.push('/settings')
                                                : () => { }
                                }
                            />
                        ))}
                    </View>
                    <View style={{ height: 120 }} />
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    headerGradient: {
        width: '100%',
    },
    safeArea: {
        flex: 1,
        paddingHorizontal: 20,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    headerBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: -0.5,
    },
    contentSection: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        marginTop: -40,
    },
    profileInfoContainer: {
        alignItems: 'center',
        marginTop: -60,
        marginBottom: 30,
    },
    avatarWrapper: {
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 15,
    },
    avatarBorder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 5,
        borderColor: 'rgba(79, 70, 229, 0.1)',
        overflow: 'hidden',
        backgroundColor: '#F1F5F9',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    avatarPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
    },
    cameraButton: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: '#10B981', // Match mockup green
        borderWidth: 3,
        borderColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    userNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 15,
        gap: 8,
    },
    userNameText: {
        fontSize: 24,
        fontWeight: '900',
        color: '#1E293B',
        letterSpacing: -0.5,
    },
    userIdText: {
        marginTop: 4,
        fontSize: 14,
        fontWeight: '700',
        color: '#94A3B8',
    },
    menuScrollContent: {
        paddingHorizontal: 20,
    },
    menuWrapper: {
        backgroundColor: '#FFFFFF',
        borderRadius: 32,
        paddingVertical: 10,
        paddingHorizontal: 16,
        shadowColor: '#1E293B',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.03,
        shadowRadius: 15,
        elevation: 2,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    menuIconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1E293B',
    },
});
