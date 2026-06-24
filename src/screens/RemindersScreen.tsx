import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Platform,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import { Feather } from '@expo/vector-icons';
import { useFinance } from '../context/FinanceContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RemindersScreen() {
  const { reminders, addReminder, deleteReminder, toggleReminder } = useFinance();
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('1');

  useEffect(() => {
    Notifications.requestPermissionsAsync();
  }, []);

  useEffect(() => {
    const checkReminders = async () => {
      const today = new Date().getDate();
      for (const r of reminders) {
        if (r.isActive && r.dueDate === today) {
          const key = `reminder_shown_${r.id}_${new Date().toDateString()}`;
          const lastShown = await AsyncStorage.getItem(key);
          if (!lastShown) {
            await Notifications.scheduleNotificationAsync({
              content: { fontFamily: 'Vazirmatn_400Regular', title: `یادآور پرداخت: ${r.title}`,
                body: r.amount ? `مبلغ: ${r.amount.toLocaleString('en-US')} تومان` : 'امروز موعد پرداخت است.',
              },
              trigger: { fontFamily: 'Vazirmatn_400Regular', seconds: 1},
            });
            await AsyncStorage.setItem(key, 'true');
          }
        }
      }
    };
    checkReminders();
  }, [reminders]);

  const handleAdd = () => {
    if (!title.trim()) return;
    addReminder({ title: title.trim(), amount: amount ? Number(amount.replace(/\D/g, '')) : undefined, dueDate: Number(dueDate), isActive: true });
    setTitle('');
    setAmount('');
    setDueDate('1');
    setIsAdding(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>یادآور پرداختی‌ها</Text>
          <Text style={styles.headerSub}>مدیریت قبوض، اجاره و پرداخت‌های ماهانه</Text>
        </View>
        <TouchableOpacity style={styles.addIcon} onPress={() => setIsAdding(true)}>
          <Feather name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {isAdding && (
        <View style={styles.addForm}>
          <View style={styles.addFormHeader}>
            <Text style={styles.addFormTitle}>یادآور جدید</Text>
            <TouchableOpacity onPress={() => setIsAdding(false)}>
              <Feather name="x" size={18} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          <View>
            <Text style={styles.inputLabel}>عنوان پرداختی</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="مثال: اجاره خانه" />
          </View>

          <View style={styles.addFormRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>مبلغ (اختیاری)</Text>
              <TextInput style={[styles.input, { textAlign: 'left' }]} value={amount}
                onChangeText={t => setAmount(t.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ','))}
                placeholder="2,000,000" keyboardType="numeric" />
            </View>
            <View style={{ width: '30%' }}>
              <Text style={styles.inputLabel}>روز ماه</Text>
              <TextInput style={[styles.input, { textAlign: 'left' }]} value={dueDate}
                onChangeText={t => setDueDate(t.replace(/\D/g, ''))} placeholder="1" keyboardType="numeric" maxLength={2} />
            </View>
          </View>

          <TouchableOpacity style={[styles.saveReminderBtn, !title.trim() && { backgroundColor: '#93c5fd' }]}
            onPress={handleAdd} disabled={!title.trim()}>
            <Text style={styles.saveReminderBtnText}>ثبت یادآور</Text>
          </TouchableOpacity>
        </View>
      )}

      {reminders.length === 0 ? (
        <View style={styles.emptyState}>
          <Feather name="bell-off" size={32} color="#d1d5db" />
          <Text style={styles.emptyText}>هیچ یادآوری ثبت نشده است</Text>
        </View>
      ) : (
        reminders.map(r => (
          <View key={r.id} style={[styles.reminderCard, !r.isActive && styles.reminderCardInactive]}>
            <View style={styles.reminderTop}>
              <View style={styles.reminderLeft}>
                <TouchableOpacity style={[styles.toggleBtn, r.isActive ? styles.toggleActive : styles.toggleInactive]}
                  onPress={() => toggleReminder(r.id)}>
                  <Feather name={r.isActive ? 'bell' : 'bell-off'} size={20} color={r.isActive ? '#2563eb' : '#9ca3af'} />
                </TouchableOpacity>
                <View>
                  <Text style={styles.reminderTitle}>{r.title}</Text>
                  {r.amount ? <Text style={styles.reminderAmount}>{r.amount.toLocaleString('en-US')} تومان</Text> : null}
                </View>
              </View>
              <TouchableOpacity onPress={() => deleteReminder(r.id)} style={{ padding: 8 }}>
                <Feather name="trash-2" size={16} color="#d1d5db" />
              </TouchableOpacity>
            </View>
            <View style={styles.reminderBadge}>
              <Feather name="calendar" size={14} color="#6b7280" />
              <Text style={styles.reminderBadgeText}>روز {r.dueDate} هر ماه</Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { fontFamily: 'Vazirmatn_400Regular', flex: 1, backgroundColor: '#f8fafc'},
  content: { fontFamily: 'Vazirmatn_400Regular', padding: 24, paddingBottom: 140},

  header: { fontFamily: 'Vazirmatn_400Regular', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, marginTop: 8},
  headerTitle: { fontSize: 20, fontFamily: 'Vazirmatn_700Bold', color: '#1f2937' },
  headerSub: { fontFamily: 'Vazirmatn_400Regular', fontSize: 13, color: '#6b7280', marginTop: 4},
  addIcon: { fontFamily: 'Vazirmatn_400Regular', width: 40, height: 40, borderRadius: 12, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center', shadowColor: '#2563eb', shadowOffset: { width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },

  addForm: { fontFamily: 'Vazirmatn_400Regular', backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#f3f4f6', gap: 16},
  addFormHeader: { fontFamily: 'Vazirmatn_400Regular', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  addFormTitle: { fontSize: 14, fontFamily: 'Vazirmatn_700Bold', color: '#1f2937' },
  inputLabel: { fontSize: 12, fontFamily: 'Vazirmatn_600SemiBold', color: '#6b7280', marginBottom: 6 },
  input: { backgroundColor: '#f9fafb', borderRadius: 12, padding: 12, fontSize: 14, fontFamily: 'Vazirmatn_500Medium', borderWidth: 1, borderColor: '#f3f4f6' },
  addFormRow: { fontFamily: 'Vazirmatn_400Regular', flexDirection: 'row', gap: 12},
  saveReminderBtn: { fontFamily: 'Vazirmatn_400Regular', backgroundColor: '#2563eb', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 4},
  saveReminderBtnText: { fontSize: 14, fontFamily: 'Vazirmatn_700Bold', color: '#fff' },

  emptyState: { fontFamily: 'Vazirmatn_400Regular', alignItems: 'center', justifyContent: 'center', padding: 40, backgroundColor: '#fff', borderRadius: 24, borderWidth: 1, borderStyle: 'dashed', borderColor: '#e5e7eb', gap: 16, marginTop: 16},
  emptyText: { fontSize: 14, fontFamily: 'Vazirmatn_500Medium', color: '#9ca3af' },

  reminderCard: { fontFamily: 'Vazirmatn_400Regular', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#dbeafe', shadowColor: '#2563eb', shadowOffset: { width: 0, height: 1}, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  reminderCardInactive: { fontFamily: 'Vazirmatn_400Regular', opacity: 0.6, borderColor: '#f3f4f6'},
  reminderTop: { fontFamily: 'Vazirmatn_400Regular', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12},
  reminderLeft: { fontFamily: 'Vazirmatn_400Regular', flexDirection: 'row', alignItems: 'center', gap: 12},
  toggleBtn: { fontFamily: 'Vazirmatn_400Regular', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center'},
  toggleActive: { fontFamily: 'Vazirmatn_400Regular', backgroundColor: '#eff6ff'},
  toggleInactive: { fontFamily: 'Vazirmatn_400Regular', backgroundColor: '#f3f4f6'},
  reminderTitle: { fontSize: 14, fontFamily: 'Vazirmatn_700Bold', color: '#1f2937' },
  reminderAmount: { fontSize: 12, color: '#6b7280', fontFamily: 'Vazirmatn_500Medium', marginTop: 2 },
  reminderBadge: { fontFamily: 'Vazirmatn_400Regular', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f9fafb', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start'},
  reminderBadgeText: { fontSize: 12, fontFamily: 'Vazirmatn_600SemiBold', color: '#6b7280' },
});
