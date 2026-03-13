import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, useWindowDimensions, Image, TextInput, Switch, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import * as ImagePicker from 'expo-image-picker';

export default function EditProfileScreen() {
    const { height } = useWindowDimensions();
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();
    const { user, token, updateUserProfile } = useAuth();
    const colors = Colors[theme];

    // Data State
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [fullName, setFullName] = useState(user?.full_name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [email, setEmail] = useState(user?.email || '');
    const [userId, setUserId] = useState(user?.id.toString().padStart(8, '0') || '00000000');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatar_url ? `http://localhost:5001${user.avatar_url}` : null);
    const [coverUrl, setCoverUrl] = useState<string | null>(user?.cover_url ? `http://localhost:5001${user.cover_url}` : null);
    const [pushEnabled, setPushEnabled] = useState(true);

    const fetchData = useCallback(async () => {
        // Mocked fetching
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            uploadAvatar(result.assets[0].uri);
        }
    };

    const uploadAvatar = async (uri: string) => {
        setUpdating(true);
        try {
            const formData = new FormData();
            // @ts-ignore
            formData.append('avatar', {
                uri,
                name: 'avatar.jpg',
                type: 'image/jpeg',
            });

            const response = await fetch('http://localhost:5001/api/upload-avatar', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                setAvatarUrl(`http://localhost:5001${data.avatar_url}`);
                if (user) {
                    await updateUserProfile({ ...user, avatar_url: data.avatar_url });
                }
                Alert.alert('Success', 'Avatar updated successfully!');
            } else {
                Alert.alert('Error', data.error || 'Failed to upload image');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'An error occurred during upload');
        } finally {
            setUpdating(false);
        }
    };

    const pickCover = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.7,
        });

        if (!result.canceled) {
            uploadCover(result.assets[0].uri);
        }
    };

    const uploadCover = async (uri: string) => {
        setUpdating(true);
        try {
            const formData = new FormData();
            // @ts-ignore
            formData.append('cover', {
                uri,
                name: 'cover.jpg',
                type: 'image/jpeg',
            });

            const response = await fetch('http://localhost:5001/api/upload-cover', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                setCoverUrl(`http://localhost:5001${data.cover_url}`);
                if (user) {
                    await updateUserProfile({ ...user, cover_url: data.cover_url });
                }
                Alert.alert('Success', 'Cover updated successfully!');
            } else {
                Alert.alert('Error', data.error || 'Failed to upload cover');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'An error occurred during upload');
        } finally {
            setUpdating(false);
        }
    };

    const handleUpdate = async () => {
        if (!fullName) {
            Alert.alert('Error', 'Full Name is required');
            return;
        }

        setUpdating(true);
        try {
            const nameParts = fullName.trim().split(' ');
            const first_name = nameParts[0];
            const last_name = nameParts.slice(1).join(' ');

            const response = await fetch('http://localhost:5001/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    first_name,
                    last_name,
                    phone,
                    email
                })
            });

            const data = await response.json();

            if (response.ok) {
                await updateUserProfile(data.user);
                Alert.alert('Success', 'Profile updated successfully!');
                router.back();
            } else {
                Alert.alert('Error', data.error || 'Failed to update profile');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'An error occurred while updating profile');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

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
                <TouchableOpacity
                    style={styles.coverCameraButton}
                    onPress={pickCover}
                    activeOpacity={0.8}
                >
                    <IconSymbol name="camera.fill" size={18} color="#FFFFFF" />
                    <Text style={styles.coverButtonText}>Change Cover</Text>
                </TouchableOpacity>
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.headerTop}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                            <IconSymbol name="chevron.left" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Edit My Profile</Text>
                        <TouchableOpacity style={styles.headerBtn}>
                            <IconSymbol name="bell.fill" size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <View style={[styles.contentSection, { backgroundColor: colors.background }]}>
                <View style={styles.profileInfoContainer}>
                    <TouchableOpacity style={styles.avatarWrapper} activeOpacity={0.8} onPress={pickImage}>
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

                    <Text style={[styles.userNameText, { color: colors.text }]}>{fullName || 'Budget User'}</Text>
                    <Text style={styles.userIdText}>ID: {userId}</Text>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Account Settings</Text>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.text }]}>Username</Text>
                        <View style={[styles.inputWrapper, { backgroundColor: colors.surface }]}>
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                value={fullName}
                                onChangeText={setFullName}
                                placeholder="Edit your name"
                                placeholderTextColor={colors.muted}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.text }]}>Phone</Text>
                        <View style={[styles.inputWrapper, { backgroundColor: colors.surface }]}>
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                value={phone}
                                onChangeText={setPhone}
                                placeholder="+44 555 5555 55"
                                placeholderTextColor={colors.muted}
                                keyboardType="phone-pad"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.text }]}>Email Address</Text>
                        <View style={[styles.inputWrapper, { backgroundColor: colors.surface }]}>
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="example@mail.com"
                                placeholderTextColor={colors.muted}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    <View style={styles.toggleRow}>
                        <Text style={[styles.toggleText, { color: colors.text }]}>Push Notifications</Text>
                        <Switch
                            value={pushEnabled}
                            onValueChange={setPushEnabled}
                            trackColor={{ false: '#E2E8F0', true: '#10B981' }}
                            thumbColor="#FFFFFF"
                        />
                    </View>

                    <View style={styles.toggleRow}>
                        <Text style={[styles.toggleText, { color: colors.text }]}>Turn Dark Theme</Text>
                        <Switch
                            value={theme === 'dark'}
                            onValueChange={toggleTheme}
                            trackColor={{ false: '#E2E8F0', true: '#10B981' }}
                            thumbColor="#FFFFFF"
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.updateButton}
                        onPress={handleUpdate}
                        disabled={updating}
                    >
                        <LinearGradient
                            colors={['#4F46E5', '#6366F1']}
                            style={styles.buttonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            {updating ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.buttonText}>Update Profile</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
        marginBottom: 20,
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
        borderColor: '#FFFFFF',
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
    },
    userNameText: {
        marginTop: 15,
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
    scrollContent: {
        paddingHorizontal: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#1E293B',
        marginBottom: 20,
        marginTop: 10,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 10,
    },
    inputWrapper: {
        backgroundColor: '#ECFDF5', // Light green hint as per mockup
        borderRadius: 12,
        height: 54,
        paddingHorizontal: 16,
        justifyContent: 'center',
    },
    disabledInput: {
        opacity: 0.8,
    },
    input: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
    },
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    toggleText: {
        fontSize: 15,
        fontWeight: '800',
        color: '#1E293B',
    },
    updateButton: {
        marginTop: 30,
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 10,
    },
    buttonGradient: {
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '900',
    },
    coverCameraButton: {
        position: 'absolute',
        right: 20,
        bottom: 60,
        backgroundColor: 'rgba(30, 41, 59, 0.6)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        zIndex: 10,
    },
    coverButtonText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
        marginLeft: 6,
    },
});
