import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Modal,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Feather } from '@expo/vector-icons';
import { useFinance } from '../context/FinanceContext';
import { TransactionType } from '../types';
import { parseBankSMS, gregorianToShamsi, shamsiToGregorian, formatShamsiDate, formatGregorianDate, formatDateForInput } from '../utils';

const iconMap: Record<string, keyof typeof Feather.glyphMap> = {
  'credit-card': 'credit-card', monitor: 'monitor', gift: 'gift', coffee: 'coffee',
  truck: 'truck', 'shopping-bag': 'shopping-bag', home: 'home', 'file-text': 'file-text',
  film: 'film', activity: 'activity', zap: 'zap', bus: 'bus', plane: 'plane',
};

interface AddScreenProps {
  onClose: () => void;
}

const SHAMSI_MONTH_NAMES = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];

export default function AddScreen({ onClose }: AddScreenProps) {
  const { addTransaction, updateTransaction, transactions, editingTransactionId, setEditingTransactionId, categories, userProfile } = useFinance();
  const useShamsi = userProfile.useShamsiDate;

  const editingTx = editingTransactionId ? transactions.find(t => t.id === editingTransactionId) : null;

  const [type, setType] = useState<TransactionType>(editingTx?.type || 'expense');
  const [amount, setAmount] = useState<string>(editingTx ? String(editingTx.amount) : '');
  const [categoryId, setCategoryId] = useState<string>(editingTx?.categoryId || '');
  const [note, setNote] = useState<string>(editingTx?.note || '');
  const [smsText, setSmsText] = useState('');
  const [parsedPreview, setParsedPreview] = useState<any>(null);
  const [showSmsArea, setShowSmsArea] = useState(false);

  const initialDate = editingTx ? new Date(editingTx.date) : new Date();
  const [txDate, setTxDate] = useState<Date>(initialDate);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const dpGregorian = gregorianToShamsi(txDate.getFullYear(), txDate.getMonth() + 1, txDate.getDate());
  const [dpYear, setDpYear] = useState(dpGregorian.year);
  const [dpMonth, setDpMonth] = useState(dpGregorian.month);
  const [dpDay, setDpDay] = useState(dpGregorian.day);

  const formatAmount = (text: string): string => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (!cleaned) return '';
    return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleAmountChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setAmount(cleaned);
  };

  useEffect(() => {
    if (editingTx) {
      setType(editingTx.type);
      setAmount(String(editingTx.amount));
      setCategoryId(editingTx.categoryId);
      setNote(editingTx.note);
      setTxDate(new Date(editingTx.date));
    }
  }, [editingTx]);

  useEffect(() => {
    const s = gregorianToShamsi(txDate.getFullYear(), txDate.getMonth() + 1, txDate.getDate());
    setDpYear(s.year);
    setDpMonth(s.month);
    setDpDay(s.day);
  }, [txDate]);

  const handleClose = () => {
    setEditingTransactionId(null);
    onClose();
  };

  const handlePasteSMS = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      setSmsText(text);
      const parsed = parseBankSMS(text);
      setParsedPreview(parsed);
      if (parsed) {
        setShowSmsArea(true);
      } else {
        Alert.alert('خطا', 'پیامک بانکی معتبری در حافظه یافت نشد یا قابل تشخیص نیست.');
      }
    } catch {
      Alert.alert('خطا', 'دسترسی به کلیپ‌بورد امکان‌پذیر نیست.');
      setShowSmsArea(true);
    }
  };

  const handleSave = () => {
    const amt = Number(amount);
    if (!amount || isNaN(amt) || !categoryId) return;

    const dateStr = txDate.toISOString();
    if (editingTx) {
      updateTransaction(editingTx.id, { type, amount: amt, categoryId, note, date: dateStr });
    } else {
      addTransaction({ type, amount: amt, categoryId, note, date: dateStr });
    }
    handleClose();
  };

  const openDatePicker = () => {
    const s = gregorianToShamsi(txDate.getFullYear(), txDate.getMonth() + 1, txDate.getDate());
    setDpYear(s.year);
    setDpMonth(s.month);
    setDpDay(s.day);
    setShowDatePicker(true);
  };

  const confirmDate = () => {
    const newDate = shamsiToGregorian(dpYear, dpMonth, dpDay);
    setTxDate(newDate);
    setShowDatePicker(false);
  };

  const maxDay = dpMonth <= 6 ? 31 : dpMonth === 12 ? 30 : 30;
  const safeDay = Math.min(dpDay, maxDay);

  const filteredCategories = categories.filter(c => c.type === type);

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.backBtn}>
            <Feather name="arrow-right" size={24} color="#6b7280" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{editingTx ? 'ویرایش تراکنش' : 'تراکنش جدید'}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
          <View style={styles.typeToggle}>
            <TouchableOpacity style={[styles.typeBtn, type === 'expense' && styles.typeBtnActiveExpense]}
              onPress={() => setType('expense')}>
              <Text style={[styles.typeBtnText, type === 'expense' && { color: '#e11d48' }]}>هزینه (پرداختی)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.typeBtn, type === 'income' && styles.typeBtnActiveIncome]}
              onPress={() => setType('income')}>
              <Text style={[styles.typeBtnText, type === 'income' && { color: '#059669' }]}>درآمد (دریافتی)</Text>
            </TouchableOpacity>
          </View>

          {!editingTx && (
            <View style={styles.smsWidget}>
              <View style={styles.smsHeader}>
                <View style={styles.smsHeaderLeft}>
                  <View style={styles.smsIconBox}>
                    <Feather name="zap" size={16} color="#4f46e5" />
                  </View>
                  <Text style={styles.smsTitle}>پردازشگر خودکار پیامک بانکی</Text>
                </View>
                <TouchableOpacity onPress={() => setShowSmsArea(!showSmsArea)}>
                  <Text style={styles.smsToggle}>{showSmsArea ? 'بستن پیامک‌خوان' : 'وارد کردن پیامک'}</Text>
                </TouchableOpacity>
              </View>

              {showSmsArea && (
                <View style={styles.smsBody}>
                  <Text style={styles.smsDesc}>
                    متن پیامک واریز یا برداشت بانک خود را در کادر زیر کپی کنید:
                  </Text>
                  <View style={styles.smsInputRow}>
                    <TextInput style={styles.smsInput} multiline numberOfLines={3}
                      value={smsText} onChangeText={t => { setSmsText(t); setParsedPreview(parseBankSMS(t)); }}
                      placeholder="متن پیامک بانکی را اینجا جایگذاری کنید..." textAlignVertical="top" />
                    {!smsText && (
                      <TouchableOpacity style={styles.pasteBtn} onPress={handlePasteSMS}>
                        <Feather name="clipboard" size={14} color="#4f46e5" />
                        <Text style={styles.pasteBtnText}>جایگذاری از حافظه</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {parsedPreview && (
                    <View style={styles.parsedPreview}>
                      <View style={styles.parsedHeader}>
                        <View style={styles.parsedBank}>
                          <View style={[styles.dot, { backgroundColor: '#10b981' }]} />
                          <Text style={styles.parsedBankName}>{parsedPreview.bankName}</Text>
                        </View>
                        <Text style={[styles.parsedType, { backgroundColor: parsedPreview.type === 'income' ? '#d1fae5' : '#ffe4e6', color: parsedPreview.type === 'income' ? '#047857' : '#be123c' }]}>
                          {parsedPreview.type === 'income' ? 'واریز' : 'برداشت'}
                        </Text>
                      </View>
                      <View style={styles.parsedDetails}>
                        <View>
                          <Text style={styles.parsedLabel}>مبلغ تراکنش:</Text>
                          <Text style={styles.parsedValue}>{Number(parsedPreview.amount).toLocaleString('fa-IR')} تومان</Text>
                        </View>
                        {parsedPreview.cardSuffix ? (
                          <View>
                            <Text style={styles.parsedLabel}>کارت/حساب:</Text>
                            <Text style={styles.parsedValue}>**** {parsedPreview.cardSuffix}</Text>
                          </View>
                        ) : null}
                      </View>
                      <TouchableOpacity style={styles.applyBtn} onPress={() => {
                        setAmount(String(parsedPreview.amount));
                        setType(parsedPreview.type);
                        setNote(`${parsedPreview.bankName} - کارت ${parsedPreview.cardSuffix}`);
                        const valid = categories.filter(c => c.type === parsedPreview.type);
                        if (valid.length > 0) setCategoryId(valid[0].id);
                        setSmsText('');
                        setParsedPreview(null);
                        setShowSmsArea(false);
                      }}>
                        <Feather name="check" size={14} color="#fff" />
                        <Text style={styles.applyBtnText}>تایید و پر کردن خودکار فرم</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  {smsText && !parsedPreview && (
                    <View style={styles.noParse}>
                      <Feather name="x" size={14} color="#92400e" />
                      <Text style={styles.noParseText}>پیامک بانکی شناسایی نشد.</Text>
                    </View>
                  )}
                </View>
              )}

              {!showSmsArea && (
                <View style={styles.smsCollapsed}>
                  <Text style={styles.smsCollapsedText}>
                    می‌توانید پیامک بانکی را کپی کرده و اینجا وارد کنید تا در ۲ ثانیه فرم پر شود!
                  </Text>
                  <TouchableOpacity style={styles.openBtn} onPress={() => setShowSmsArea(true)}>
                    <Text style={styles.openBtnText}>باز کردن</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          <View style={styles.amountSection}>
            <Text style={styles.sectionLabel}>مبلغ (تومان)</Text>
            <TextInput style={[styles.amountInput, { color: type === 'expense' ? '#f43f5e' : '#10b981' }]}
              value={formatAmount(amount)} onChangeText={handleAmountChange} placeholder="0" keyboardType="numeric" autoFocus
              placeholderTextColor="#d1d5db" />
          </View>

          <TouchableOpacity style={styles.dateField} onPress={openDatePicker}>
            <Feather name="calendar" size={20} color="#6b7280" />
            <Text style={styles.dateFieldText}>{formatDateForInput(txDate, useShamsi)}</Text>
            <Feather name="chevron-down" size={16} color="#9ca3af" />
          </TouchableOpacity>

          <View style={styles.categorySection}>
            <Text style={styles.sectionLabel}>دسته‌بندی</Text>
            <View style={styles.categoryGrid}>
              {filteredCategories.map(cat => {
                const iconName = iconMap[cat.icon] || 'credit-card';
                const isSelected = categoryId === cat.id;
                return (
                  <TouchableOpacity key={cat.id} style={styles.categoryItem} onPress={() => setCategoryId(cat.id)} activeOpacity={0.7}>
                    <View style={[styles.categoryIcon, isSelected && { backgroundColor: cat.color }, !isSelected && styles.categoryIconInactive]}>
                      <Feather name={iconName} size={24} color={isSelected ? '#fff' : '#9ca3af'} />
                    </View>
                    <Text style={[styles.categoryName, isSelected && { color: '#1f2937', fontFamily: 'Vazirmatn_700Bold' }]} numberOfLines={1}>{cat.name}</Text>
                  </TouchableOpacity>
                );
              })}
              {filteredCategories.length === 0 && (
                <Text style={{ color: '#9ca3af', fontSize: 13, textAlign: 'center', padding: 20 }}>
                  دسته‌بندی‌ای برای این نوع وجود ندارد
                </Text>
              )}
            </View>
          </View>

          <View style={styles.noteSection}>
            <Text style={styles.sectionLabel}>توضیحات (اختیاری)</Text>
            <TextInput style={styles.noteInput} value={note} onChangeText={setNote}
              placeholder="مثلاً: خرید از فروشگاه رفاه..." />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={[styles.saveBtn, (!amount || !categoryId) && styles.saveBtnDisabled]}
            onPress={handleSave} disabled={!amount || !categoryId} activeOpacity={0.9}>
            <Text style={styles.saveBtnText}>{editingTx ? 'ذخیره تغییرات' : 'ثبت تراکنش'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={showDatePicker} transparent animationType="fade">
        <View style={styles.dpOverlay}>
          <View style={styles.dpContainer}>
            <Text style={styles.dpTitle}>انتخاب تاریخ</Text>
            <Text style={styles.dpSubtitle}>{useShamsi ? 'شمسی' : 'میلادی'}</Text>
            <View style={styles.dpRow}>
              <View style={styles.dpCol}>
                <TouchableOpacity onPress={() => setDpYear(dpYear + 1)}>
                  <Feather name="chevron-up" size={24} color="#2563eb" />
                </TouchableOpacity>
                <Text style={styles.dpValue}>{dpYear}</Text>
                <TouchableOpacity onPress={() => setDpYear(Math.max(dpYear - 1, 1300))}>
                  <Feather name="chevron-down" size={24} color="#2563eb" />
                </TouchableOpacity>
                <Text style={styles.dpLabel}>سال</Text>
              </View>
              <View style={styles.dpCol}>
                <TouchableOpacity onPress={() => setDpMonth(dpMonth % 12 + 1)}>
                  <Feather name="chevron-up" size={24} color="#2563eb" />
                </TouchableOpacity>
                <Text style={styles.dpValue}>{SHAMSI_MONTH_NAMES[dpMonth - 1]}</Text>
                <TouchableOpacity onPress={() => setDpMonth(dpMonth <= 1 ? 12 : dpMonth - 1)}>
                  <Feather name="chevron-down" size={24} color="#2563eb" />
                </TouchableOpacity>
                <Text style={styles.dpLabel}>ماه</Text>
              </View>
              <View style={styles.dpCol}>
                <TouchableOpacity onPress={() => setDpDay(Math.min(dpDay + 1, maxDay))}>
                  <Feather name="chevron-up" size={24} color="#2563eb" />
                </TouchableOpacity>
                <Text style={styles.dpValue}>{String(safeDay).padStart(2, '0')}</Text>
                <TouchableOpacity onPress={() => setDpDay(Math.max(dpDay - 1, 1))}>
                  <Feather name="chevron-down" size={24} color="#2563eb" />
                </TouchableOpacity>
                <Text style={styles.dpLabel}>روز</Text>
              </View>
            </View>
            <View style={styles.dpActions}>
              <TouchableOpacity style={styles.dpCancel} onPress={() => setShowDatePicker(false)}>
                <Text style={styles.dpCancelText}>انصراف</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dpConfirm} onPress={confirmDate}>
                <Text style={styles.dpConfirmText}>تایید</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { fontFamily: 'Vazirmatn_400Regular', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#f8fafc', zIndex: 100},
  container: { fontFamily: 'Vazirmatn_400Regular', flex: 1},
  header: { fontFamily: 'Vazirmatn_400Regular', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 48, paddingBottom: 16, backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  backBtn: { fontFamily: 'Vazirmatn_400Regular', padding: 8},
  headerTitle: { fontSize: 18, fontFamily: 'Vazirmatn_700Bold', color: '#1f2937' },
  body: { fontFamily: 'Vazirmatn_400Regular', flex: 1},
  bodyContent: { fontFamily: 'Vazirmatn_400Regular', padding: 24, paddingBottom: 120, gap: 32},

  typeToggle: { fontFamily: 'Vazirmatn_400Regular', flexDirection: 'row', backgroundColor: '#f3f4f6', borderRadius: 16, padding: 6},
  typeBtn: { fontFamily: 'Vazirmatn_400Regular', flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center'},
  typeBtnActiveExpense: { fontFamily: 'Vazirmatn_400Regular', backgroundColor: '#fff'},
  typeBtnActiveIncome: { fontFamily: 'Vazirmatn_400Regular', backgroundColor: '#fff'},
  typeBtnText: { fontSize: 14, fontFamily: 'Vazirmatn_700Bold', color: '#6b7280' },

  smsWidget: { fontFamily: 'Vazirmatn_400Regular', backgroundColor: '#fff', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#f3f4f6'},
  smsHeader: { fontFamily: 'Vazirmatn_400Regular', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  smsHeaderLeft: { fontFamily: 'Vazirmatn_400Regular', flexDirection: 'row', alignItems: 'center', gap: 8},
  smsIconBox: { fontFamily: 'Vazirmatn_400Regular', width: 32, height: 32, borderRadius: 12, backgroundColor: '#eef2ff', alignItems: 'center', justifyContent: 'center'},
  smsTitle: { fontSize: 14, fontFamily: 'Vazirmatn_700Bold', color: '#1f2937' },
  smsToggle: { fontSize: 12, fontFamily: 'Vazirmatn_700Bold', color: '#4f46e5' },
  smsBody: { fontFamily: 'Vazirmatn_400Regular', marginTop: 16, gap: 16},
  smsDesc: { fontFamily: 'Vazirmatn_400Regular', fontSize: 12, color: '#6b7280', lineHeight: 20},
  smsInputRow: { fontFamily: 'Vazirmatn_400Regular', position: 'relative'},
  smsInput: { fontFamily: 'Vazirmatn_400Regular', backgroundColor: '#f9fafb', borderRadius: 16, padding: 16, fontSize: 12, borderWidth: 1, borderColor: '#e5e7eb', minHeight: 80, textAlignVertical: 'top'},
  pasteBtn: { fontFamily: 'Vazirmatn_400Regular', position: 'absolute', left: 12, bottom: 12, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#eef2ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#e0e7ff'},
  pasteBtnText: { fontSize: 11, fontFamily: 'Vazirmatn_700Bold', color: '#4f46e5' },

  parsedPreview: { fontFamily: 'Vazirmatn_400Regular', backgroundColor: '#ecfdf5', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#a7f3d0', gap: 12},
  parsedHeader: { fontFamily: 'Vazirmatn_400Regular', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  parsedBank: { fontFamily: 'Vazirmatn_400Regular', flexDirection: 'row', alignItems: 'center', gap: 8},
  dot: { fontFamily: 'Vazirmatn_400Regular', width: 8, height: 8, borderRadius: 4},
  parsedBankName: { fontSize: 12, fontFamily: 'Vazirmatn_700Bold', color: '#064e3b' },
  parsedType: { fontSize: 10, fontFamily: 'Vazirmatn_700Bold', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, overflow: 'hidden' },
  parsedDetails: { fontFamily: 'Vazirmatn_400Regular', flexDirection: 'row', gap: 24},
  parsedLabel: { fontFamily: 'Vazirmatn_400Regular', fontSize: 10, color: '#6b7280', marginBottom: 2},
  parsedValue: { fontSize: 13, fontFamily: 'Vazirmatn_700Bold', color: '#1f2937' },
  applyBtn: { fontFamily: 'Vazirmatn_400Regular', backgroundColor: '#059669', borderRadius: 12, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6},
  applyBtnText: { fontSize: 12, fontFamily: 'Vazirmatn_700Bold', color: '#fff' },
  noParse: { fontFamily: 'Vazirmatn_400Regular', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fffbeb', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#fde68a'},
  noParseText: { fontSize: 11, color: '#92400e', fontFamily: 'Vazirmatn_500Medium' },

  smsCollapsed: { fontFamily: 'Vazirmatn_400Regular', flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12, backgroundColor: 'rgba(238,242,255,0.5)', borderRadius: 16, padding: 12},
  smsCollapsedText: { fontFamily: 'Vazirmatn_400Regular', flex: 1, fontSize: 12, color: '#6b7280', lineHeight: 18},
  openBtn: { fontFamily: 'Vazirmatn_400Regular', backgroundColor: '#4f46e5', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8},
  openBtnText: { fontSize: 11, fontFamily: 'Vazirmatn_700Bold', color: '#fff' },

  amountSection: { fontFamily: 'Vazirmatn_400Regular', alignItems: 'center', gap: 8},
  sectionLabel: { fontSize: 14, fontFamily: 'Vazirmatn_500Medium', color: '#9ca3af', alignSelf: 'flex-start' },
  amountInput: { fontSize: 48, fontFamily: 'Vazirmatn_700Bold', textAlign: 'center', width: '100%', paddingVertical: 8 },

  categorySection: { fontFamily: 'Vazirmatn_400Regular', gap: 12},
  categoryGrid: { fontFamily: 'Vazirmatn_400Regular', flexDirection: 'row', flexWrap: 'wrap', gap: 16},
  categoryItem: { fontFamily: 'Vazirmatn_400Regular', width: '22%', alignItems: 'center', gap: 6},
  categoryIcon: { fontFamily: 'Vazirmatn_400Regular', width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center'},
  categoryIconInactive: { fontFamily: 'Vazirmatn_400Regular', backgroundColor: '#fff', borderWidth: 1, borderColor: '#f3f4f6'},
  categoryName: { fontSize: 10, fontFamily: 'Vazirmatn_500Medium', color: '#6b7280', textAlign: 'center' },

  noteSection: { fontFamily: 'Vazirmatn_400Regular', gap: 8},
  noteInput: { fontFamily: 'Vazirmatn_400Regular', backgroundColor: '#fff', borderRadius: 16, padding: 16, fontSize: 14, borderWidth: 1, borderColor: '#e5e7eb'},

  dateField: { fontFamily: 'Vazirmatn_400Regular', flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  dateFieldText: { fontFamily: 'Vazirmatn_400Regular', flex: 1, fontSize: 16, color: '#1f2937', textAlign: 'center' },

  dpOverlay: { fontFamily: 'Vazirmatn_400Regular', flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 32 },
  dpContainer: { fontFamily: 'Vazirmatn_400Regular', backgroundColor: '#fff', borderRadius: 24, padding: 24, width: '100%', maxWidth: 340, alignItems: 'center' },
  dpTitle: { fontSize: 18, fontFamily: 'Vazirmatn_700Bold', color: '#1f2937', marginBottom: 4 },
  dpSubtitle: { fontSize: 11, color: '#9ca3af', fontFamily: 'Vazirmatn_500Medium', marginBottom: 20 },
  dpRow: { fontFamily: 'Vazirmatn_400Regular', flexDirection: 'row', gap: 24, marginBottom: 24 },
  dpCol: { fontFamily: 'Vazirmatn_400Regular', alignItems: 'center', gap: 8, minWidth: 80 },
  dpValue: { fontSize: 20, fontFamily: 'Vazirmatn_700Bold', color: '#1f2937', textAlign: 'center', minHeight: 30 },
  dpLabel: { fontSize: 11, color: '#9ca3af', fontFamily: 'Vazirmatn_500Medium' },
  dpActions: { fontFamily: 'Vazirmatn_400Regular', flexDirection: 'row', gap: 16, width: '100%' },
  dpCancel: { fontFamily: 'Vazirmatn_400Regular', flex: 1, paddingVertical: 14, borderRadius: 16, backgroundColor: '#f3f4f6', alignItems: 'center' },
  dpCancelText: { fontSize: 14, fontFamily: 'Vazirmatn_700Bold', color: '#6b7280' },
  dpConfirm: { fontFamily: 'Vazirmatn_400Regular', flex: 1, paddingVertical: 14, borderRadius: 16, backgroundColor: '#2563eb', alignItems: 'center' },
  dpConfirmText: { fontSize: 14, fontFamily: 'Vazirmatn_700Bold', color: '#fff' },

  footer: { fontFamily: 'Vazirmatn_400Regular', position: 'absolute', bottom: 0, width: '100%', padding: 24, paddingBottom: 32, backgroundColor: 'transparent'},
  saveBtn: { fontFamily: 'Vazirmatn_400Regular', backgroundColor: '#2563eb', borderRadius: 24, paddingVertical: 16, alignItems: 'center', shadowColor: '#2563eb', shadowOffset: { width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  saveBtnDisabled: { fontFamily: 'Vazirmatn_400Regular', backgroundColor: '#d1d5db'},
  saveBtnText: { fontSize: 18, fontFamily: 'Vazirmatn_700Bold', color: '#fff' },
});
