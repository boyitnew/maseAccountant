import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BarChart } from 'react-native-chart-kit';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatMonthYear, formatMonthYearWithSetting, formatShortMonth } from '../utils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 24 * 2 - 24 * 2;
const iconMap: Record<string, keyof typeof Feather.glyphMap> = {
  'credit-card': 'credit-card', monitor: 'monitor', gift: 'gift', coffee: 'coffee',
  truck: 'truck', 'shopping-bag': 'shopping-bag', home: 'home', 'file-text': 'file-text',
  film: 'film', activity: 'activity', zap: 'zap', bus: 'bus', plane: 'plane',
};

export default function ReportsScreen() {
  const { transactions, monthlyExpense, categories, userProfile } = useFinance();
  const useShamsi = userProfile.useShamsiDate;

  const expenseData = useMemo(() => {
    const now = new Date();
    const grouped: Record<string, number> = {};
    transactions.forEach(t => {
      const d = new Date(t.date);
      if (t.type === 'expense' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
        grouped[t.categoryId] = (grouped[t.categoryId] || 0) + t.amount;
      }
    });
    return Object.entries(grouped)
      .map(([catId, value]) => {
        const cat = categories.find(c => c.id === catId);
        return { name: cat?.name || 'نامشخص', value, icon: cat?.icon || 'credit-card', color: cat?.color || '#6b7280' };
      })
      .sort((a, b) => b.value - a.value);
  }, [transactions, categories]);

  const last6MonthsData = useMemo(() => {
    const now = new Date();
    const last6Keys: string[] = [];
    const monthsData: Record<string, { name: string; income: number; expense: number }> = {};
    for (let i = 0; last6Keys.length < 6 && i < 200; i += 15) {
      const d = new Date(now.getTime() - i * 86400000);
      const key = formatMonthYear(d.toISOString());
      if (!last6Keys.includes(key)) {
        last6Keys.unshift(key);
        monthsData[key] = { name: formatShortMonth(d, useShamsi), income: 0, expense: 0 };
      }
    }
    transactions.forEach(t => {
      const key = formatMonthYear(t.date);
      if (monthsData[key]) {
        if (t.type === 'income') monthsData[key].income += t.amount;
        else monthsData[key].expense += t.amount;
      }
    });
    return last6Keys.map(k => monthsData[k]);
  }, [transactions]);

  if (transactions.length === 0) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: '#9ca3af' }}>داده‌ای برای نمایش گزارش وجود ندارد</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>گزارش ماهانه</Text>
        <View style={styles.badge}><Text style={styles.badgeText}>این ماه</Text></View>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryDeco} />
        <Text style={styles.summaryLabel}>مجموع هزینه‌های این ماه</Text>
        <Text style={styles.summaryAmount}>{formatCurrency(monthlyExpense)}</Text>
      </View>

      <View style={styles.breakdownSection}>
        <Text style={styles.sectionTitle}>جزئیات هزینه‌ها</Text>
        {expenseData.length === 0 ? (
          <Text style={{ color: '#9ca3af', fontSize: 14, textAlign: 'center', padding: 16 }}>این ماه هزینه‌ای ثبت نشده است</Text>
        ) : (
          expenseData.map((item, idx) => {
            const iconName = iconMap[item.icon] || 'credit-card';
            const pct = monthlyExpense > 0 ? Math.round((item.value / monthlyExpense) * 100) : 0;
            return (
              <View key={idx} style={styles.breakdownItem}>
                <View style={[styles.breakdownIcon, { backgroundColor: item.color + '26' }]}>
                  <Feather name={iconName} size={22} color={item.color} />
                </View>
                <View style={styles.breakdownInfo}>
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownName}>{item.name}</Text>
                    <Text style={styles.breakdownValue}>{formatCurrency(item.value).replace(' تومان', '')}</Text>
                  </View>
                  <View style={styles.breakdownBarBg}>
                    <View style={[styles.breakdownBarFill, { width: `${pct}%`, backgroundColor: item.color }]} />
                  </View>
                </View>
              </View>
            );
          })
        )}
      </View>

      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>مقایسه ۶ ماه اخیر</Text>
        <View style={styles.chartContainer}>
          <BarChart
            data={{
              labels: last6MonthsData.map(d => d.name),
              datasets: [
                { data: last6MonthsData.map(d => d.income), color: () => '#10b981' },
                { data: last6MonthsData.map(d => d.expense), color: () => '#f43f5e' },
              ],
            }}
            width={CHART_WIDTH}
            height={220}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
              labelColor: () => '#6b7280',
              barPercentage: 0.5,
              propsForBackgroundLines: { fontFamily: 'Vazirmatn_400Regular', strokeDasharray: '3 3', stroke: '#f3f4f6'},
            }}
            fromZero
            showBarTops={false}
            showValuesOnTopOfBars={false}
            withCustomBarColorFromData
            flatColor
            style={{ borderRadius: 16 }}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { fontFamily: 'Vazirmatn_400Regular', flex: 1, backgroundColor: '#f8fafc'},
  content: { fontFamily: 'Vazirmatn_400Regular', padding: 24, paddingBottom: 140},
  header: { fontFamily: 'Vazirmatn_400Regular', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, marginTop: 8},
  headerTitle: { fontSize: 20, fontFamily: 'Vazirmatn_700Bold', color: '#1f2937' },
  badge: { fontFamily: 'Vazirmatn_400Regular', backgroundColor: '#f3f4f6', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20},
  badgeText: { fontSize: 13, fontFamily: 'Vazirmatn_500Medium', color: '#6b7280' },

  summaryCard: { fontFamily: 'Vazirmatn_400Regular', backgroundColor: '#2563eb', borderRadius: 24, padding: 24, marginBottom: 32, alignItems: 'center', shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 4}, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6, overflow: 'hidden' },
  summaryDeco: { fontFamily: 'Vazirmatn_400Regular', position: 'absolute', right: -24, top: -24, width: 128, height: 128, borderRadius: 64, backgroundColor: 'rgba(255,255,255,0.08)'},
  summaryLabel: { fontSize: 14, color: 'rgba(219,234,254,0.8)', fontFamily: 'Vazirmatn_500Medium', marginBottom: 8 },
  summaryAmount: { fontSize: 36, fontFamily: 'Vazirmatn_700Bold', color: '#fff' },

  breakdownSection: { fontFamily: 'Vazirmatn_400Regular', marginBottom: 32, gap: 12},
  sectionTitle: { fontSize: 18, fontFamily: 'Vazirmatn_700Bold', color: '#1f2937', marginBottom: 8 },

  breakdownItem: { fontFamily: 'Vazirmatn_400Regular', flexDirection: 'row', gap: 16, backgroundColor: '#fff', borderRadius: 16, padding: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1}, shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 },
  breakdownIcon: { fontFamily: 'Vazirmatn_400Regular', width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center'},
  breakdownInfo: { fontFamily: 'Vazirmatn_400Regular', flex: 1, justifyContent: 'center'},
  breakdownRow: { fontFamily: 'Vazirmatn_400Regular', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6},
  breakdownName: { fontSize: 14, fontFamily: 'Vazirmatn_700Bold', color: '#1f2937' },
  breakdownValue: { fontSize: 14, fontFamily: 'Vazirmatn_700Bold', color: '#1f2937' },
  breakdownBarBg: { fontFamily: 'Vazirmatn_400Regular', height: 6, borderRadius: 3, backgroundColor: '#f3f4f6', overflow: 'hidden'},
  breakdownBarFill: { fontFamily: 'Vazirmatn_400Regular', height: 6, borderRadius: 3},

  chartSection: { fontFamily: 'Vazirmatn_400Regular', marginBottom: 32},
  chartContainer: { fontFamily: 'Vazirmatn_400Regular', backgroundColor: '#fff', borderRadius: 24, padding: 16, borderWidth: 1, borderColor: '#f3f4f6', alignItems: 'center'},
});
