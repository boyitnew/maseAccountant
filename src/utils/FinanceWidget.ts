import { NativeModules } from 'react-native';

const { FinanceWidget } = NativeModules;

export function updateWidget(data: { balance: string; income: string; expense: string }) {
  if (FinanceWidget) {
    FinanceWidget.updateWidget(data);
  }
}
