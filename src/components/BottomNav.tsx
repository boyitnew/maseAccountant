import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

export type ViewName = 'home' | 'reports' | 'add' | 'settings' | 'reminders';

interface BottomNavProps {
  currentView: ViewName;
  onChange: (view: ViewName) => void;
}

const tabs: { fontFamily: 'Vazirmatn_400Regular', key: ViewName; label: string; icon: keyof typeof Feather.glyphMap}[] = [
  { key: 'home', label: 'خانه', icon: 'home' },
  { key: 'reports', label: 'گزارش‌ها', icon: 'pie-chart' },
  { key: 'add', label: '', icon: 'plus' },
  { key: 'reminders', label: 'یادآور', icon: 'bell' },
  { key: 'settings', label: 'تنظیمات', icon: 'settings' },
];

export default function BottomNav({ currentView, onChange }: BottomNavProps) {
  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <TouchableOpacity style={styles.tab} onPress={() => onChange('home')}>
          <Feather name="home" size={24} color={currentView === 'home' ? '#2563eb' : '#9ca3af'} />
          <Text style={[styles.label, currentView === 'home' && styles.activeLabel]}>خانه</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tab} onPress={() => onChange('reports')}>
          <Feather name="pie-chart" size={24} color={currentView === 'reports' ? '#2563eb' : '#9ca3af'} />
          <Text style={[styles.label, currentView === 'reports' && styles.activeLabel]}>گزارش‌ها</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.addButton} onPress={() => onChange('add')} activeOpacity={0.8}>
          <Feather name="plus" size={32} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.tab} onPress={() => onChange('reminders')}>
          <Feather name="bell" size={24} color={currentView === 'reminders' ? '#2563eb' : '#9ca3af'} />
          <Text style={[styles.label, currentView === 'reminders' && styles.activeLabel]}>یادآور</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tab} onPress={() => onChange('settings')}>
          <Feather name="settings" size={24} color={currentView === 'settings' ? '#2563eb' : '#9ca3af'} />
          <Text style={[styles.label, currentView === 'settings' && styles.activeLabel]}>تنظیمات</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { fontFamily: 'Vazirmatn_400Regular', position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10},
    shadowOpacity: 0.05,
    shadowRadius: 40,
    elevation: 10,
    zIndex: 50,
  },
  inner: { fontFamily: 'Vazirmatn_400Regular', flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,},
  tab: { fontFamily: 'Vazirmatn_400Regular', alignItems: 'center',
    gap: 4,
    padding: 8,},
  label: {
    fontSize: 10,
    fontFamily: 'Vazirmatn_500Medium',
    color: '#9ca3af',
  },
  activeLabel: { color: '#2563eb',},
  addButton: { fontFamily: 'Vazirmatn_400Regular', width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#f8fafc',
  },
});
