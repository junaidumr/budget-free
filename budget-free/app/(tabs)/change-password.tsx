import React, { useState, useRef } from 'react';
import {
    StyleSheet, View, Text, TouchableOpacity, useWindowDimensions,
    Alert, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';

type Step = 'send' | 'verify' | 'reset';

export default function ChangePasswordScreen() {
    const { height } = useWindowDimensions();
    const router = useRouter();
    const { theme } = useTheme();
    const colors = Colors[theme];

    const [step, setStep] = useState<Step>('send');
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('user@example.com');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const otpRefs = useRef<(TextInput | null)[]>([]);

    // Step 1: Send OTP to user's email
    const handleSendOTP = async () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            Alert.alert('OTP Sent!', `A 6-digit verification code has been sent to ${email}`);
            setStep('verify');
        }, 1000);
    };

    // Handle OTP input
    const handleOtpChange = (text: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        // Auto-focus next input
        if (text && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyPress = (key: string, index: number) => {
        if (key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOTP = async () => {
        const otpCode = otp.join('');
        if (otpCode.length !== 6) {
            Alert.alert('Error', 'Please enter the full 6-digit code.');
            return;
        }

        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            Alert.alert('Verified!', 'Code verified successfully. Now set your new password.');
            setStep('reset');
        }, 1000);
    };

    // Step 3: Update password
    const handleResetPassword = async () => {
        if (newPassword.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters.');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match.');
            return;
        }

        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            Alert.alert('Success! 🎉', 'Your password has been changed successfully.', [
                { text: 'OK', onPress: () => router.back() },
            ]);
        }, 1000);
    };

    const getStepInfo = () => {
        switch (step) {
            case 'send':
                return { title: 'Change Password', subtitle: 'We\'ll send a verification code to your email', icon: 'lock.fill', num: 1 };
            case 'verify':
                return { title: 'Enter OTP Code', subtitle: `We sent a 6-digit code to ${email}`, icon: 'envelope.fill', num: 2 };
            case 'reset':
                return { title: 'New Password', subtitle: 'Create a strong, secure password', icon: 'lock.shield.fill', num: 3 };
        }
    };

    const stepInfo = getStepInfo();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <LinearGradient
                colors={['#4F46E5', '#6366F1']}
                style={[styles.headerGradient, { height: height * 0.25 }]}
            >
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.headerTop}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                            <IconSymbol name="chevron.left" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>{stepInfo.title}</Text>
                        <View style={styles.headerBtn}>
                            <IconSymbol name={stepInfo.icon as any} size={20} color="#FFFFFF" />
                        </View>
                    </View>

                    {/* Step Progress */}
                    <View style={styles.progressContainer}>
                        {[1, 2, 3].map((s) => (
                            <View key={s} style={styles.progressStep}>
                                <View style={[
                                    styles.progressDot,
                                    stepInfo.num >= s && styles.progressDotActive,
                                ]}>
                                    <Text style={[
                                        styles.progressDotText,
                                        stepInfo.num >= s && styles.progressDotTextActive,
                                    ]}>{s}</Text>
                                </View>
                                {s < 3 && (
                                    <View style={[
                                        styles.progressLine,
                                        stepInfo.num > s && styles.progressLineActive,
                                    ]} />
                                )}
                            </View>
                        ))}
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <KeyboardAvoidingView
                style={[styles.contentSection, { backgroundColor: colors.background }]}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.text }]}>
                    {/* Step Icon */}
                    <View style={styles.stepIconContainer}>
                        <LinearGradient
                            colors={['#4F46E5', '#6366F1']}
                            style={styles.stepIconGradient}
                        >
                            <IconSymbol name={stepInfo.icon as any} size={32} color="#FFFFFF" />
                        </LinearGradient>
                    </View>

                    <Text style={[styles.cardTitle, { color: colors.text }]}>{stepInfo.title}</Text>
                    <Text style={[styles.cardSubtitle, { color: colors.muted }]}>{stepInfo.subtitle}</Text>

                    {/* Step 1: Send OTP */}
                    {step === 'send' && (
                        <View style={styles.stepContent}>
                            <View style={[styles.infoBox, { backgroundColor: theme === 'dark' ? 'rgba(99, 102, 241, 0.1)' : '#EEF2FF' }]}>
                                <IconSymbol name="info.circle.fill" size={20} color="#6366F1" />
                                <Text style={[styles.infoText, { color: colors.text }]}>
                                    A 6-digit verification code will be sent to your registered email address.
                                </Text>
                            </View>

                            <TouchableOpacity
                                style={styles.primaryButton}
                                onPress={handleSendOTP}
                                disabled={loading}
                            >
                                <LinearGradient
                                    colors={['#4F46E5', '#6366F1']}
                                    style={styles.buttonGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#FFFFFF" />
                                    ) : (
                                        <Text style={styles.buttonText}>Send Verification Code</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Step 2: Enter OTP */}
                    {step === 'verify' && (
                        <View style={styles.stepContent}>
                            <View style={styles.otpContainer}>
                                {otp.map((digit, index) => (
                                    <TextInput
                                        key={index}
                                        ref={(ref) => { otpRefs.current[index] = ref; }}
                                        style={[
                                            styles.otpInput,
                                            {
                                                backgroundColor: colors.surface,
                                                color: colors.text,
                                                borderColor: digit ? '#6366F1' : colors.border,
                                            },
                                        ]}
                                        value={digit}
                                        onChangeText={(text) => handleOtpChange(text, index)}
                                        onKeyPress={({ nativeEvent }) => handleOtpKeyPress(nativeEvent.key, index)}
                                        keyboardType="number-pad"
                                        maxLength={1}
                                        textAlign="center"
                                        autoFocus={index === 0}
                                    />
                                ))}
                            </View>

                            <TouchableOpacity
                                style={styles.primaryButton}
                                onPress={handleVerifyOTP}
                                disabled={loading}
                            >
                                <LinearGradient
                                    colors={['#4F46E5', '#6366F1']}
                                    style={styles.buttonGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#FFFFFF" />
                                    ) : (
                                        <Text style={styles.buttonText}>Verify Code</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={handleSendOTP} disabled={loading}>
                                <Text style={styles.resendText}>
                                    Didn't receive the code? <Text style={styles.resendLink}>Resend</Text>
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Step 3: New Password */}
                    {step === 'reset' && (
                        <View style={styles.stepContent}>
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.text }]}>New Password</Text>
                                <View style={[styles.inputWrapper, { backgroundColor: colors.surface }]}>
                                    <IconSymbol name="lock.fill" size={18} color={colors.muted} />
                                    <TextInput
                                        style={[styles.input, { color: colors.text }]}
                                        value={newPassword}
                                        onChangeText={setNewPassword}
                                        placeholder="Enter new password"
                                        placeholderTextColor={colors.muted}
                                        secureTextEntry={!showPassword}
                                    />
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                        <IconSymbol
                                            name={showPassword ? 'eye.slash.fill' : 'eye.fill'}
                                            size={20}
                                            color={colors.muted}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.text }]}>Confirm Password</Text>
                                <View style={[styles.inputWrapper, { backgroundColor: colors.surface }]}>
                                    <IconSymbol name="lock.fill" size={18} color={colors.muted} />
                                    <TextInput
                                        style={[styles.input, { color: colors.text }]}
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        placeholder="Confirm new password"
                                        placeholderTextColor={colors.muted}
                                        secureTextEntry={!showPassword}
                                    />
                                </View>
                            </View>

                            {/* Password strength hints */}
                            <View style={styles.hintsContainer}>
                                <View style={styles.hintRow}>
                                    <IconSymbol
                                        name={newPassword.length >= 6 ? 'checkmark.circle.fill' : 'circle'}
                                        size={16}
                                        color={newPassword.length >= 6 ? '#10B981' : colors.muted}
                                    />
                                    <Text style={[styles.hintText, { color: newPassword.length >= 6 ? '#10B981' : colors.muted }]}>
                                        At least 6 characters
                                    </Text>
                                </View>
                                <View style={styles.hintRow}>
                                    <IconSymbol
                                        name={newPassword === confirmPassword && newPassword.length > 0 ? 'checkmark.circle.fill' : 'circle'}
                                        size={16}
                                        color={newPassword === confirmPassword && newPassword.length > 0 ? '#10B981' : colors.muted}
                                    />
                                    <Text style={[styles.hintText, { color: newPassword === confirmPassword && newPassword.length > 0 ? '#10B981' : colors.muted }]}>
                                        Passwords match
                                    </Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.primaryButton}
                                onPress={handleResetPassword}
                                disabled={loading}
                            >
                                <LinearGradient
                                    colors={['#4F46E5', '#6366F1']}
                                    style={styles.buttonGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#FFFFFF" />
                                    ) : (
                                        <Text style={styles.buttonText}>Change Password</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.25)',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: -0.5,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        paddingHorizontal: 40,
    },
    progressStep: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    progressDot: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressDotActive: {
        backgroundColor: '#FFFFFF',
    },
    progressDotText: {
        fontSize: 14,
        fontWeight: '800',
        color: 'rgba(255, 255, 255, 0.5)',
    },
    progressDotTextActive: {
        color: '#4F46E5',
    },
    progressLine: {
        width: 50,
        height: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        borderRadius: 2,
    },
    progressLineActive: {
        backgroundColor: '#FFFFFF',
    },
    contentSection: {
        flex: 1,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        marginTop: -40,
        paddingTop: 30,
        paddingHorizontal: 20,
    },
    card: {
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 6,
    },
    stepIconContainer: {
        marginBottom: 16,
    },
    stepIconGradient: {
        width: 68,
        height: 68,
        borderRadius: 34,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 22,
        fontWeight: '900',
        letterSpacing: -0.5,
        marginBottom: 6,
    },
    cardSubtitle: {
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    stepContent: {
        width: '100%',
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 16,
        borderRadius: 14,
        marginBottom: 24,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        fontWeight: '500',
        lineHeight: 18,
    },
    primaryButton: {
        width: '100%',
        marginTop: 8,
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 8,
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
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 24,
    },
    otpInput: {
        width: 48,
        height: 56,
        borderRadius: 14,
        borderWidth: 2,
        fontSize: 22,
        fontWeight: '800',
    },
    resendText: {
        textAlign: 'center',
        marginTop: 18,
        fontSize: 14,
        fontWeight: '500',
        color: '#94A3B8',
    },
    resendLink: {
        color: '#4F46E5',
        fontWeight: '700',
    },
    inputGroup: {
        marginBottom: 18,
        width: '100%',
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 14,
        height: 54,
        paddingHorizontal: 16,
        gap: 10,
    },
    input: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
    },
    hintsContainer: {
        gap: 8,
        marginBottom: 20,
    },
    hintRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    hintText: {
        fontSize: 13,
        fontWeight: '500',
    },
});
