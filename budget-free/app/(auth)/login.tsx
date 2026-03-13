import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, useWindowDimensions, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
    const { width, height } = useWindowDimensions();
    const router = useRouter();
    const { setUser } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    async function signInWithEmail() {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter email and password');
            return;
        }

        setLoading(true);
        try {
            // Replace with your local IP if testing on physical device
            const response = await fetch('http://localhost:5001/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setUser(data.user, data.token);
                router.replace('/(tabs)');
            } else {
                Alert.alert('Login Failed', data.error || 'Invalid credentials');
            }
        } catch (err) {
            Alert.alert('Error', 'Could not connect to backend server');
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles.mainContainer}>
            {/* Background */}
            <View style={StyleSheet.absoluteFill}>
                <View style={{ flex: 1, backgroundColor: '#FFFFFF' }} />
            </View>

            {/* Subtle Indigo Glow */}
            <View style={[styles.svgContainer, { top: -height * 0.1, right: -width * 0.2 }]}>
                <Svg height={400} width={400}>
                    <Defs>
                        <RadialGradient
                            id="grad"
                            cx="50%"
                            cy="50%"
                            rx="50%"
                            ry="50%"
                        >
                            <Stop offset="0%" stopColor="#6366F1" stopOpacity="0.08" />
                            <Stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
                        </RadialGradient>
                    </Defs>
                    <Rect x="0" y="0" width={400} height={400} fill="url(#grad)" />
                </Svg>
            </View>

            <SafeAreaView style={{ flex: 1 }}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        <Animated.View entering={FadeInDown.duration(800)} style={styles.header}>
                            <View style={styles.logoBadge}>
                                <Text style={styles.logoText}>B</Text>
                            </View>
                            <Text style={styles.welcomeText}>Welcome Back</Text>
                            <Text style={styles.subtitleText}>Manage your finances with confidence</Text>
                        </Animated.View>

                        <Animated.View entering={FadeInUp.delay(200).duration(800)} style={styles.card}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Email Address</Text>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="name@example.com"
                                        placeholderTextColor="#94A3B8"
                                        value={email}
                                        onChangeText={setEmail}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Password</Text>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Min. 8 characters"
                                        placeholderTextColor="#94A3B8"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry
                                    />
                                </View>
                            </View>

                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={styles.mainButton}
                                onPress={signInWithEmail}
                                disabled={loading}
                            >
                                <LinearGradient
                                    colors={['#4F46E5', '#6366F1']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.buttonGradient}
                                >
                                    <Text style={styles.buttonText}>{loading ? 'Signing In...' : 'Sign In'}</Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.secondaryButton}
                                onPress={() => router.push('/register')}
                                disabled={loading}
                            >
                                <View style={styles.secondaryButtonOutline}>
                                    <Text style={styles.secondaryButtonText}>Create new account</Text>
                                </View>
                            </TouchableOpacity>
                        </Animated.View>


                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    svgContainer: {
        position: 'absolute',
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingVertical: 40,
        justifyContent: 'center',
    },
    header: {
        marginBottom: 32,
        alignItems: 'center',
    },
    logoBadge: {
        width: 64,
        height: 64,
        borderRadius: 20,
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(79, 70, 229, 0.2)',
    },
    logoText: {
        fontSize: 32,
        fontWeight: '900',
        color: '#4F46E5',
    },
    welcomeText: {
        fontSize: 32,
        fontWeight: '900',
        color: '#1E293B',
        marginBottom: 8,
        letterSpacing: -1,
    },
    subtitleText: {
        fontSize: 16,
        color: '#64748B',
        fontWeight: '500',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 32,
        padding: 24,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 12,
        fontWeight: '800',
        color: '#64748B',
        marginBottom: 8,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    inputWrapper: {
        backgroundColor: '#F8FAFC',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        height: 60,
        paddingHorizontal: 20,
        justifyContent: 'center',
    },
    input: {
        color: '#1E293B',
        fontSize: 16,
        fontWeight: '600',
    },
    mainButton: {
        marginTop: 12,
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8,
    },
    buttonGradient: {
        height: 60,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    secondaryButton: {
        marginTop: 16,
    },
    secondaryButtonOutline: {
        height: 60,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#4F46E5',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
    },
    secondaryButtonText: {
        color: '#4F46E5',
        fontSize: 16,
        fontWeight: '800',
    },
    backButton: {
        marginTop: 32,
        alignItems: 'center',
    },
    backButtonText: {
        color: '#94A3B8',
        fontSize: 14,
        fontWeight: '600',
    }
});
