import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, useWindowDimensions, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    interpolate,
    FadeIn,
    SlideInRight,
    SlideOutLeft,
    Layout,
    withSpring
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';

const AnimatedCircle = ({ size, duration, startPos, color }: any) => {
    const float = useSharedValue(0);

    useEffect(() => {
        float.value = withRepeat(
            withTiming(1, { duration }),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: interpolate(float.value, [0, 1], [0, 40]) },
                { translateY: interpolate(float.value, [0, 1], [0, -40]) },
                { scale: interpolate(float.value, [0, 1], [1, 1.1]) },
            ],
            opacity: interpolate(float.value, [0, 1], [0.03, 0.1]),
        };
    });

    return (
        <Animated.View style={[
            styles.bgCircle,
            { width: size, height: size, left: startPos.x, top: startPos.y },
            animatedStyle
        ]}>
            <LinearGradient
                colors={[color, 'transparent']}
                style={{ flex: 1, borderRadius: size / 2 }}
            />
        </Animated.View>
    );
};

const FeatureItem = ({ icon, title, desc, delay = 0 }: any) => {
    return (
        <Animated.View
            entering={FadeIn.delay(delay).duration(800)}
            style={styles.featureRow}
        >
            <View style={styles.featureIconContainer}>
                <View style={styles.featureIconBg}>
                    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        {icon}
                    </Svg>
                </View>
            </View>
            <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{title}</Text>
                <Text style={styles.featureDesc}>{desc}</Text>
            </View>
        </Animated.View>
    );
};

const ONBOARDING_STEPS = [
    {
        title: "Master Your Finances",
        subtitle: "TOTAL CONTROL",
        description: "Experience the next generation of budgeting. Track, analyze, and optimize every dollar with precision.",
        illustration: (
            <Svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                <Circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.5" strokeDasharray="4 2" />
                <Path d="M12 6v6l4 2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <Path d="M12 12L8 14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
        ),
        features: [
            {
                title: "Smart Categorization",
                desc: "AI-powered transaction sorting",
                icon: <Path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            },
            {
                title: "Predictive Analytics",
                desc: "Forecast your future savings",
                icon: <><Circle cx="12" cy="12" r="10" stroke="#4F46E5" strokeWidth="1.5" /><Path d="M12 16v-4M12 8h.01" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></>
            }
        ]
    },
    {
        title: "Speak, Don't Type",
        subtitle: "VOICE POWERED",
        description: "Just say 'Spent 55 on dinner' and watch the magic happen. Real-time logging through natural speech.",
        illustration: (
            <Svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                <Path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" fill="white" />
                <Path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
        ),
        features: [
            {
                title: "Voice Recognition",
                desc: "NLP identifies intent instantly",
                icon: <Path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            },
            {
                title: "Zero Effort",
                desc: "Log expenses in under 3 seconds",
                icon: <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            }
        ]
    },
    {
        title: "Your Data, Secured",
        subtitle: "BANK-LEVEL PRIVACY",
        description: "Privacy isn't a feature, it's our foundation. End-to-end encryption for your peace of mind.",
        illustration: (
            <Svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <Path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
        ),
        features: [
            {
                title: "Vault Encryption",
                desc: "AES-256 military-grade security",
                icon: <><Circle cx="12" cy="12" r="10" stroke="#4F46E5" strokeWidth="1.5" /><Path d="M12 8v4l3 3" stroke="#4F46E5" strokeWidth="1.5" /></>
            },
            {
                title: "No Data Sharing",
                desc: "We never see your personal info",
                icon: <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#4F46E5" strokeWidth="1.5" />
            }
        ]
    }
];

export default function OnboardingScreen() {
    const { width, height } = useWindowDimensions();
    const [currentStep, setCurrentStep] = useState(0);
    const router = useRouter();

    const cardOpacity = useSharedValue(0);
    const cardScale = useSharedValue(0.92);
    const illustrationY = useSharedValue(0);

    useEffect(() => {
        cardOpacity.value = withTiming(1, { duration: 1200 });
        cardScale.value = withSpring(1);

        illustrationY.value = withRepeat(
            withTiming(-10, { duration: 2500 }),
            -1,
            true
        );
    }, []);

    const animatedCardStyle = useAnimatedStyle(() => ({
        opacity: cardOpacity.value,
        transform: [{ scale: cardScale.value }],
    }));

    const animatedIllustrationStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: illustrationY.value }],
    }));

    const handleNext = () => {
        if (currentStep < ONBOARDING_STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            router.push('/login');
        }
    };

    const step = ONBOARDING_STEPS[currentStep];

    return (
        <View style={styles.mainContainer}>
            <View style={styles.bgPattern}>
                <AnimatedCircle size={width * 0.9} duration={25000} startPos={{ x: width * 0.3, y: -100 }} color="#E0E7FF" />
                <AnimatedCircle size={width * 0.7} duration={20000} startPos={{ x: -width * 0.2, y: height * 0.6 }} color="#EEF2FF" />
                <AnimatedCircle size={width * 0.5} duration={30000} startPos={{ x: width * 0.1, y: 200 }} color="#E0E7FF" />
            </View>

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    <Animated.View style={[styles.onboardingCard, animatedCardStyle]}>
                        <View style={styles.stepIndicator}>
                            {ONBOARDING_STEPS.map((_, index) => (
                                <View key={index} style={styles.stepDotContainer}>
                                    <Animated.View
                                        layout={Layout.springify()}
                                        style={[
                                            styles.stepDot,
                                            currentStep === index && styles.activeStep
                                        ]}
                                    />
                                </View>
                            ))}
                        </View>

                        <Animated.View
                            key={`step-${currentStep}`}
                            entering={SlideInRight.duration(600).springify()}
                            exiting={SlideOutLeft.duration(600)}
                            style={styles.contentContainer}
                        >
                            <Text style={styles.subtitle}>{step.subtitle}</Text>

                            <View style={styles.illustrationWrap}>
                                <Animated.View style={[styles.illustrationContainer, animatedIllustrationStyle]}>
                                    <View style={styles.illustrationGlow} />
                                    <LinearGradient
                                        colors={['#4F46E5', '#6366F1']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.illustrationIcon}
                                    >
                                        {step.illustration}
                                    </LinearGradient>
                                </Animated.View>
                            </View>

                            <View style={styles.header}>
                                <Text style={styles.title}>{step.title}</Text>
                                <Text style={styles.description}>{step.description}</Text>
                            </View>

                            <View style={styles.featuresList}>
                                {step.features.map((f, i) => (
                                    <FeatureItem
                                        key={i}
                                        title={f.title}
                                        desc={f.desc}
                                        icon={f.icon}
                                        delay={600 + (i * 150)}
                                    />
                                ))}
                            </View>
                        </Animated.View>

                        <View style={styles.footer}>
                            <TouchableOpacity
                                activeOpacity={0.9}
                                onPress={handleNext}
                                style={styles.ctaButtonWrapper}
                            >
                                <LinearGradient
                                    colors={['#4F46E5', '#6366F1']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.ctaButton}
                                >
                                    <Text style={styles.ctaButtonText}>
                                        {currentStep === ONBOARDING_STEPS.length - 1 ? "Get Started" : "Continue"}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    bgPattern: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 0,
        overflow: 'hidden',
    },
    bgCircle: {
        position: 'absolute',
        borderRadius: 999,
    },
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 10,
        justifyContent: 'center',
    },
    onboardingCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 40,
        paddingHorizontal: 24,
        paddingVertical: 32,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.05,
        shadowRadius: 30,
        elevation: 10,
        maxHeight: '92%',
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    stepIndicator: {
        flexDirection: 'row',
        gap: 8,
        justifyContent: 'center',
        marginBottom: 20,
    },
    stepDotContainer: {
        height: 6,
        justifyContent: 'center',
    },
    stepDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#E2E8F0',
    },
    activeStep: {
        backgroundColor: '#4F46E5',
        width: 28,
    },
    contentContainer: {
        flexShrink: 1,
    },
    subtitle: {
        fontSize: 11,
        fontWeight: '800',
        color: '#4F46E5',
        textAlign: 'center',
        letterSpacing: 2,
        marginBottom: 16,
        textTransform: 'uppercase',
    },
    illustrationWrap: {
        marginBottom: 24,
        alignItems: 'center',
    },
    illustrationContainer: {
        width: 90,
        height: 90,
        position: 'relative',
    },
    illustrationGlow: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#4F46E5',
        borderRadius: 24,
        opacity: 0.1,
        transform: [{ scale: 1.2 }],
    },
    illustrationIcon: {
        flex: 1,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
    },
    header: {
        marginBottom: 28,
    },
    title: {
        fontSize: 28,
        color: '#1E293B',
        textAlign: 'center',
        fontWeight: '900',
        marginBottom: 10,
        lineHeight: 34,
        letterSpacing: -0.5,
    },
    description: {
        fontSize: 15,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 8,
        fontWeight: '500',
    },
    featuresList: {
        marginBottom: 28,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 12,
        backgroundColor: '#F8FAFC',
        padding: 12,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    featureIconContainer: {
        width: 44,
        height: 44,
    },
    featureIconBg: {
        flex: 1,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
    },
    featureContent: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 2,
    },
    featureDesc: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '500',
    },
    footer: {
        width: '100%',
        marginTop: 'auto',
    },
    ctaButtonWrapper: {
        width: '100%',
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 15,
        elevation: 6,
    },
    ctaButton: {
        paddingVertical: 16,
        borderRadius: 18,
        alignItems: 'center',
    },
    ctaButtonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
});
