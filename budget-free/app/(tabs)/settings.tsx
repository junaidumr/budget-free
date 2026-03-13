import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, useWindowDimensions, Alert, Switch, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';

const SETTINGS_ITEMS = [
    {
        id: '1',
        title: 'Notification Settings',
        subtitle: 'Manage push & email alerts',
        icon: 'bell.fill',
        color: '#6366F1',
    },
    {
        id: '2',
        title: 'Password Settings',
        subtitle: 'Change or reset your password',
        icon: 'lock.fill',
        color: '#F59E0B',
    },
    {
        id: '3',
        title: 'Delete Account',
        subtitle: 'Permanently delete your data',
        icon: 'trash.fill',
        color: '#EF4444',
        isDanger: true,
    },
];

export default function SettingsScreen() {
    const { height } = useWindowDimensions();
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();
    const colors = Colors[theme];
    const [deleting, setDeleting] = useState(false);

    const handleNotificationSettings = () => {
        Alert.alert(
            'Notification Settings',
            'Choose your notification preferences',
            [
                { text: 'Enable All', onPress: () => Alert.alert('Done', 'All notifications enabled') },
                { text: 'Disable All', onPress: () => Alert.alert('Done', 'All notifications disabled') },
                { text: 'Cancel', style: 'cancel' },
            ]
        );
    };

    const handlePasswordSettings = () => {
        router.push('/change-password');
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            '⚠️ Delete Account',
            'This action is permanent and cannot be undone. All your data, transactions, and preferences will be permanently deleted.',
            [
                {
                    text: 'Delete Permanently',
                    style: 'destructive',
                    onPress: () => {
                        Alert.alert(
                            'Are you absolutely sure?',
                            'Type DELETE to confirm (this confirmation is simplified for now).',
                            [
                                {
                                    text: 'Yes, Delete Everything',
                                    style: 'destructive',
                                    onPress: async () => {
                                        setDeleting(true);
                                        // Simulate local account deletion
                                        setTimeout(() => {
                                            setDeleting(false);
                                            router.replace('/login');
                                        }, 2000);
                                    },
                                },
                                { text: 'Cancel', style: 'cancel' },
                            ]
                        );
                    },
                },
                { text: 'Cancel', style: 'cancel' },
            ]
        );
    };

    const handlePress = (item: typeof SETTINGS_ITEMS[0]) => {
        switch (item.id) {
            case '1':
                handleNotificationSettings();
                break;
            case '2':
                handlePasswordSettings();
                break;
            case '3':
                handleDeleteAccount();
                break;
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <LinearGradient
                colors={['#4F46E5', '#6366F1']}
                style={[styles.headerGradient, { height: height * 0.22 }]}
            >
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.headerTop}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                            <IconSymbol name="chevron.left" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Settings</Text>
                        <View style={styles.headerBtn}>
                            <IconSymbol name="gearshape.fill" size={20} color="#FFFFFF" />
                        </View>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <View style={[styles.contentSection, { backgroundColor: colors.background }]}>
                {/* Dark Mode Toggle Card */}
                <View style={[styles.themeCard, { backgroundColor: colors.card, shadowColor: colors.text }]}>
                    <View style={styles.themeCardLeft}>
                        <View style={[styles.themeIconBox, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
                            <IconSymbol name="moon.fill" size={22} color="#6366F1" />
                        </View>
                        <View>
                            <Text style={[styles.themeTitle, { color: colors.text }]}>Dark Mode</Text>
                            <Text style={[styles.themeSubtitle, { color: colors.muted }]}>
                                {theme === 'dark' ? 'Currently enabled' : 'Switch to dark theme'}
                            </Text>
                        </View>
                    </View>
                    <Switch
                        value={theme === 'dark'}
                        onValueChange={toggleTheme}
                        trackColor={{ false: '#E2E8F0', true: '#6366F1' }}
                        thumbColor="#FFFFFF"
                    />
                </View>

                {/* Settings Options */}
                <View style={[styles.menuWrapper, { backgroundColor: colors.card, shadowColor: colors.text }]}>
                    {SETTINGS_ITEMS.map((item, index) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[
                                styles.menuItem,
                                { borderBottomColor: colors.border },
                                index === SETTINGS_ITEMS.length - 1 && { borderBottomWidth: 0 },
                            ]}
                            onPress={() => handlePress(item)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.menuLeft}>
                                <View style={[styles.menuIconBox, { backgroundColor: `${item.color}15` }]}>
                                    <IconSymbol name={item.icon as any} size={22} color={item.color} />
                                </View>
                                <View>
                                    <Text style={[
                                        styles.menuText,
                                        { color: item.isDanger ? '#EF4444' : colors.text },
                                    ]}>
                                        {item.title}
                                    </Text>
                                    <Text style={[styles.menuSubtext, { color: colors.muted }]}>
                                        {item.subtitle}
                                    </Text>
                                </View>
                            </View>
                            <IconSymbol name="chevron.right" size={18} color={colors.muted} />
                        </TouchableOpacity>
                    ))}
                </View>

                {deleting && (
                    <View style={styles.deletingOverlay}>
                        <ActivityIndicator size="large" color="#EF4444" />
                        <Text style={styles.deletingText}>Deleting account...</Text>
                    </View>
                )}
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
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        marginTop: -40,
        paddingTop: 30,
        paddingHorizontal: 20,
    },
    themeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 18,
        marginBottom: 20,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 4,
    },
    themeCardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    themeIconBox: {
        width: 46,
        height: 46,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    themeTitle: {
        fontSize: 16,
        fontWeight: '800',
    },
    themeSubtitle: {
        fontSize: 13,
        fontWeight: '500',
        marginTop: 2,
    },
    menuWrapper: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        overflow: 'hidden',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 4,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 18,
        paddingHorizontal: 18,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    menuIconBox: {
        width: 46,
        height: 46,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuText: {
        fontSize: 16,
        fontWeight: '700',
    },
    menuSubtext: {
        fontSize: 13,
        fontWeight: '500',
        marginTop: 3,
    },
    deletingOverlay: {
        marginTop: 40,
        alignItems: 'center',
        gap: 12,
    },
    deletingText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#EF4444',
    },
});
