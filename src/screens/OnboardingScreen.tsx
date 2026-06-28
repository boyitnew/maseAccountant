import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFinance } from '../context/FinanceContext';

export default function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const { updateUserProfile } = useFinance();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(0);

  const handleDone = () => {
    if (!name.trim()) return;
    updateUserProfile({ name: name.trim(), phone: phone.trim(), email: email.trim() });
    onDone();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.appName}>حسابدار من</Text>
          <Text style={styles.tagline}>مدیریت مالی هوشمند</Text>
        </View>

        {step === 0 && (
          <View style={styles.formSection}>
            <View style={styles.iconContainer}>
              <Feather name="user" size={56} color="#4f46e5" />
            </View>
            <Text style={styles.formTitle}>به حسابدار من خوش آمدید!</Text>
            <Text style={styles.formDesc}>
              برای شروع، لطفاً نام خود را وارد کنید.
            </Text>
            <TextInput
              style={[styles.fieldInput, !name.trim() && styles.fieldInputError]}
              value={name}
              onChangeText={setName}
              placeholder="نام و نام خانوادگی"
              placeholderTextColor="#9ca3af"
              autoFocus
            />
            {!name.trim() && <Text style={styles.hintText}>* نام الزامی است</Text>}
            <TouchableOpacity
              style={[styles.nextBtn, !name.trim() && styles.nextBtnDisabled]}
              onPress={() => { if (name.trim()) setStep(1); }}
              activeOpacity={0.8}>
              <Text style={styles.nextBtnText}>ادامه</Text>
              <Feather name="arrow-left" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {step === 1 && (
          <View style={styles.formSection}>
            <View style={styles.iconContainer}>
              <Feather name="smartphone" size={56} color="#4f46e5" />
            </View>
            <Text style={styles.formTitle}>اطلاعات تکمیلی</Text>
            <Text style={styles.formDesc}>
              می‌توانید شماره موبایل و ایمیل خود را وارد کنید (اختیاری).
            </Text>
            <TextInput
              style={styles.fieldInput}
              value={phone}
              onChangeText={setPhone}
              placeholder="شماره موبایل (اختیاری)"
              placeholderTextColor="#9ca3af"
              keyboardType="phone-pad"
            />
            <TextInput
              style={styles.fieldInput}
              value={email}
              onChangeText={setEmail}
              placeholder="ایمیل (اختیاری)"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
            />
            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.skipBtn} onPress={() => setStep(0)} activeOpacity={0.7}>
                <Feather name="arrow-right" size={20} color="#6b7280" />
                <Text style={styles.skipBtnText}>قبلی</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.nextBtn} onPress={handleDone} activeOpacity={0.8}>
                <Text style={styles.nextBtnText}>شروع کنید!</Text>
                <Feather name="arrow-left" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <View style={styles.pagination}>
        {[0, 1].map(i => (
          <View key={i} style={[styles.dot, step === i && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  appName: {
    fontSize: 36,
    fontFamily: 'Vazirmatn_900Black',
    color: '#4f46e5',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    fontFamily: 'Vazirmatn_500Medium',
    color: '#6b7280',
  },
  formSection: {
    gap: 16,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(219,234,254,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 8,
  },
  formTitle: {
    fontSize: 22,
    fontFamily: 'Vazirmatn_700Bold',
    color: '#1f2937',
    textAlign: 'center',
  },
  formDesc: {
    fontSize: 13,
    fontFamily: 'Vazirmatn_400Regular',
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  fieldInput: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Vazirmatn_500Medium',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  fieldInputError: {
    borderColor: '#fca5a5',
  },
  hintText: {
    fontSize: 11,
    color: '#ef4444',
    fontFamily: 'Vazirmatn_500Medium',
    marginTop: -8,
  },
  nextBtn: {
    backgroundColor: '#4f46e5',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  nextBtnDisabled: {
    backgroundColor: '#d1d5db',
  },
  nextBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Vazirmatn_700Bold',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  skipBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  skipBtnText: {
    color: '#6b7280',
    fontSize: 16,
    fontFamily: 'Vazirmatn_700Bold',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: 48,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d1d5db',
  },
  dotActive: {
    width: 24,
    backgroundColor: '#4f46e5',
  },
});
