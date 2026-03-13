import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, G } from 'react-native-svg';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/context/AuthContext';

const getCurrencySymbol = (currency: string) => {
    switch (currency) {
        case 'PKR': return 'Rs';
        case 'INR': return '₹';
        case 'EUR': return '€';
        case 'GBP': return '£';
        default: return '$';
    }
};

const TransactionItem = ({ icon, title, subtitle, category, amount, isNegative, delay }: any) => {
    const { theme } = useTheme();
    const colors = Colors[theme];

    return (
        <Animated.View entering={FadeInUp.delay(delay).duration(600)} style={[styles.transactionItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.transactionLeft}>
                <View style={[styles.transactionIconContainer, { backgroundColor: isNegative ? 'rgba(239, 68, 68, 0.1)' : `${colors.tint}15` }]}>
                    <IconSymbol name={icon} size={22} color={isNegative ? '#EF4444' : colors.tint} />
                </View>
                <View style={styles.transactionInfo}>
                    <Text style={[styles.transactionTitle, { color: colors.text }]} numberOfLines={1}>{title}</Text>
                    <Text style={[styles.transactionSubtitle, { color: colors.muted }]}>{subtitle}</Text>
                </View>
            </View>

            <View style={styles.transactionMiddle}>
                <Text style={[styles.transactionCategory, { color: colors.tint, backgroundColor: `${colors.tint}15` }]} numberOfLines={1}>{category}</Text>
            </View>

            <View style={styles.transactionRight}>
                <Text style={[styles.transactionAmount, { color: colors.tint }, isNegative && styles.negativeAmount]}>
                    {isNegative ? '-' : '+'}{amount}
                </Text>
            </View>
        </Animated.View>
    );
};

export default function DashboardScreen() {
    const { height } = useWindowDimensions();
    const [selectedTab, setSelectedTab] = useState('Monthly');
    const { theme } = useTheme();
    const colors = Colors[theme];
    const { user, token } = useAuth();

    // Real-time data state (Mocked)
    const [userName, setUserName] = useState('Elite User');
    const [balance, setBalance] = useState('0.00');
    const [income, setIncome] = useState('0.00');
    const [expense, setExpense] = useState('0.00');
    const [displayCurrency, setDisplayCurrency] = useState('USD');
    const [transactions, setTransactions] = useState<any[]>([
        { id: '1', title: 'Apple Store', subtitle: 'Mar 04, 2026', category: 'Shopping', amount: '999.00', is_negative: true, icon: 'bag.fill' },
        { id: '2', title: 'Salary', subtitle: 'Mar 01, 2026', category: 'Income', amount: '5,000.00', is_negative: false, icon: 'banknote.fill' },
        { id: '3', title: 'Starbucks', subtitle: 'Feb 28, 2026', category: 'Food', amount: '12.50', is_negative: true, icon: 'fork.knife' },
    ]);
    const [savingsProgress, setSavingsProgress] = useState(0.75);
    const [revenueLastWeek, setRevenueLastWeek] = useState('4,200.00');
    const [foodLastWeek, setFoodLastWeek] = useState('150.00');
    const [loading, setLoading] = useState(false);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    };

    const fetchDashboardData = useCallback(async () => {
        if (!token) return;

        setLoading(true);
        try {
            const response = await fetch('http://localhost:5001/api/summary', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (response.ok) {
                setBalance(data.balance);
                setIncome(data.income);
                setExpense(data.expense);
                setSavingsProgress(data.progress);
                setTransactions(data.recentTransactions);
            }

            // Fetch currency from most recent transaction
            const txRes = await fetch('http://localhost:5001/api/transactions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const txData = await txRes.json();
            if (txRes.ok && txData.length > 0 && txData[0].currency) {
                setDisplayCurrency(txData[0].currency);
            }
        } catch (err) {
            console.error('Failed to fetch summary:', err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    // Refresh data when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchDashboardData();
        }, [fetchDashboardData])
    );

    useEffect(() => {
        // Real-time updates disabled
        return () => { };
    }, [fetchDashboardData]);

    return (
        <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
            {/* Top Indigo Section (Accent) */}
            <View style={[styles.headerSection, { height: height * 0.40 }]}>
                <LinearGradient
                    colors={['#4F46E5', '#6366F1']}
                    style={StyleSheet.absoluteFill}
                />

                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.topNav}>
                        <View style={styles.greetingContainer}>
                            <Text style={styles.welcomeText}>Hi, {user?.full_name || 'Elite User'}</Text>
                            <Text style={styles.greetingText}>Good Morning</Text>
                        </View>
                        <TouchableOpacity style={[styles.notificationBtn, { backgroundColor: colors.card }]}>
                            <IconSymbol name="bell.fill" size={20} color={colors.tint} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.summaryContainer}>
                        <View style={styles.summaryItem}>
                            <View style={styles.summaryLabelRow}>
                                <IconSymbol name="plus.square.fill" size={12} color="#FFFFFF" />
                                <Text style={styles.summaryLabel}>Total Balance</Text>
                            </View>
                            <Text style={styles.summaryValue} numberOfLines={1} adjustsFontSizeToFit>{getCurrencySymbol(displayCurrency)}{balance}</Text>
                        </View>

                        <View style={styles.summaryDivider} />

                        <View style={styles.summaryItem}>
                            <View style={styles.summaryLabelRow}>
                                <IconSymbol name="minus.square.fill" size={12} color="#FFFFFF" />
                                <Text style={styles.summaryLabel}>Total Expense</Text>
                            </View>
                            <Text style={styles.summaryValueExpense} numberOfLines={1} adjustsFontSizeToFit>-{getCurrencySymbol(displayCurrency)}{expense}</Text>
                        </View>
                    </View>

                    <View style={styles.progressSection}>
                        <View style={styles.progressBarWrapper}>
                            <View style={styles.progressBackground}>
                                <View style={[styles.progressFill, { width: `${savingsProgress * 100}%` }]} />
                                <Text style={styles.progressText}>{Math.round(savingsProgress * 100)}%</Text>
                            </View>
                            <Text style={styles.limitText}>{getCurrencySymbol(displayCurrency)}20,000.00</Text>
                        </View>
                        <View style={styles.progressLabelContainer}>
                            <IconSymbol name="checkmark.circle.fill" size={14} color="#FFFFFF" />
                            <Text style={styles.progressLabelText}>Looks Good. Keep growing.</Text>
                        </View>
                    </View>
                </SafeAreaView>
            </View>

            {/* Bottom Content Section (Dynamic Background Focus) */}
            <Animated.View entering={FadeInUp.duration(800)} style={[styles.contentSection, { backgroundColor: colors.background }]}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Savings & Revenue Card */}
                    <View style={styles.highlightsCard}>
                        <View style={styles.savingsContainer}>
                            <View style={styles.circularProgressContainer}>
                                <Svg width={70} height={70} viewBox="0 0 80 80">
                                    <Circle
                                        cx="40"
                                        cy="40"
                                        r="35"
                                        stroke="rgba(255, 255, 255, 0.2)"
                                        strokeWidth="6"
                                        fill="none"
                                    />
                                    <Circle
                                        cx="40"
                                        cy="40"
                                        r="35"
                                        stroke="#FFFFFF"
                                        strokeWidth="6"
                                        fill="none"
                                        strokeDasharray={`${2 * Math.PI * 35}`}
                                        strokeDashoffset={`${2 * Math.PI * 35 * (1 - savingsProgress)}`}
                                        strokeLinecap="round"
                                        transform="rotate(-90 40 40)"
                                    />
                                    <G transform="translate(26, 26)">
                                        <IconSymbol name="car.fill" size={28} color="#FFFFFF" />
                                    </G>
                                </Svg>
                                <Text style={styles.savingsLabel}>Savings{"\n"}On Goals</Text>
                            </View>
                        </View>

                        <View style={styles.highlightsDivider} />

                        <View style={styles.highlightsRight}>
                            <View style={styles.highlightRow}>
                                <View style={styles.highlightIconBg}>
                                    <IconSymbol name="banknote.fill" size={16} color="#4F46E5" />
                                </View>
                                <View style={styles.highlightTextContainer}>
                                    <Text style={styles.highlightLabel}>Total Income</Text>
                                    <Text style={styles.highlightValue}>{getCurrencySymbol(displayCurrency)}{income}</Text>
                                </View>
                            </View>

                            <View style={styles.horizontalDivider} />

                            <View style={styles.highlightRow}>
                                <View style={styles.highlightIconBg}>
                                    <IconSymbol name="fork.knife" size={16} color="#EF4444" />
                                </View>
                                <View style={styles.highlightTextContainer}>
                                    <Text style={styles.highlightLabel}>Food Last Week</Text>
                                    <Text style={styles.highlightValueFood}>-{getCurrencySymbol(displayCurrency)}{foodLastWeek}</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Tab Switcher */}
                    <View style={[styles.tabContainer, { backgroundColor: colors.surface }]}>
                        {['Daily', 'Weekly', 'Monthly'].map((tab) => (
                            <TouchableOpacity
                                key={tab}
                                style={[
                                    styles.tab,
                                    selectedTab === tab && styles.activeTab,
                                    selectedTab === tab && { backgroundColor: colors.tint }
                                ]}
                                onPress={() => setSelectedTab(tab)}
                            >
                                <Text style={[
                                    styles.tabText,
                                    { color: colors.muted },
                                    selectedTab === tab && styles.activeTabText
                                ]}>
                                    {tab}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Transactions List */}
                    <View style={styles.transactionsList}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Transactions</Text>
                        {transactions.length > 0 ? (
                            transactions.map((item, index) => (
                                <TransactionItem
                                    key={item.id}
                                    icon={item.icon || 'banknote.fill'}
                                    title={item.title}
                                    subtitle={item.subtitle}
                                    category={item.category}
                                    amount={formatCurrency(item.amount)}
                                    isNegative={item.is_negative}
                                    delay={400 + (index * 100)}
                                />
                            ))
                        ) : (
                            !loading && (
                                <View style={styles.emptyContainer}>
                                    <Text style={styles.emptyText}>No transactions found</Text>
                                </View>
                            )
                        )}
                    </View>

                    <View style={{ height: 120 }} />
                </ScrollView>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    headerSection: {
        width: '100%',
    },
    safeArea: {
        flex: 1,
        paddingHorizontal: 20,
    },
    topNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
    },
    greetingContainer: {
        flex: 1,
    },
    welcomeText: {
        fontSize: 22,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: -0.8,
    },
    greetingText: {
        fontSize: 13,
        color: '#FFFFFF',
        opacity: 0.8,
        fontWeight: '600',
    },
    notificationBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    summaryContainer: {
        flexDirection: 'row',
        marginTop: 28,
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        padding: 16,
        borderRadius: 24,
    },
    summaryItem: {
        flex: 1,
    },
    summaryLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    summaryLabel: {
        fontSize: 10,
        color: '#FFFFFF',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        opacity: 0.9,
    },
    summaryValue: {
        fontSize: 24,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: -0.5,
    },
    summaryDivider: {
        width: 1,
        height: 36,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        marginHorizontal: 12,
    },
    summaryValueExpense: {
        fontSize: 24,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: -0.5,
    },
    progressSection: {
        marginTop: 20,
    },
    progressBarWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    progressBackground: {
        flex: 1,
        height: 36,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 18,
        overflow: 'hidden',
        position: 'relative',
        justifyContent: 'center',
    },
    progressFill: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
    },
    progressText: {
        paddingLeft: 14,
        fontSize: 12,
        fontWeight: '900',
        color: '#4F46E5',
        zIndex: 1,
    },
    limitText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#FFFFFF',
        opacity: 0.9,
    },
    progressLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 10,
    },
    progressLabelText: {
        fontSize: 13,
        color: '#FFFFFF',
        fontWeight: '700',
        opacity: 0.9,
    },
    contentSection: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        marginTop: -40,
    },
    scrollContent: {
        paddingTop: 24,
        paddingHorizontal: 20,
    },
    highlightsCard: {
        backgroundColor: '#4F46E5',
        borderRadius: 28,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 8,
    },
    savingsContainer: {
        flex: 0.35,
        alignItems: 'center',
    },
    circularProgressContainer: {
        alignItems: 'center',
    },
    savingsLabel: {
        textAlign: 'center',
        fontSize: 11,
        fontWeight: '800',
        color: '#FFFFFF',
        marginTop: 6,
        lineHeight: 14,
    },
    highlightsDivider: {
        width: 1,
        height: '70%',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        marginHorizontal: 12,
    },
    highlightsRight: {
        flex: 0.65,
        gap: 10,
    },
    highlightRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    highlightIconBg: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    highlightTextContainer: {
        flex: 1,
    },
    highlightLabel: {
        fontSize: 10,
        color: '#FFFFFF',
        fontWeight: '700',
        opacity: 0.8,
    },
    highlightValue: {
        fontSize: 15,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    highlightValueFood: {
        fontSize: 15,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    horizontalDivider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        width: '100%',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#F1F5F9',
        borderRadius: 24,
        padding: 5,
        marginTop: 24,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 20,
    },
    activeTab: {
        backgroundColor: '#4F46E5',
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#64748B',
    },
    activeTabText: {
        color: '#FFFFFF',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#1E293B',
        marginBottom: 16,
        letterSpacing: -0.5,
    },
    transactionsList: {
        marginTop: 28,
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 14,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        marginBottom: 12,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    transactionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1.2,
    },
    transactionIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    transactionInfo: {
        flex: 1,
    },
    transactionTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: '#1E293B',
    },
    transactionSubtitle: {
        fontSize: 11,
        color: '#64748B',
        fontWeight: '600',
        marginTop: 2,
    },
    transactionMiddle: {
        flex: 0.7,
        alignItems: 'center',
    },
    transactionCategory: {
        fontSize: 12,
        color: '#4F46E5',
        fontWeight: '700',
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    transactionRight: {
        flex: 0.8,
        alignItems: 'flex-end',
    },
    transactionAmount: {
        fontSize: 15,
        fontWeight: '900',
        color: '#4F46E5',
    },
    negativeAmount: {
        color: '#EF4444',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#94A3B8',
        fontWeight: '600',
    },
});