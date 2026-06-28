import { NativeModules, Platform } from 'react-native';

interface SmsBridgeInterface {
  getPendingSmsData: () => Promise<{ data: string; type: string } | null>;
  clearPendingSms: () => void;
}

const SmsBridge: SmsBridgeInterface = Platform.OS === 'android'
  ? (NativeModules.SmsBridge as SmsBridgeInterface)
  : { getPendingSmsData: async () => null, clearPendingSms: () => {} };

export default SmsBridge;

export interface ParsedSmsData {
  bankName: string;
  amount: number;
  type: 'income' | 'expense';
  cardSuffix: string;
  message: string;
  sender: string;
  timestamp: number;
}

export async function getPendingSms(): Promise<{ data: ParsedSmsData; actionType: string } | null> {
  try {
    const result = await SmsBridge.getPendingSmsData();
    if (!result || !result.data) return null;
    const parsed: ParsedSmsData = JSON.parse(result.data);
    return { data: parsed, actionType: result.type };
  } catch {
    return null;
  }
}

export function clearPendingSms(): void {
  try {
    SmsBridge.clearPendingSms();
  } catch {}
}
