import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, useWindowDimensions, FlatList, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

const DEFAULT_CATEGORIES = [
    { id: '1', title: 'Food', icon: 'fork.knife', color: '#4F46E5', total: 0 },
    { id: '2', title: 'Transport', icon: 'bus.fill', color: '#6366F1', total: 0 },
    { id: '3', title: 'Medicine', icon: 'pills.fill', color: '#818CF8', total: 0 },
    { id: '4', title: 'Groceries', icon: 'cart.fill', color: '#6366F1', total: 0 },
    { id: '5', title: 'Rent', icon: 'key.fill', color: '#4F46E5', total: 0 },
    { id: '6', title: 'Gifts', icon: 'gift.fill', color: '#818CF8', total: 0 },
    { id: '7', title: 'Savings', icon: 'banknote.fill', color: '#4F46E5', total: 0 },
    { id: '8', title: 'Entertainment', icon: 'ticket.fill', color: '#6366F1', total: 0 },
    { id: '9', title: 'More', icon: 'plus', color: '#818CF8', total: 0 },
];

const getCurrencySymbol = (currency: string) => {
    switch (currency) {
        case 'PKR': return 'Rs';
        case 'INR': return '₹';
        case 'EUR': return '€';
        case 'GBP': return '£';
        default: return '$';
    }
};

const CURRENCIES = [
    { label: 'USD ($)', value: 'USD' },
    { label: 'PKR (Rs)', value: 'PKR' },
    { label: 'INR (₹)', value: 'INR' },
    { label: 'EUR (€)', value: 'EUR' },
    { label: 'GBP (£)', value: 'GBP' },
];

const CategoryCard = ({ title, icon, color, total, onPress, currency = 'USD' }: any) => (
    <TouchableOpacity style={styles.categoryCard} onPress={onPress}>
        <View style={[styles.categoryIconBox, { backgroundColor: `${color}15` }]}>
            <IconSymbol name={icon} size={32} color={color} />
        </View>
        <Text style={styles.categoryText}>{title}</Text>
        <Text style={[styles.categoryAmount, { color }]}>{getCurrencySymbol(currency)}{parseFloat(total).toLocaleString()}</Text>
    </TouchableOpacity>
);

const MODAL_CONFIG: any = {
    'Food': {
        field1: 'Restaurant / Place',
        field2: 'With Whom? (Family/Friends)',
        field3: 'What did you eat?',
        placeholder1: 'Enter name',
        placeholder2: 'Family, Friends, etc.',
        placeholder3: 'Details...'
    },
    'Transport': {
        field1: 'Source / From',
        field2: 'Destination / To',
        field3: 'Mode (Bus, Taxi, etc.)',
        placeholder1: 'Enter starting point',
        placeholder2: 'Enter destination',
        placeholder3: 'e.g. Uber, Bus, Train'
    },
    'Medicine': {
        field1: 'Pharmacy / Hospital',
        field2: 'Ailment / Reason',
        field3: 'Medicine Name & Dosage',
        placeholder1: 'Enter name',
        placeholder2: 'e.g. Fever, Checkup',
        placeholder3: 'Details...'
    },
    'Groceries': {
        field1: 'Store Name',
        field2: 'Category (Veg/Meat/Dairy)',
        field3: 'Items List',
        placeholder1: 'e.g. Walmart, Target',
        placeholder2: 'e.g. Monthly stock',
        placeholder3: 'Milk, Eggs, Bread...'
    },
    'Rent': {
        field1: 'Property / Building',
        field2: 'Month / Period',
        field3: 'Utility / Extra Details',
        placeholder1: 'Enter property name',
        placeholder2: 'e.g. March 2026',
        placeholder3: 'Electricity, Water, etc.'
    },
    'Gifts': {
        field1: 'Recipient Name',
        field2: 'Occasion',
        field3: 'Gift Details',
        placeholder1: 'Who is it for?',
        placeholder2: 'e.g. Birthday, Wedding',
        placeholder3: 'What did you buy?'
    },
    'Savings': {
        field1: 'Goal Name',
        field2: 'Source of Fund',
        field3: 'Notes',
        placeholder1: 'What are you saving for?',
        placeholder2: 'e.g. Salary, Bonus',
        placeholder3: 'Extra details...'
    },
    'Entertainment': {
        field1: 'Event / Movie / Activity',
        field2: 'Venue / Cinema',
        field3: 'With Whom?',
        placeholder1: 'e.g. Spiderman, Concert',
        placeholder2: 'e.g. IMAX, Stadium',
        placeholder3: 'Friends, Solo, etc.'
    },
    'More': {
        field1: 'Title',
        field2: 'Category Hint',
        field3: 'Details',
        placeholder1: 'Transaction title',
        placeholder2: 'e.g. Repair, Subscription',
        placeholder3: 'Notes...'
    }
};

export default function LayersScreen() {
    const { height } = useWindowDimensions();
    const router = useRouter();
    const { token } = useAuth();

    // Data State
    const [balance, setBalance] = useState('0.00');
    const [income, setIncome] = useState('0.00');
    const [expense, setExpense] = useState('0.00');
    const [displayCurrency, setDisplayCurrency] = useState('USD');
    const [expenseProgress, setExpenseProgress] = useState(0);
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [amount, setAmount] = useState('');
    const [val1, setVal1] = useState('');
    const [val2, setVal2] = useState('');
    const [val3, setVal3] = useState('');
    const [currency, setCurrency] = useState('USD');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    };

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
                setExpenseProgress(parseFloat(summaryData.expense) / 20000); // 20k is goal
            }

            // Fetch Categories
            const catRes = await fetch('http://localhost:5001/api/categories', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const catData = await catRes.json();

            if (catRes.ok) {
                const updatedCategories = DEFAULT_CATEGORIES.map(cat => {
                    const match = catData.find((item: any) => item.category.toLowerCase() === cat.title.toLowerCase());
                    return { ...cat, total: match ? match.total : 0 };
                });
                setCategories(updatedCategories);
            }

            // Fetch most recent transaction to determine display currency
            const txRes = await fetch('http://localhost:5001/api/transactions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const txData = await txRes.json();
            if (txRes.ok && txData.length > 0 && txData[0].currency) {
                setDisplayCurrency(txData[0].currency);
            }
        } catch (err) {
            console.error('Failed to fetch layers data:', err);
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
        if (!amount || isNaN(parseFloat(amount))) {
            Alert.alert('Error', 'Please enter a valid amount');
            return;
        }

        setSubmitting(true);
        try {
            const config = MODAL_CONFIG[selectedCategory.title] || MODAL_CONFIG['More'];
            const response = await fetch('http://localhost:5001/api/transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: val1 || `${selectedCategory.title} Expense`,
                    category: selectedCategory.title,
                    amount: parseFloat(amount),
                    is_negative: true,
                    icon: selectedCategory.icon,
                    description: val3,
                    companions: val2,
                    currency,
                    transaction_date: date
                })
            });

            if (response.ok) {
                setModalVisible(false);
                setAmount('');
                setVal1('');
                setVal2('');
                setVal3('');
                await fetchData();
                Alert.alert('Success', 'Transaction recorded successfully');
            } else {
                Alert.alert('Error', 'Failed to save transaction');
            }
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'An error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    const openModal = (category: any) => {
        setSelectedCategory(category);
        setModalVisible(true);
    };

    const config = selectedCategory ? (MODAL_CONFIG[selectedCategory.title] || MODAL_CONFIG['More']) : MODAL_CONFIG['More'];

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#4F46E5', '#6366F1']}
                style={[styles.headerGradient, { height: height * 0.4 }]}
            >
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.headerTop}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                            <IconSymbol name="chevron.left" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Categories</Text>
                        <TouchableOpacity style={styles.headerBtn}>
                            <IconSymbol name="bell.fill" size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.summaryContainer}>
                        <View style={styles.summaryItem}>
                            <View style={styles.summaryLabelRow}>
                                <IconSymbol name="plus.square.fill" size={12} color="#FFFFFF" />
                                <Text style={styles.summaryLabel}>Total Balance</Text>
                            </View>
                            <Text style={styles.summaryValue}>{getCurrencySymbol(displayCurrency)}{balance}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.summaryItem}>
                            <View style={styles.summaryLabelRow}>
                                <IconSymbol name="minus.square.fill" size={12} color="#FFFFFF" />
                                <Text style={styles.summaryLabel}>Expense</Text>
                            </View>
                            <Text style={[styles.summaryValue, { color: '#E2E8F0' }]}>-{getCurrencySymbol(displayCurrency)}{expense}</Text>
                        </View>
                    </View>

                    <View style={styles.progressSection}>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: `${expenseProgress * 100}%` }]}>
                                <Text style={styles.progressPercent}>{Math.round(expenseProgress * 100)}%</Text>
                            </View>
                            <Text style={styles.budgetGoal}>{getCurrencySymbol(displayCurrency)}20,000.00</Text>
                        </View>
                        <View style={styles.progressStatusRow}>
                            <IconSymbol name="checkmark.circle.fill" size={16} color="#FFFFFF" />
                            <Text style={styles.progressStatusText}>
                                {Math.round(expenseProgress * 100)}% Of Your Expenses, Looks Good.
                            </Text>
                        </View>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <View style={styles.contentSection}>
                <View style={styles.gridWrapper}>
                    <FlatList
                        data={categories}
                        numColumns={3}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <CategoryCard
                                title={item.title}
                                icon={item.icon}
                                color={item.color}
                                total={item.total}
                                onPress={() => openModal(item)}
                                currency={displayCurrency}
                            />
                        )}
                        contentContainerStyle={styles.flatListContent}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            </View>

            {/* Transaction Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add {selectedCategory?.title} Expense</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <IconSymbol name="xmark.circle.fill" size={24} color="#94A3B8" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
                            <Text style={styles.inputLabel}>Amount Invested ({getCurrencySymbol(currency)})</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0.00"
                                keyboardType="numeric"
                                value={amount}
                                onChangeText={setAmount}
                            />

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

                            <Text style={styles.inputLabel}>{config.field1}</Text>
                            <TextInput
                                style={styles.input}
                                placeholder={config.placeholder1}
                                value={val1}
                                onChangeText={setVal1}
                            />

                            <Text style={styles.inputLabel}>{config.field2}</Text>
                            <TextInput
                                style={styles.input}
                                placeholder={config.placeholder2}
                                value={val2}
                                onChangeText={setVal2}
                            />

                            <Text style={styles.inputLabel}>{config.field3}</Text>
                            <TextInput
                                style={[styles.input, { height: 80 }]}
                                placeholder={config.placeholder3}
                                multiline
                                value={val3}
                                onChangeText={setVal3}
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
                                    <Text style={styles.submitBtnText}>Save Transaction</Text>
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
    summaryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingVertical: 15,
        borderRadius: 20,
    },
    summaryItem: {
        flex: 1,
        alignItems: 'center',
    },
    summaryLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    summaryLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: 'rgba(255, 255, 255, 0.8)',
    },
    summaryValue: {
        fontSize: 22,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: -0.5,
    },
    divider: {
        width: 1,
        height: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    progressSection: {
        marginTop: 24,
    },
    progressBarBg: {
        height: 36,
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: 28,
        backgroundColor: '#1E293B',
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 40,
    },
    progressPercent: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '800',
    },
    budgetGoal: {
        fontSize: 13,
        fontWeight: '800',
        color: '#1E293B',
        marginRight: 10,
        fontStyle: 'italic',
    },
    progressStatusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 12,
        paddingLeft: 4,
    },
    progressStatusText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#FFFFFF',
        opacity: 0.9,
    },
    contentSection: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        marginTop: -30,
    },
    gridWrapper: {
        flex: 1,
        paddingTop: 35,
    },
    flatListContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    categoryCard: {
        flex: 1,
        alignItems: 'center',
        marginBottom: 25,
        padding: 5,
    },
    categoryIconBox: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 15,
        elevation: 4,
    },
    categoryText: {
        marginTop: 12,
        fontSize: 14,
        fontWeight: '800',
        color: '#1E293B',
    },
    categoryAmount: {
        marginTop: 4,
        fontSize: 12,
        fontWeight: '700',
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
        height: '80%',
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
    currencyContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 8,
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
});
