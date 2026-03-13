import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, useWindowDimensions, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';

export default function VerifyScreen() {
    const { width, height } = useWindowDimensions();
    const router = useRouter();
    const { email } = useLocalSearchParams<{ email: string }>();
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleVerify() {
        if (token.length < 6) {
            Alert.alert('Error', 'Please enter the 6-digit code');
            return;
        }

        setLoading(true);
        // Simulate verification success
        setTimeout(() => {
            setLoading(false);
            Alert.alert('Success', 'Email verified successfully!', [
                { text: 'OK', onPress: () => router.replace('/(tabs)') }
            ]);
        }, 1000);
    }

    return (
        <View style={styles.mainContainer}>
            {/* Background Gradient */}
            <LinearGradient
                colors={['#0F172A', '#020617']}
                style={StyleSheet.absoluteFill}
            />

            {/* Premium Glow Effect using SVG */}
            <View style={[styles.svgContainer, { top: -height * 0.2 }]}>
                <Svg height={height} width={width}>
                    <Defs>
                        <RadialGradient
                            id="grad"
                            cx="50%"
                            cy="50%"
                            rx="50%"
                            ry="50%"
                            fx="50%"
                            fy="50%"
                        >
                            <Stop offset="0%" stopColor="#10B981" stopOpacity="0.15" />
                            <Stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                        </RadialGradient>
                    </Defs>
                    <Rect x="0" y="0" width={width} height={height} fill="url(#grad)" />
                </Svg>
            </View>

            <SafeAreaView style={{ flex: 1 }}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.container}
                >
                    <Animated.View entering={FadeInDown.duration(800)} style={styles.header}>
                        <View style={styles.iconContainer}>
                            <Text style={styles.iconText}>✉️</Text>
                        </View>
                        <Text style={styles.welcomeText}>Verify Email</Text>
                        <Text style={styles.subtitleText}>
                            Enter the code sent to{'\n'}
                            <Text style={styles.emailText}>{email}</Text>
                        </Text>
                    </Animated.View>

                    <Animated.View entering={FadeInUp.delay(200).duration(800)} style={styles.card}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Verification Code</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="000000"
                                    placeholderTextColor="rgba(255, 255, 255, 0.2)"
                                    value={token}
                                    onChangeText={(val) => setToken(val.replace(/[^0-9]/g, '').slice(0, 6))}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                    autoFocus
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={styles.mainButton}
                            onPress={handleVerify}
                            disabled={loading}
                        >
                            <LinearGradient
                                colors={['#10B981', '#059669']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.buttonGradient}
                            >
                                <Text style={styles.buttonText}>{loading ? 'Verifying...' : 'Verify & Continue'}</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.resendButton}>
                            <Text style={styles.resendText}>
                                Didn't receive code? <Text style={styles.resendAction}>Resend</Text>
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>

                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.backText}>← Change Email</Text>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    svgContainer: {
        ...StyleSheet.absoluteFillObject,
    },
    container: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
    },
    header: {
        marginBottom: 40,
        alignItems: 'center',
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    iconText: {
        fontSize: 32,
    },
    welcomeText: {
        fontSize: 32,
        fontWeight: '900',
        color: '#FFFFFF',
        marginBottom: 12,
        letterSpacing: -1,
    },
    subtitleText: {
        fontSize: 16,
        color: '#94A3B8',
        textAlign: 'center',
        lineHeight: 24,
        fontWeight: '500',
    },
    emailText: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 32,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(20px)', // Note: Only works on web, but adds a nice touch
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: '#94A3B8',
        marginBottom: 12,
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    inputWrapper: {
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        color: '#FFFFFF',
        fontSize: 40,
        fontWeight: '800',
        letterSpacing: 12,
        textAlign: 'center',
        width: '100%',
    },
    mainButton: {
        shadowColor: '#10B981',
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
    resendButton: {
        marginTop: 24,
        alignItems: 'center',
    },
    resendText: {
        color: '#64748B',
        fontSize: 14,
        fontWeight: '600',
    },
    resendAction: {
        color: '#10B981',
        fontWeight: '700',
    },
    backButton: {
        marginTop: 32,
        alignItems: 'center',
    },
    backText: {
        color: '#64748B',
        fontSize: 15,
        fontWeight: '600',
    }
});
