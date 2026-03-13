import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useFocusEffect } from 'expo-router';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, useWindowDimensions, Dimensions, TextInput, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp, FadeInRight, FadeIn, SlideInDown } from 'react-native-reanimated';
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TargetItem = ({ title, current, target, icon, color, currency = 'USD' }: any) => {
    const progress = Math.min(current / target, 1);

    return (
        <View style={styles.targetItem}>
            <View style={[styles.targetIconBox, { backgroundColor: `${color}15` }]}>
                <IconSymbol name={icon} size={20} color={color} />
            </View>
            <View style={styles.targetInfo}>
                <View style={styles.targetHeader}>
                    <Text style={styles.targetTitle}>{title}</Text>
                    <Text style={styles.targetAmount}>
                        {getCurrencySymbol(currency)}{current.toLocaleString()} / <Text style={styles.targetTotal}>{getCurrencySymbol(currency)}{target.toLocaleString()}</Text>
                    </Text>
                </View>
                <View style={styles.targetProgressBg}>
                    <View style={[styles.targetProgressFill, { width: `${progress * 100}%`, backgroundColor: color }]} />
                </View>
            </View>
        </View>
    );
};

const BarChart = ({ data }: { data: any[] }) => {
    // Determine max value for scaling, fallback to 1000 to avoid division by zero or empty scales
    const maxVal = Math.max(...data.flatMap(d => [d.income, d.expense]), 1000);
    const chartHeight = 180;

    return (
        <View style={styles.chartWrapper}>
            <View style={styles.yAxis}>
                {[15, 10, 5, 1].map((label) => (
                    <Text key={label} style={styles.yAxisLabel}>{label}k</Text>
                ))}
            </View>
            <View style={styles.chartContainer}>
                {/* Grid Lines */}
                {[0, 1, 2, 3].map((i) => (
                    <View key={i} style={[styles.gridLine, { top: (chartHeight / 4) * i }]} />
                ))}

                <View style={styles.barsContainer}>
                    {data.map((item, index) => (
                        <View key={index} style={styles.barGroup}>
                            <View style={styles.barsRow}>
                                {/* Income Bar */}
                                <View
                                    style={[
                                        styles.bar,
                                        { height: (item.income / maxVal) * chartHeight, backgroundColor: '#4F46E5' }
                                    ]}
                                />
                                {/* Expense Bar */}
                                <View
                                    style={[
                                        styles.bar,
                                        { height: (item.expense / maxVal) * chartHeight, backgroundColor: '#6366F1', opacity: 0.6 }
                                    ]}
                                />
                            </View>
                            <Text style={styles.xAxisLabel}>{item.day}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
};


export default function AnalysisScreen() {
    const { height } = useWindowDimensions();
    const [selectedTab, setSelectedTab] = useState('Weekly');
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const { token } = useAuth();

    // Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [reportType, setReportType] = useState<'Income' | 'Expense'>('Expense');

    // Real-time data state
    const [balance, setBalance] = useState('0.00');
    const [expense, setExpense] = useState('0.00');
    const [totalIncome, setTotalIncome] = useState('0.00');
    const [displayCurrency, setDisplayCurrency] = useState('USD');
    const [savingsProgress, setSavingsProgress] = useState(0.0);
    const [chartData, setChartData] = useState([
        { day: 'Mon', income: 0, expense: 0 },
        { day: 'Tue', income: 0, expense: 0 },
        { day: 'Wed', income: 0, expense: 0 },
        { day: 'Thu', income: 0, expense: 0 },
        { day: 'Fri', income: 0, expense: 0 },
        { day: 'Sat', income: 0, expense: 0 },
        { day: 'Sun', income: 0, expense: 0 },
    ]);
    const [targets, setTargets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    };

    const fetchAnalysisData = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            // Fetch Summary for balance/expense/income/progress
            const summaryRes = await fetch('http://localhost:5001/api/summary', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const summaryData = await summaryRes.json();
            if (summaryRes.ok) {
                setBalance(summaryData.balance);
                setExpense(summaryData.expense);
                setTotalIncome(summaryData.income);
                setSavingsProgress(summaryData.progress);
                if (summaryData.dailyData) {
                    setChartData(summaryData.dailyData);
                }
            }

            // Fetch Targets
            const targetsRes = await fetch('http://localhost:5001/api/targets', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const targetsData = await targetsRes.json();
            if (targetsRes.ok) {
                setTargets(targetsData);
            }

            // Daily data is now provided by the backend summary API

            // Fetch most recent transaction to determine display currency
            const txRes = await fetch('http://localhost:5001/api/transactions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const txData = await txRes.json();
            if (txRes.ok && txData.length > 0 && txData[0].currency) {
                setDisplayCurrency(txData[0].currency);
            }

        } catch (err) {
            console.error('Failed to fetch analysis data:', err);
        } finally {
            setLoading(false);
        }
    }, [token, searchQuery, selectedCategory, reportType]);

    useFocusEffect(
        useCallback(() => {
            fetchAnalysisData();
        }, [fetchAnalysisData])
    );

    const categories = ['Shopping', 'Food', 'Transport', 'Utilities', 'Entertainment', 'Salary'];

    return (
        <View style={styles.mainContainer}>
            {/* Indigo Header Section */}
            <View style={[styles.headerSection, { height: height * 0.38 }]}>
                <LinearGradient
                    colors={['#4F46E5', '#6366F1']}
                    style={StyleSheet.absoluteFill}
                />

                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.topNav}>
                        <TouchableOpacity onPress={() => { }}>
                            <IconSymbol name="chevron.left" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Analysis</Text>
                        <TouchableOpacity style={styles.notificationBtn}>
                            <IconSymbol name="bell.fill" size={20} color="#4F46E5" />
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
                                <Text style={styles.summaryLabel}>Expense</Text>
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
                    </View>
                </SafeAreaView>
            </View>

            {/* Content Section */}
            <View style={styles.contentSection}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.tabContainer}>
                        {['Daily', 'Weekly', 'Monthly', 'Year'].map((tab) => (
                            <TouchableOpacity
                                key={tab}
                                style={[styles.tab, selectedTab === tab && styles.activeTab]}
                                onPress={() => setSelectedTab(tab)}
                            >
                                <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>
                                    {tab}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.chartCard}>
                        <View style={styles.chartHeader}>
                            <Text style={styles.chartTitle}>Income & Expenses</Text>
                            <View style={styles.chartActions}>
                                <TouchableOpacity
                                    style={styles.actionBtn}
                                    onPress={() => setIsSearchVisible(true)}
                                >
                                    <IconSymbol name="magnifyingglass" size={18} color="#4F46E5" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.actionBtn}
                                    onPress={() => setIsSearchVisible(true)}
                                >
                                    <IconSymbol name="calendar" size={18} color="#4F46E5" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <BarChart data={chartData} />

                        <View style={styles.detailsRow}>
                            <View style={styles.detailItem}>
                                <View style={[styles.iconBox, { backgroundColor: '#EEF2FF' }]}>
                                    <IconSymbol name="arrow.up.right" size={18} color="#4F46E5" />
                                </View>
                                <View>
                                    <Text style={styles.detailLabel}>Income</Text>
                                    <Text style={styles.detailValue}>{getCurrencySymbol(displayCurrency)}{totalIncome}</Text>
                                </View>
                            </View>

                            <View style={styles.detailItem}>
                                <View style={[styles.iconBox, { backgroundColor: '#FFF1F2' }]}>
                                    <IconSymbol name="arrow.down.left" size={18} color="#EF4444" />
                                </View>
                                <View>
                                    <Text style={styles.detailLabel}>Expense</Text>
                                    <Text style={styles.detailValueExpense}>{getCurrencySymbol(displayCurrency)}{expense}</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>My Targets</Text>
                    <View style={styles.targetsList}>
                        {targets.map((target) => (
                            <TargetItem
                                key={target.id}
                                title={target.title}
                                current={target.current}
                                target={target.target}
                                icon={target.icon}
                                color={target.color}
                                currency={displayCurrency}
                            />
                        ))}
                    </View>
                    <View style={{ height: 120 }} />
                </ScrollView>
            </View>

            {/* Search & Filter Modal */}
            <Modal
                visible={isSearchVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setIsSearchVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.searchModal}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={() => setIsSearchVisible(false)}>
                                <IconSymbol name="chevron.left" size={24} color="#1E293B" />
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>Search & Filter</Text>
                            <TouchableOpacity onPress={() => {
                                setSearchQuery('');
                                setSelectedCategory(null);
                                setReportType('Expense');
                                setIsSearchVisible(false);
                            }}>
                                <Text style={styles.clearAllText}>Clear</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.searchBoxWrapper}>
                            <View style={styles.searchInputContainer}>
                                <IconSymbol name="magnifyingglass" size={18} color="#94A3B8" />
                                <TextInput
                                    placeholder="Search transactions..."
                                    style={styles.searchInput}
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    placeholderTextColor="#94A3B8"
                                />
                            </View>
                        </View>

                        <ScrollView style={styles.filterContent} showsVerticalScrollIndicator={false}>
                            <Text style={styles.filterLabel}>Categories</Text>
                            <View style={styles.categoryGrid}>
                                {categories.map((cat) => (
                                    <TouchableOpacity
                                        key={cat}
                                        style={[
                                            styles.categoryChip,
                                            selectedCategory === cat && styles.activeCategoryChip
                                        ]}
                                        onPress={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                                    >
                                        <Text style={[
                                            styles.categoryChipText,
                                            selectedCategory === cat && styles.activeCategoryText
                                        ]}>{cat}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.filterLabel}>Report Type</Text>
                            <View style={styles.reportTypeContainer}>
                                {['Income', 'Expense'].map((type) => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[
                                            styles.reportToggle,
                                            reportType === type && styles.activeReportToggle
                                        ]}
                                        onPress={() => setReportType(type as any)}
                                    >
                                        <View style={[
                                            styles.radioOuter,
                                            reportType === type && styles.activeRadioOuter
                                        ]}>
                                            {reportType === type && <View style={styles.radioInner} />}
                                        </View>
                                        <Text style={[
                                            styles.reportToggleText,
                                            reportType === type && styles.activeReportToggleText
                                        ]}>{type}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TouchableOpacity
                                style={[styles.searchBtn, { marginTop: 40 }]}
                                onPress={() => setIsSearchVisible(false)}
                            >
                                <LinearGradient
                                    colors={['#4F46E5', '#6366F1']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.btnGradient}
                                >
                                    <Text style={styles.searchBtnText}>Apply Filter</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
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
    headerTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: -0.5,
    },
    notificationBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
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
        fontSize: 22,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    summaryDivider: {
        width: 1,
        height: 36,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        marginHorizontal: 12,
    },
    summaryValueExpense: {
        fontSize: 22,
        fontWeight: '900',
        color: '#FFFFFF',
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
        fontWeight: '700',
        color: '#FFFFFF',
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
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#F1F5F9',
        borderRadius: 24,
        padding: 5,
        marginBottom: 24,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 20,
    },
    activeTab: {
        backgroundColor: '#4F46E5',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#64748B',
    },
    activeTabText: {
        color: '#FFFFFF',
    },
    chartCard: {
        backgroundColor: '#F8FAFC',
        borderRadius: 32,
        padding: 24,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    chartHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1E293B',
    },
    chartActions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionBtn: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    chartWrapper: {
        flexDirection: 'row',
        height: 200,
        marginBottom: 24,
    },
    yAxis: {
        justifyContent: 'space-between',
        paddingRight: 10,
        height: 180,
    },
    yAxisLabel: {
        fontSize: 10,
        color: '#94A3B8',
        fontWeight: '700',
    },
    chartContainer: {
        flex: 1,
        height: 180,
        position: 'relative',
    },
    gridLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: '#F1F5F9',
        borderStyle: 'dashed',
    },
    barsContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        paddingHorizontal: 5,
    },
    barGroup: {
        alignItems: 'center',
        flex: 1,
    },
    barsRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 2,
    },
    bar: {
        width: 6,
        borderRadius: 3,
    },
    xAxisLabel: {
        marginTop: 12,
        fontSize: 10,
        fontWeight: '700',
        color: '#94A3B8',
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748B',
    },
    detailValue: {
        fontSize: 16,
        fontWeight: '900',
        color: '#1E293B',
    },
    detailValueExpense: {
        fontSize: 16,
        fontWeight: '900',
        color: '#EF4444',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#1E293B',
        marginTop: 32,
        marginBottom: 20,
    },
    targetsList: {
        gap: 16,
    },
    targetItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        backgroundColor: '#F8FAFC',
        padding: 16,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    targetIconBox: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    targetInfo: {
        flex: 1,
    },
    targetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    targetTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: '#1E293B',
    },
    targetAmount: {
        fontSize: 13,
        fontWeight: '700',
        color: '#4F46E5',
    },
    targetTotal: {
        color: '#94A3B8',
    },
    targetProgressBg: {
        height: 8,
        backgroundColor: '#E2E8F0',
        borderRadius: 4,
        overflow: 'hidden',
    },
    targetProgressFill: {
        height: '100%',
        borderRadius: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    searchModal: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        height: '85%',
        padding: 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#1E293B',
    },
    clearAllText: {
        color: '#EF4444',
        fontWeight: '700',
        fontSize: 14,
    },
    searchBoxWrapper: {
        marginBottom: 32,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        borderRadius: 20,
        paddingHorizontal: 16,
        height: 56,
        gap: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#1E293B',
        fontWeight: '600',
    },
    filterLabel: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 16,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 32,
    },
    filterContent: {
        flex: 1,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 16,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    activeCategoryChip: {
        backgroundColor: '#4F46E5',
        borderColor: '#4F46E5',
    },
    categoryChipText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#64748B',
    },
    activeCategoryText: {
        color: '#FFFFFF',
    },
    reportTypeContainer: {
        gap: 12,
        marginBottom: 32,
    },
    reportToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        gap: 16,
    },
    activeReportToggle: {
        borderColor: '#4F46E5',
        backgroundColor: '#EEF2FF',
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#94A3B8',
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeRadioOuter: {
        borderColor: '#4F46E5',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#4F46E5',
    },
    reportToggleText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#64748B',
    },
    activeReportToggleText: {
        color: '#1E293B',
    },
    searchBtn: {
        height: 56,
        borderRadius: 20,
        overflow: 'hidden',
    },
    btnGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchBtnText: {
        fontSize: 17,
        fontWeight: '900',
        color: '#FFFFFF',
    },
});
