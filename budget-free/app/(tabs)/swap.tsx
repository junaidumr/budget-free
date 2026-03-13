import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, useWindowDimensions, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
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

const CATEGORIES = [
    { label: 'Food', icon: 'fork.knife' },
    { label: 'Transport', icon: 'bus.fill' },
    { label: 'Medicine', icon: 'pills.fill' },
    { label: 'Groceries', icon: 'cart.fill' },
    { label: 'Rent', icon: 'key.fill' },
    { label: 'Gifts', icon: 'gift.fill' },
    { label: 'Savings', icon: 'banknote.fill' },
    { label: 'Entertainment', icon: 'ticket.fill' },
    { label: 'More', icon: 'plus' },
];

const CURRENCIES = [
    { label: 'USD ($)', value: 'USD' },
    { label: 'PKR (Rs)', value: 'PKR' },
    { label: 'INR (₹)', value: 'INR' },
    { label: 'EUR (€)', value: 'EUR' },
    { label: 'GBP (£)', value: 'GBP' },
];

// Helper to group transactions by month
const groupTransactionsByMonth = (transactions: any[]) => {
    return transactions.reduce((groups: any, transaction: any) => {
        const date = new Date(transaction.created_at);
        const month = date.toLocaleString('default', { month: 'long' });
        if (!groups[month]) {
            groups[month] = [];
        }
        groups[month].push(transaction);
        return groups;
    }, {});
};

const TransactionItem = ({ icon, title, time, date, category, amount, isNegative, currency }: any) => {
    return (
        <View style={styles.transactionItem}>
            <View style={styles.transactionLeft}>
                <View style={[styles.transactionIconContainer, { backgroundColor: isNegative ? 'rgba(239, 68, 68, 0.08)' : 'rgba(79, 70, 229, 0.08)' }]}>
                    <IconSymbol name={icon || 'banknote.fill'} size={22} color={isNegative ? '#EF4444' : '#4F46E5'} />
                </View>
                <View style={styles.transactionInfo}>
                    <Text style={styles.transactionTitle} numberOfLines={1}>{title}</Text>
                    <Text style={styles.transactionSubtitle}>{time} • {date}</Text>
                </View>
            </View>

            <View style={styles.transactionRight}>
                <Text style={[styles.transactionAmount, isNegative && styles.negativeAmount]}>
                    {isNegative ? '-' : '+'}{getCurrencySymbol(currency)}{Math.abs(amount).toLocaleString()}
                </Text>
                <Text style={styles.transactionCategory} numberOfLines={1}>{category}</Text>
            </View>
        </View>
    );
};

export default function SwapScreen() {
    const { height } = useWindowDimensions();
    const router = useRouter();
    const { token } = useAuth();

    // Data State (Real)
    const [balance, setBalance] = useState('0.00');
    const [income, setIncome] = useState('0.00');
    const [expense, setExpense] = useState('0.00');
    const [displayCurrency, setDisplayCurrency] = useState('USD');
    const [groupedTransactions, setGroupedTransactions] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState('USD');
    const [isNegative, setIsNegative] = useState(false);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const fetchData = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            // Fetch Summary
            const summaryRes = await fetch('http://localhost:5001/api/summary', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const summaryData = await summaryRes.json();
            if (summaryRes.ok) {
                setBalance(summaryData.balance);
                setIncome(summaryData.income);
                setExpense(summaryData.expense);
            }

            // Fetch All Transactions
            const txRes = await fetch('http://localhost:5001/api/transactions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const txData = await txRes.json();
            if (txRes.ok) {
                setGroupedTransactions(groupTransactionsByMonth(txData));
                // Use currency from the most recent transaction for header display
                if (txData.length > 0 && txData[0].currency) {
                    setDisplayCurrency(txData[0].currency);
                }
            }
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [fetchData])
    );

    const handleAddTransaction = async () => {
        if (!amount || isNaN(parseFloat(amount)) || !title) {
            Alert.alert('Error', 'Please enter a valid title and amount');
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch('http://localhost:5001/api/transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title,
                    category: isNegative ? 'Expense' : 'Income',
                    amount: parseFloat(amount),
                    is_negative: isNegative,
                    icon: isNegative ? 'bag.fill' : 'banknote.fill',
                    currency,
                    transaction_date: date
                })
            });

            if (response.ok) {
                setModalVisible(false);
                setTitle('');
                setAmount('');
                setIsNegative(false); // Reset to Income default
                await fetchData();
                Alert.alert('Success', 'Fund added successfully');
            } else {
                Alert.alert('Error', 'Failed to add fund');
            }
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'An error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#4F46E5', '#6366F1']}
                style={[styles.headerGradient, { height: height * 0.45 }]}
            >
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.headerTop}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                            <IconSymbol name="chevron.left" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Transaction</Text>
                        <TouchableOpacity style={styles.headerBtn}>
                            <IconSymbol name="bell.fill" size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.balanceSection}>
                        <Text style={styles.balanceLabel}>Total Balance</Text>
                        <Text style={styles.balanceValue}>{getCurrencySymbol(displayCurrency)}{balance}</Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <View style={styles.summaryCard}>
                            <View style={styles.summaryIconContainer}>
                                <IconSymbol name="arrow.up.right.square" size={18} color="#4F46E5" />
                                <Text style={styles.summaryTypeLabel}>Income</Text>
                            </View>
                            <Text style={styles.summaryValueText}>{getCurrencySymbol(displayCurrency)}{income}</Text>
                        </View>
                        <View style={styles.summaryCard}>
                            <View style={[styles.summaryIconContainer, { backgroundColor: '#EEF2FF' }]}>
                                <IconSymbol name="arrow.down.left.square" size={18} color="#6366F1" />
                                <Text style={[styles.summaryTypeLabel, { color: '#6366F1' }]}>Expense</Text>
                            </View>
                            <Text style={[styles.summaryValueText, { color: '#6366F1' }]}>{getCurrencySymbol(displayCurrency)}{expense}</Text>
                        </View>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <View style={styles.contentSection}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollPadding}
                >
                    {Object.keys(groupedTransactions).map((month) => (
                        <View key={month} style={styles.monthGroup}>
                            <View style={styles.monthHeader}>
                                <Text style={styles.monthTitle}>{month}</Text>
                                <TouchableOpacity style={styles.calendarBtn}>
                                    <View style={styles.calendarIconContainer}>
                                        <IconSymbol name="calendar" size={16} color="#FFFFFF" />
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.transactionsWrapper}>
                                {groupedTransactions[month].map((item: any) => {
                                    const dateObj = new Date(item.created_at);
                                    const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                    const date = dateObj.toLocaleDateString('default', { month: 'short', day: 'numeric' });

                                    return (
                                        <TransactionItem
                                            key={item.id}
                                            icon={item.icon}
                                            title={item.title}
                                            time={time}
                                            date={date}
                                            category={item.category}
                                            amount={item.amount}
                                            isNegative={item.is_negative}
                                            currency={item.currency}
                                        />
                                    );
                                })}
                            </View>
                        </View>
                    ))}
                    <View style={{ height: 100 }} />
                </ScrollView>
            </View>

            {/* Floating Action Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => setModalVisible(true)}
            >
                <IconSymbol name="plus" size={30} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Add Transaction Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add Fund</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <IconSymbol name="xmark.circle.fill" size={24} color="#94A3B8" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
                            <View style={styles.typeSelector}>
                                <TouchableOpacity
                                    style={[styles.typeBtn, isNegative && styles.typeBtnActiveNegative]}
                                    onPress={() => setIsNegative(true)}
                                >
                                    <Text style={[styles.typeBtnText, isNegative && styles.typeBtnTextActive]}>Expense</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.typeBtn, !isNegative && styles.typeBtnActivePositive]}
                                    onPress={() => setIsNegative(false)}
                                >
                                    <Text style={[styles.typeBtnText, !isNegative && styles.typeBtnTextActive]}>Income</Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.inputLabel}>Title</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter title (e.g. Salary, Uber)"
                                value={title}
                                onChangeText={setTitle}
                            />

                            <View style={styles.row}>
                                <View style={{ flex: 1, marginRight: 10 }}>
                                    <Text style={styles.inputLabel}>Currency</Text>
                                    <View style={styles.currencyContainer}>
                                        {CURRENCIES.map((cur) => (
                                            <TouchableOpacity
                                                key={cur.value}
                                                style={[styles.currencyChip, currency === cur.value && styles.currencyChipActive]}
                                                onPress={() => setCurrency(cur.value)}
                                            >
                                                <Text style={[styles.currencyChipText, currency === cur.value && styles.currencyChipTextActive]}>
                                                    {cur.value}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            </View>

                            <Text style={styles.inputLabel}>Amount ({getCurrencySymbol(currency)})</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0.00"
                                keyboardType="numeric"
                                value={amount}
                                onChangeText={setAmount}
                            />

                            <Text style={styles.inputLabel}>Date</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="YYYY-MM-DD"
                                value={date}
                                onChangeText={setDate}
                            />

                            <TouchableOpacity
                                style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
                                onPress={handleAddTransaction}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.submitBtnText}>Add Fund</Text>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
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
    balanceSection: {
        alignItems: 'center',
        marginTop: 25,
        backgroundColor: '#FFFFFF',
        borderRadius: 28,
        paddingVertical: 24,
        paddingHorizontal: 20,
        shadowColor: '#1E293B',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.1,
        shadowRadius: 25,
        elevation: 10,
    },
    balanceLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#64748B',
        marginBottom: 6,
    },
    balanceValue: {
        fontSize: 36,
        fontWeight: '900',
        color: '#1E293B',
        letterSpacing: -1.5,
    },
    summaryRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 12,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 16,
        shadowColor: '#1E293B',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 5,
    },
    summaryIconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    summaryTypeLabel: {
        fontSize: 13,
        fontWeight: '800',
        color: '#4F46E5',
    },
    summaryValueText: {
        fontSize: 19,
        fontWeight: '900',
        color: '#1E293B',
        letterSpacing: -0.5,
    },
    contentSection: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        marginTop: -25,
    },
    scrollPadding: {
        paddingTop: 45,
        paddingHorizontal: 20,
    },
    monthGroup: {
        marginBottom: 35,
    },
    monthHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 18,
        paddingLeft: 4,
    },
    monthTitle: {
        fontSize: 19,
        fontWeight: '900',
        color: '#1E293B',
        letterSpacing: -0.5,
    },
    calendarBtn: {
        backgroundColor: '#FFFFFF',
        padding: 8,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    calendarIconContainer: {
        backgroundColor: '#4F46E5',
        padding: 6,
        borderRadius: 8,
    },
    transactionsWrapper: {
        backgroundColor: '#FFFFFF',
        borderRadius: 32,
        paddingHorizontal: 16,
        paddingVertical: 8,
        shadowColor: '#1E293B',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.03,
        shadowRadius: 15,
        elevation: 2,
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    transactionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        flex: 1,
    },
    transactionIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    transactionInfo: {
        flex: 1,
    },
    transactionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 4,
    },
    transactionSubtitle: {
        fontSize: 12,
        color: '#94A3B8',
        fontWeight: '600',
    },
    transactionRight: {
        alignItems: 'flex-end',
        gap: 6,
    },
    transactionAmount: {
        fontSize: 17,
        fontWeight: '900',
        color: '#4F46E5',
    },
    negativeAmount: {
        color: '#EF4444',
    },
    transactionCategory: {
        fontSize: 11,
        color: '#64748B',
        fontWeight: '800',
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        textTransform: 'uppercase',
    },
    fab: {
        position: 'absolute',
        bottom: 100,
        right: 25,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#4F46E5',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        height: '85%',
        padding: 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#1E293B',
    },
    modalForm: {
        flex: 1,
    },
    typeSelector: {
        flexDirection: 'row',
        backgroundColor: '#F1F5F9',
        borderRadius: 16,
        padding: 4,
        marginBottom: 20,
    },
    typeBtn: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 12,
    },
    typeBtnActiveNegative: {
        backgroundColor: '#EF4444',
    },
    typeBtnActivePositive: {
        backgroundColor: '#10B981',
    },
    typeBtnText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#64748B',
    },
    typeBtnTextActive: {
        color: '#FFFFFF',
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#64748B',
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#1E293B',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    row: {
        flexDirection: 'row',
    },
    currencyContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    currencyChip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    currencyChipActive: {
        backgroundColor: '#4F46E5',
        borderColor: '#4F46E5',
    },
    currencyChipText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#64748B',
    },
    currencyChipTextActive: {
        color: '#FFFFFF',
    },
    categoryPicker: {
        marginTop: 5,
    },
    catChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    catChipActive: {
        backgroundColor: '#4F46E5',
        borderColor: '#4F46E5',
    },
    catChipText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#64748B',
    },
    catChipTextActive: {
        color: '#FFFFFF',
    },
    submitBtn: {
        backgroundColor: '#4F46E5',
        borderRadius: 16,
        padding: 18,
        alignItems: 'center',
        marginTop: 32,
        marginBottom: 40,
    },
    submitBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '800',
    },
});
