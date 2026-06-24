import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Feather } from '@expo/vector-icons';
import { useFinance } from '../context/FinanceContext';
import { TransactionType, ParentCategoryType, PARENT_CATEGORIES, COLOR_OPTIONS, CATEGORY_ICONS } from '../types';

const iconMap: Record<string, keyof typeof Feather.glyphMap> = {
  'credit-card': 'credit-card', monitor: 'monitor', gift: 'gift', coffee: 'coffee',
  truck: 'truck', 'shopping-bag': 'shopping-bag', home: 'home', 'file-text': 'file-text',
  film: 'film', activity: 'activity', zap: 'zap', bus: 'bus', plane: 'plane',
  phone: 'phone', heart: 'heart', circle: 'circle', book: 'book', briefcase: 'briefcase',
  camera: 'camera', cpu: 'cpu', headphones: 'headphones', 'map-pin': 'map-pin',
  music: 'music', server: 'server', smile: 'smile', star: 'star', sun: 'sun',
  tv: 'tv', umbrella: 'umbrella', user: 'user',
};

export default function SettingsScreen() {
  const {
    budgets, setCategoryBudget, categories, addCategory, deleteCategory,
    userProfile, updateUserProfile, getBackupData, importBackup,
    transactions, reminders,
  } = useFinance();

  const [activeTab, setActiveTab] = useState<'profile' | 'budgets' | 'categories' | 'backup'>('profile');
  const [catType, setCatType] = useState<TransactionType>('expense');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');

  const [tempProfile, setTempProfile] = useState(userProfile);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  const [isAddingCat, setIsAddingCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('credit-card');
  const [newCatColor, setNewCatColor] = useState(COLOR_OPTIONS[0]);
  const [newCatParent, setNewCatParent] = useState<ParentCategoryType>('essentials');

  const expenseCategories = categories.filter(c => c.type === 'expense');

  const handleExportBackup = async () => {
    try {
      const backupObj = getBackupData();
      const jsonString = JSON.stringify(backupObj, null, 2);
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '_');
      const fileUri = FileSystem.documentDirectory + `finance_backup_${dateStr}.json`;

      await FileSystem.writeAsStringAsync(fileUri, jsonString, { encoding: FileSystem.EncodingType.UTF8 });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, { mimeType: 'application/json' });
      } else {
        Alert.alert('موفق', `فایل پشتیبان ذخیره شد: ${fileUri}`);
      }
    } catch (e: any) {
      Alert.alert('خطا', e.message || 'خطا در تهیه نسخه پشتیبان.');
    }
  };

  const handleImportBackup = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
      if (result.canceled) return;

      const file = result.assets[0];
      const content = await FileSystem.readAsStringAsync(file.uri, { encoding: FileSystem.EncodingType.UTF8 });
      const parsed = JSON.parse(content);
      const success = importBackup(parsed);

      if (success) {
        setImportStatus({ type: 'success', message: 'اطلاعات با موفقیت بازگردانی شد!' });
      } else {
        setImportStatus({ type: 'error', message: 'فرمت فایل پشتیبان معتبر نیست.' });
      }
    } catch {
      setImportStatus({ type: 'error', message: 'خطا در خواندن فایل. مطمئن شوید فایل انتخابی یک فایل JSON معتبر است.' });
    }
  };

  const handleSaveProfile = () => {
    updateUserProfile(tempProfile);
    Alert.alert('موفق', 'پروفایل با موفقیت ذخیره شد.');
  };

  const handleSaveBudget = (id: string) => {
    const amt = Number(editAmount.replace(/\D/g, ''));
    setCategoryBudget(id, !isNaN(amt) && amt > 0 ? amt : 0);
    setEditingId(null);
  };

  const handleCreateCategory = () => {
    if (!newCatName.trim()) return;
    addCategory({
      name: newCatName.trim(), type: catType, icon: newCatIcon,
      color: newCatColor, parentCategoryId: catType === 'expense' ? newCatParent : undefined,
    });
    setNewCatName('');
    setIsAddingCat(false);
    setNewCatParent('essentials');
  };

  const renderProfileTab = () => (
    <View style={{ gap: 20 }}>
      <View style={styles.avatarSection}>
        <View style={styles.avatarBig}><Feather name="user" size={48} color="#2563eb" /></View>
        <Text style={{ fontSize: 13, color: '#6b7280' }}>اطلاعات حساب کاربری شما</Text>
      </View>
      <View>
        <Text style={styles.fieldLabel}>نام و نام خانوادگی</Text>
        <TextInput style={styles.fieldInput} value={tempProfile.name}
          onChangeText={t => setTempProfile({ ...tempProfile, name: t })} />
      </View>
      <View>
        <Text style={styles.fieldLabel}>شماره موبایل</Text>
        <TextInput style={[styles.fieldInput, { textAlign: 'left' }]} value={tempProfile.phone}
          onChangeText={t => setTempProfile({ ...tempProfile, phone: t })} placeholder="09xxxxxxxxx" keyboardType="phone-pad" />
      </View>
      <View>
        <Text style={styles.fieldLabel}>ایمیل</Text>
        <TextInput style={[styles.fieldInput, { textAlign: 'left' }]} value={tempProfile.email}
          onChangeText={t => setTempProfile({ ...tempProfile, email: t })} placeholder="user@example.com" keyboardType="email-address" />
      </View>
      <View style={styles.datePrefSection}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={styles.datePrefIcon}>
            <Feather name="calendar" size={20} color="#2563eb" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.datePrefLabel}>نوع تاریخ</Text>
            <Text style={styles.datePrefDesc}>{tempProfile.useShamsiDate ? 'شمسی (پیش‌فرض)' : 'میلادی (پیش‌فرض)'}</Text>
          </View>
          <TouchableOpacity style={[styles.dateToggleBtn, tempProfile.useShamsiDate && styles.dateToggleActive]}
            onPress={() => setTempProfile({ ...tempProfile, useShamsiDate: !tempProfile.useShamsiDate })}>
            <Text style={[styles.dateToggleText, tempProfile.useShamsiDate && styles.dateToggleTextActive]}>
              {tempProfile.useShamsiDate ? 'شمسی' : 'میلادی'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity style={styles.saveProfileBtn} onPress={handleSaveProfile}>
        <Text style={styles.saveProfileBtnText}>ذخیره تغییرات پروفایل</Text>
      </TouchableOpacity>
    </View>
  );

  const renderBudgetsTab = () => (
    <View style={{ gap: 24 }}>
      <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>تعیین سقف هزینه برای دسته‌های اصلی و زیرمجموعه‌ها در ماه جاری.</Text>

      <View style={{ gap: 12 }}>
        <Text style={styles.budgetSectionTitle}>بودجه‌بندی دسته‌های اصلی مادر</Text>
        {PARENT_CATEGORIES.map(pc => {
          const isEditing = editingId === pc.id;
          const currentBudget = budgets[pc.id] || 0;
          return (
            <View key={pc.id} style={[styles.budgetItem, { borderColor: '#dbeafe' }]}>
              <View style={styles.budgetNameRow}>
                <View style={[styles.budgetDot, { backgroundColor: pc.color }]} />
                <Text style={styles.budgetName}>{pc.name}</Text>
              </View>
              {isEditing ? (
                <View style={styles.budgetEditRow}>
                  <TextInput style={styles.budgetInput} value={editAmount}
                    onChangeText={t => setEditAmount(t.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ','))}
                    keyboardType="numeric" autoFocus />
                  <TouchableOpacity style={styles.budgetCheck} onPress={() => handleSaveBudget(pc.id)}>
                    <Feather name="check" size={18} color="#2563eb" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={[styles.budgetValue, currentBudget > 0 && styles.budgetValueSet]}
                  onPress={() => { setEditingId(pc.id); setEditAmount(currentBudget > 0 ? currentBudget.toLocaleString('en-US') : ''); }}>
                  <Text style={[styles.budgetValueText, currentBudget > 0 && { color: '#1d4ed8' }]}>
                    {currentBudget > 0 ? `${currentBudget.toLocaleString('en-US')} تومان` : 'تعریف بودجه'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </View>

      <View style={{ gap: 12 }}>
        <View style={styles.budgetSubHeader}>
          <Text style={styles.budgetSectionTitle}>بودجه‌بندی زیرمجموعه‌ها</Text>
          <View style={styles.budgetOptionalBadge}><Text style={{ fontSize: 10, color: '#9ca3af', fontFamily: 'Vazirmatn_500Medium' }}>اختیاری</Text></View>
        </View>
        {expenseCategories.map(cat => {
          const isEditing = editingId === cat.id;
          const currentBudget = budgets[cat.id] || 0;
          const iconName = iconMap[cat.icon] || 'credit-card';
          const parentName = PARENT_CATEGORIES.find(p => p.id === cat.parentCategoryId)?.name || 'سایر مخارج';
          return (
            <View key={cat.id} style={styles.budgetItem}>
              <View style={styles.budgetNameRow}>
                <View style={[styles.budgetSubIcon, { backgroundColor: cat.color + '26' }]}>
                  <Feather name={iconName} size={18} color={cat.color} />
                </View>
                <View>
                  <Text style={styles.budgetName}>{cat.name}</Text>
                  <Text style={{ fontSize: 10, color: '#9ca3af' }}>{parentName}</Text>
                </View>
              </View>
              {isEditing ? (
                <View style={styles.budgetEditRow}>
                  <TextInput style={[styles.budgetInput, { maxWidth: 100 }]} value={editAmount}
                    onChangeText={t => setEditAmount(t.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ','))}
                    keyboardType="numeric" autoFocus />
                  <TouchableOpacity style={styles.budgetCheck} onPress={() => handleSaveBudget(cat.id)}>
                    <Feather name="check" size={16} color="#2563eb" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={[styles.budgetValue, currentBudget > 0 && { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0' }]}
                  onPress={() => { setEditingId(cat.id); setEditAmount(currentBudget > 0 ? currentBudget.toLocaleString('en-US') : ''); }}>
                  <Text style={[styles.budgetValueText, currentBudget > 0 && { color: '#475569' }]}>
                    {currentBudget > 0 ? `${currentBudget.toLocaleString('en-US')} تومان` : 'بدون سقف'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );

  const renderCategoriesTab = () => (
    <View style={{ gap: 16 }}>
      <View style={styles.catTypeToggle}>
        <TouchableOpacity style={[styles.catTypeBtn, catType === 'expense' && styles.catTypeBtnExpense]}
          onPress={() => setCatType('expense')}>
          <Text style={[styles.catTypeBtnText, catType === 'expense' && { color: '#be123c' }]}>پرداختی (هزینه)</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.catTypeBtn, catType === 'income' && styles.catTypeBtnIncome]}
          onPress={() => setCatType('income')}>
          <Text style={[styles.catTypeBtnText, catType === 'income' && { color: '#047857' }]}>دریافتی (درآمد)</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.addCatBtn} onPress={() => { setIsAddingCat(true); setNewCatName(''); }}>
        <Feather name="plus" size={20} color="#6b7280" />
        <Text style={{ color: '#6b7280', fontFamily: 'Vazirmatn_700Bold', fontSize: 14 }}>دسته‌بندی جدید</Text>
      </TouchableOpacity>

      {categories.filter(c => c.type === catType).map(cat => {
        const iconName = iconMap[cat.icon] || 'credit-card';
        const parentName = cat.type === 'expense' ? PARENT_CATEGORIES.find(p => p.id === cat.parentCategoryId)?.name : null;
        return (
          <View key={cat.id} style={styles.catItem}>
            <View style={styles.catItemLeft}>
              <View style={[styles.catItemIcon, { backgroundColor: cat.color + '26' }]}>
                <Feather name={iconName} size={22} color={cat.color} />
              </View>
              <View>
                <Text style={styles.catItemName}>{cat.name}</Text>
                {parentName && <Text style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'Vazirmatn_500Medium' }}>دسته اصلی: {parentName}</Text>}
              </View>
            </View>
            <TouchableOpacity onPress={() => deleteCategory(cat.id)}>
              <Feather name="trash-2" size={18} color="#f43f5e" />
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );

  const renderBackupTab = () => (
    <View style={{ gap: 24, paddingBottom: 40 }}>
      <View style={styles.backupIntroCard}>
        <View style={styles.backupIntroDeco} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Feather name="database" size={24} color="#bfdbfe" />
          <Text style={{ fontFamily: 'Vazirmatn_700Bold', fontSize: 14, color: '#fff' }}>نسخه پشتیبان و همگام‌سازی</Text>
        </View>
        <Text style={{ fontSize: 12, color: 'rgba(219,234,254,0.9)', lineHeight: 20 }}>
          تمام تراکنش‌ها، دسته‌بندی‌ها، اهداف بودجه‌بندی و تنظیمات حساب شما به صورت آفلاین در این گوشی ذخیره می‌شوند.
        </Text>
      </View>

      <View style={styles.backupCard}>
        <View style={styles.backupCardHeader}>
          <Feather name="download" size={16} color="#2563eb" />
          <Text style={{ fontFamily: 'Vazirmatn_700Bold', fontSize: 14, color: '#1f2937' }}>پشتیبان‌گیری (تهیه خروجی)</Text>
        </View>
        <Text style={{ fontSize: 12, color: '#6b7280', lineHeight: 18 }}>یک فایل حاوی تمام اطلاعات مالی ثبت‌شده شما دانلود خواهد شد.</Text>
        <View style={styles.backupStats}>
          {[
            ['کل تراکنش‌ها:', transactions.length.toLocaleString('fa-IR')],
            ['دسته‌ها:', categories.length.toLocaleString('fa-IR')],
            ['بودجه‌ها:', Object.keys(budgets).length.toLocaleString('fa-IR')],
            ['یادآورها:', reminders.length.toLocaleString('fa-IR')],
          ].map(([label, value], i) => (
            <View key={i} style={styles.backupStatRow}>
              <Text style={{ color: '#6b7280', fontSize: 12 }}>{label}</Text>
              <Text style={{ fontFamily: 'Vazirmatn_700Bold', color: '#1f2937', fontSize: 12 }}>{value}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity style={styles.exportBtn} onPress={handleExportBackup}>
          <Feather name="download" size={16} color="#fff" />
          <Text style={{ color: '#fff', fontFamily: 'Vazirmatn_700Bold', fontSize: 12 }}>دانلود فایل نسخه پشتیبان</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.backupCard}>
        <View style={styles.backupCardHeader}>
          <Feather name="upload" size={16} color="#4f46e5" />
          <Text style={{ fontFamily: 'Vazirmatn_700Bold', fontSize: 14, color: '#1f2937' }}>بازگردانی اطلاعات (وارد کردن)</Text>
        </View>
        <Text style={{ fontSize: 12, color: '#6b7280', lineHeight: 18 }}>با آپلود فایل پشتیبان قبلی (فرمت .json)، اطلاعات شما جایگزین خواهند شد.</Text>
        <TouchableOpacity style={styles.importBtn} onPress={handleImportBackup}>
          <Feather name="upload" size={24} color="#4f46e5" />
          <View>
            <Text style={{ color: '#374151', fontFamily: 'Vazirmatn_700Bold', fontSize: 12 }}>کلیک کنید تا فایل انتخاب کنید</Text>
            <Text style={{ color: '#9ca3af', fontSize: 10, marginTop: 2 }}>فرمت فایل باید حتماً .json باشد</Text>
          </View>
        </TouchableOpacity>

        {importStatus.type && (
          <View style={[styles.importStatus, {
            backgroundColor: importStatus.type === 'success' ? '#ecfdf5' : '#fef2f2',
            borderColor: importStatus.type === 'success' ? '#a7f3d0' : '#fecaca',
          }]}>
            <View style={[styles.importStatusDot, {
              backgroundColor: importStatus.type === 'success' ? '#10b981' : '#ef4444',
            }]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.importStatusTitle, {
                color: importStatus.type === 'success' ? '#064e3b' : '#991b1b',
              }]}>
                {importStatus.type === 'success' ? 'عملیات موفق' : 'عملیات ناموفق'}
              </Text>
              <Text style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{importStatus.message}</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );

  if (isAddingCat) {
    return (
      <View style={styles.addCatOverlay}>
        <View style={styles.addCatHeader}>
          <Text style={{ fontSize: 18, fontFamily: 'Vazirmatn_700Bold', color: '#1f2937' }}>ایجاد دسته‌بندی جدید</Text>
          <TouchableOpacity onPress={() => setIsAddingCat(false)}>
            <Feather name="x" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, gap: 24, paddingBottom: 120 }}>
          <View>
            <Text style={styles.fieldLabel}>نام دسته‌بندی</Text>
            <TextInput style={styles.fieldInput} value={newCatName} onChangeText={setNewCatName}
              placeholder="مثلاً: اقساط خودرو، تفریح..." />
          </View>

          {catType === 'expense' && (
            <View style={{ gap: 12 }}>
              <Text style={styles.fieldLabel}>دسته اصلی مادر</Text>
              {PARENT_CATEGORIES.map(pc => (
                <TouchableOpacity key={pc.id} style={[styles.parentSelect, newCatParent === pc.id && styles.parentSelectActive]}
                  onPress={() => setNewCatParent(pc.id)}>
                  <Text style={[styles.parentSelectText, newCatParent === pc.id && { color: '#1d4ed8', fontFamily: 'Vazirmatn_700Bold' }]}>{pc.name}</Text>
                  {newCatParent === pc.id && <Feather name="check" size={18} color="#2563eb" />}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={{ gap: 12 }}>
            <Text style={styles.fieldLabel}>رنگ</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {COLOR_OPTIONS.map(color => (
                <TouchableOpacity key={color} style={[styles.colorOption, { backgroundColor: color }, newCatColor === color && styles.colorOptionActive]}
                  onPress={() => setNewCatColor(color)} />
              ))}
            </View>
          </View>

          <View style={{ gap: 12 }}>
            <Text style={styles.fieldLabel}>آیکون</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {CATEGORY_ICONS.map(iconStr => {
                const IconComp = iconMap[iconStr];
                const isSelected = newCatIcon === iconStr;
                return (
                  <TouchableOpacity key={iconStr} style={[styles.iconOption, isSelected && { backgroundColor: newCatColor + '20' }]}
                    onPress={() => setNewCatIcon(iconStr)}>
                    {IconComp && <Feather name={IconComp} size={22} color={isSelected ? newCatColor : '#6b7280'} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>

        <View style={styles.addCatFooter}>
          <TouchableOpacity style={[styles.addCatSaveBtn, !newCatName.trim() && { backgroundColor: '#d1d5db' }]}
            onPress={handleCreateCategory} disabled={!newCatName.trim()}>
            <Text style={{ color: '#fff', fontFamily: 'Vazirmatn_700Bold', fontSize: 16 }}>ذخیره دسته‌بندی</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f1f5f9' }}>
      <View style={styles.settingsHeader}>
        <Text style={{ fontSize: 20, fontFamily: 'Vazirmatn_700Bold', color: '#1f2937' }}>تنظیمات</Text>
        <View style={styles.tabBar}>
          {(['profile', 'budgets', 'categories', 'backup'] as const).map(tab => (
            <TouchableOpacity key={tab} style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab)}>
              <Text style={[styles.tabBtnText, activeTab === tab && styles.tabBtnTextActive]}>
                {tab === 'profile' ? 'پروفایل' : tab === 'budgets' ? 'بودجه' : tab === 'categories' ? 'دسته‌ها' : 'پشتیبان‌گیری'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 140 }}>
        {activeTab === 'profile' && renderProfileTab()}
        {activeTab === 'budgets' && renderBudgetsTab()}
        {activeTab === 'categories' && renderCategoriesTab()}
        {activeTab === 'backup' && renderBackupTab()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  settingsHeader: { fontFamily: 'Vazirmatn_400Regular', backgroundColor: '#f1f5f9', paddingTop: 48, paddingHorizontal: 24, paddingBottom: 8},
  tabBar: { fontFamily: 'Vazirmatn_400Regular', flexDirection: 'row', backgroundColor: '#e5e7eb', borderRadius: 16, padding: 4, marginTop: 16, gap: 4},
  tabBtn: { fontFamily: 'Vazirmatn_400Regular', flex: 1, paddingVertical: 8, borderRadius: 12, alignItems: 'center'},
  tabBtnActive: { fontFamily: 'Vazirmatn_400Regular', backgroundColor: '#fff'},
  tabBtnText: { fontSize: 11, fontFamily: 'Vazirmatn_700Bold', color: '#6b7280' },
  tabBtnTextActive: { color: '#1f2937'},

  avatarSection: { fontFamily: 'Vazirmatn_400Regular', alignItems: 'center', gap: 12, marginBottom: 8},
  avatarBig: { fontFamily: 'Vazirmatn_400Regular', width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(219,234,254,0.5)', alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: '#fff'},
  fieldLabel: { fontSize: 12, fontFamily: 'Vazirmatn_700Bold', color: '#1f2937', marginBottom: 8 },
  fieldInput: { backgroundColor: '#fff', borderRadius: 12, padding: 12, fontSize: 14, fontFamily: 'Vazirmatn_500Medium', borderWidth: 1, borderColor: '#e5e7eb' },
  saveProfileBtn: { fontFamily: 'Vazirmatn_400Regular', backgroundColor: '#2563eb', borderRadius: 12, paddingVertical: 14, alignItems: 'center', shadowColor: '#2563eb', shadowOffset: { width: 0, height: 4}, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  saveProfileBtnText: { color: '#fff', fontFamily: 'Vazirmatn_700Bold', fontSize: 14 },

  budgetSectionTitle: { fontSize: 14, fontFamily: 'Vazirmatn_700Bold', color: '#1f2937', borderLeftWidth: 4, borderLeftColor: '#3b82f6', paddingLeft: 8 },
  budgetSubHeader: { fontFamily: 'Vazirmatn_400Regular', flexDirection: 'row', alignItems: 'center', gap: 8},
  budgetOptionalBadge: { fontFamily: 'Vazirmatn_400Regular', backgroundColor: 'rgba(229,231,235,0.6)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12},
  budgetItem: { fontFamily: 'Vazirmatn_400Regular', backgroundColor: '#fff', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#f3f4f6'},
  budgetNameRow: { fontFamily: 'Vazirmatn_400Regular', flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1},
  budgetDot: { fontFamily: 'Vazirmatn_400Regular', width: 24, height: 24, borderRadius: 12},
  budgetSubIcon: { fontFamily: 'Vazirmatn_400Regular', width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center'},
  budgetName: { fontSize: 13, fontFamily: 'Vazirmatn_700Bold', color: '#1f2937' },
  budgetEditRow: { fontFamily: 'Vazirmatn_400Regular', flexDirection: 'row', alignItems: 'center', gap: 8},
  budgetInput: { backgroundColor: '#f9fafb', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13, fontFamily: 'Vazirmatn_700Bold', borderWidth: 1, borderColor: '#e5e7eb', textAlign: 'left', minWidth: 80 },
  budgetCheck: { fontFamily: 'Vazirmatn_400Regular', padding: 8, backgroundColor: '#eff6ff', borderRadius: 12},
  budgetValue: { fontFamily: 'Vazirmatn_400Regular', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: '#f9fafb'},
  budgetValueSet: { fontFamily: 'Vazirmatn_400Regular', backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#bfdbfe'},
  budgetValueText: { fontSize: 12, fontFamily: 'Vazirmatn_700Bold', color: '#9ca3af' },

  catTypeToggle: { fontFamily: 'Vazirmatn_400Regular', flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 4, borderWidth: 1, borderColor: '#e5e7eb'},
  catTypeBtn: { fontFamily: 'Vazirmatn_400Regular', flex: 1, paddingVertical: 6, borderRadius: 8, alignItems: 'center'},
  catTypeBtnExpense: { fontFamily: 'Vazirmatn_400Regular', backgroundColor: '#ffe4e6'},
  catTypeBtnIncome: { fontFamily: 'Vazirmatn_400Regular', backgroundColor: '#d1fae5'},
  catTypeBtnText: { fontSize: 12, fontFamily: 'Vazirmatn_700Bold', color: '#6b7280' },
  addCatBtn: { fontFamily: 'Vazirmatn_400Regular', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderWidth: 2, borderStyle: 'dashed', borderColor: '#d1d5db', borderRadius: 16},
  catItem: { fontFamily: 'Vazirmatn_400Regular', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: '#f3f4f6'},
  catItemLeft: { fontFamily: 'Vazirmatn_400Regular', flexDirection: 'row', alignItems: 'center', gap: 12},
  catItemIcon: { fontFamily: 'Vazirmatn_400Regular', width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center'},
  catItemName: { fontSize: 15, fontFamily: 'Vazirmatn_700Bold', color: '#1f2937' },

  backupIntroCard: { fontFamily: 'Vazirmatn_400Regular', backgroundColor: '#4f46e5', borderRadius: 24, padding: 20, overflow: 'hidden'},
  backupIntroDeco: { fontFamily: 'Vazirmatn_400Regular', position: 'absolute', right: 0, bottom: 0, width: 128, height: 128, borderRadius: 64, backgroundColor: 'rgba(255,255,255,0.05)'},
  backupCard: { fontFamily: 'Vazirmatn_400Regular', backgroundColor: '#fff', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#f3f4f6', gap: 16},
  backupCardHeader: { fontFamily: 'Vazirmatn_400Regular', flexDirection: 'row', alignItems: 'center', gap: 8},
  backupStats: { fontFamily: 'Vazirmatn_400Regular', backgroundColor: 'rgba(249,250,251,0.8)', borderRadius: 16, padding: 16, gap: 12},
  backupStatRow: { fontFamily: 'Vazirmatn_400Regular', flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: 'rgba(243,244,246,0.5)', paddingBottom: 8},
  exportBtn: { fontFamily: 'Vazirmatn_400Regular', backgroundColor: '#2563eb', borderRadius: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8},
  importBtn: { fontFamily: 'Vazirmatn_400Regular', borderWidth: 2, borderStyle: 'dashed', borderColor: '#d1d5db', borderRadius: 24, padding: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: 'rgba(249,250,251,0.5)'},
  importStatus: { fontFamily: 'Vazirmatn_400Regular', flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 16, borderRadius: 16, borderWidth: 1},
  importStatusDot: { fontFamily: 'Vazirmatn_400Regular', width: 20, height: 20, borderRadius: 10, marginTop: 2},
  importStatusTitle: { fontFamily: 'Vazirmatn_700Bold', fontSize: 12 },

  datePrefSection: { fontFamily: 'Vazirmatn_400Regular', backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  datePrefIcon: { fontFamily: 'Vazirmatn_400Regular', width: 40, height: 40, borderRadius: 12, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' },
  datePrefLabel: { fontSize: 14, fontFamily: 'Vazirmatn_700Bold', color: '#1f2937' },
  datePrefDesc: { fontSize: 11, color: '#9ca3af', fontFamily: 'Vazirmatn_500Medium', marginTop: 2 },
  dateToggleBtn: { fontFamily: 'Vazirmatn_400Regular', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e5e7eb' },
  dateToggleActive: { fontFamily: 'Vazirmatn_400Regular', backgroundColor: '#2563eb', borderColor: '#2563eb' },
  dateToggleText: { fontSize: 12, fontFamily: 'Vazirmatn_700Bold', color: '#6b7280' },
  dateToggleTextActive: { fontFamily: 'Vazirmatn_400Regular', color: '#fff' },
  addCatOverlay: { fontFamily: 'Vazirmatn_400Regular', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#fff', zIndex: 100},
  addCatHeader: { fontFamily: 'Vazirmatn_400Regular', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 48, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6'},
  parentSelect: { fontFamily: 'Vazirmatn_400Regular', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 16, borderWidth: 2, borderColor: '#f3f4f6', backgroundColor: '#f9fafb'},
  parentSelectActive: { fontFamily: 'Vazirmatn_400Regular', borderColor: '#3b82f6', backgroundColor: 'rgba(239,246,255,0.5)'},
  parentSelectText: { fontSize: 12, fontFamily: 'Vazirmatn_700Bold', color: '#6b7280' },
  colorOption: { fontFamily: 'Vazirmatn_400Regular', width: 40, height: 40, borderRadius: 20},
  colorOptionActive: { fontFamily: 'Vazirmatn_400Regular', borderWidth: 3, borderColor: '#1f2937', transform: [{ scale: 1.1}] },
  iconOption: { fontFamily: 'Vazirmatn_400Regular', width: 52, height: 52, borderRadius: 16, backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center'},
  addCatFooter: { fontFamily: 'Vazirmatn_400Regular', position: 'absolute', bottom: 0, width: '100%', padding: 24, paddingBottom: 32},
  addCatSaveBtn: { fontFamily: 'Vazirmatn_400Regular', backgroundColor: '#111827', borderRadius: 24, paddingVertical: 16, alignItems: 'center'},
});
