import React from 'react';
import { View, Text, TextInput, StyleSheet, TextStyle, ViewStyle, TextInputProps } from 'react-native';

interface CurrencyInputProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  value: string;
  onChangeAmount: (rawValue: string) => void;
  label?: string;
  placeholder?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  suffixStyle?: TextStyle;
  wrapperStyle?: ViewStyle;
}

export function formatWithSeparator(raw: string): string {
  const cleaned = raw.replace(/[^0-9]/g, '');
  if (!cleaned) return '';
  return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function cleanSeparators(formatted: string): string {
  return formatted.replace(/,/g, '');
}

export default function CurrencyInput({ value, onChangeAmount, label, placeholder, style, containerStyle, inputStyle, suffixStyle, wrapperStyle, ...rest }: CurrencyInputProps) {
  const displayValue = value ? formatWithSeparator(value) : '';

  const handleChange = (text: string) => {
    const raw = text.replace(/[^0-9]/g, '');
    onChangeAmount(raw);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputWrapper, wrapperStyle]}>
        <TextInput
          style={[styles.input, style, inputStyle]}
          value={displayValue}
          onChangeText={handleChange}
          placeholder={placeholder || '0'}
          placeholderTextColor="#9ca3af"
          keyboardType="numeric"
          {...rest}
        />
        <Text style={[styles.suffix, suffixStyle]}>تومان</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13, color: '#374151', fontFamily: 'Vazirmatn_700Bold', marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 14,
    height: 48,
  },
  input: {
    flex: 1, fontFamily: 'Vazirmatn_700Bold', fontSize: 18, color: '#1f2937',
    padding: 0, textAlign: 'right',
  },
  suffix: {
    fontSize: 13, color: '#9ca3af', fontFamily: 'Vazirmatn_500Medium', marginLeft: 8,
  },
});
