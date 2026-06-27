# maseAccountant — حسابدار شخصی من

A fully offline Persian personal finance manager mobile app built with **Expo (React Native)**.

یک اپلیکیشن مدیریت مالی شخصی به زبان فارسی، کاملاً آفلاین و بدون نیاز به سرور.

---

## Features / قابلیت‌ها

### English
- **Dashboard**: View total balance, monthly income/expense, multi-account strip, savings goals preview, daily calendar with per-day transactions, budget detail modal
- **Multiple Accounts**: Manage bank accounts, cash, cards, e-wallets with per-account balance tracking
- **Add Transaction**: Manual entry with account selector, auto-parse from bank SMS (supports 14 Persian banks), recurring transaction support
- **Reports**: Period filter (1/3/6 months), account filter, bar/line chart toggle, income breakdown, net savings
- **Budget Management**: Set spending limits per category, get warnings at 80% and 100%
- **Savings Goals**: Create goals with target amount, track progress, contribute from balance
- **Debt Tracking**: Record debts with due dates, track payments, mark as paid
- **Recurring Transactions**: Daily/weekly/monthly/yearly with custom intervals
- **Payment Reminders**: Recurring monthly reminders for bills, rent, installments (uses local push notifications)
- **PIN & Biometric Lock**: 4-digit PIN with biometric fallback (fingerprint/face)
- **Android Widget**: Home screen widget showing balance, income, expense
- **Categories**: Fully customizable expense/income categories with icons and colors
- **Full Backup/Restore**: Export all data as JSON file, share to Google Drive — 100% offline
- **Persian & RTL**: Vazirmatn font, right-to-left layout, Persian date (Jalali), Persian number formatting
- **App Icon**: Custom indigo gradient icon with geometric overlays

### فارسی
- **داشبورد**: نمایش موجودی کل، درآمد و هزینه ماه، نوار حساب‌ها، پیش‌نمایش اهداف، تقویم با تراکنش‌های روزانه
- **حساب‌های متعدد**: مدیریت حساب بانکی، کیف پول، کارت، کیف پول الکترونیک با مانده هر حساب
- **ثبت تراکنش**: ورود دستی با انتخاب حساب، پردازش خودکار پیامک بانکی (۱۴ بانک)، تراکنش دوره‌ای
- **گزارش‌ها**: فیلتر بازه زمانی و حساب، نمودار خطی/میله‌ای، تفکیک درآمد
- **مدیریت بودجه**: تعیین سقف هزینه برای هر دسته، هشدار در ۸۰٪ و ۱۰۰٪
- **اهداف پس‌انداز**: تعیین هدف، پیگیری پیشرفت، واریز از موجودی
- **مدیریت بدهی**: ثبت بدهی با سررسید، پیگیری پرداخت، علامت پرداخت شده
- **تراکنش دوره‌ای**: روزانه/هفتگی/ماهیانه/سالیانه با فاصله دلخواه
- **یادآور پرداخت**: یادآور برای قبوض، اجاره، اقساط (با نوتیفیکیشن)
- **قفل PIN و اثر انگشت**: رمز ۴ رقمی با پشتیبانی از اثر انگشت و تشخیص چهره
- **ویجت اندروید**: ویجت صفحه اصلی با نمایش موجودی، درآمد و هزینه
- **دسته‌بندی**: دسته‌بندی کاملاً قابل شخصی‌سازی با آیکون و رنگ
- **پشتیبان‌گیری**: خروجی JSON، اشتراک با Google Drive — کاملاً آفلاین
- **فارسی و راست‌چین**: فونت وزیرمتن، راست‌چین، تاریخ شمسی، اعداد فارسی
- **آیکون اختصاصی**: آیکون گرادینت نیلی با طراحی هندسی

---

## Screenshots / تصاویر

| Home / صفحه اصلی | Add / ثبت تراکنش | Reports / گزارش‌ها |
|---|---|---|
| ![home](docs/screenshots/home.png) | ![add](docs/screenshots/add.png) | ![reports](docs/screenshots/reports.png) |

*(Screenshots coming soon — تصاویر به زودی اضافه می‌شوند)*

---

## Tech Stack / فناوری‌ها

| Component | Technology |
|---|---|
| Framework | [Expo](https://expo.dev) 52 + [React Native](https://reactnative.dev) 0.76 |
| Language | TypeScript |
| Font | [Vazirmatn](https://github.com/rastikerdar/vazirmatn) (via `@expo-google-fonts/vazirmatn`) |
| Charts | react-native-chart-kit + react-native-svg |
| Storage | AsyncStorage (offline, on-device) |
| Notifications | expo-notifications |
| Biometric | expo-local-authentication |
| Build | Gradle (local) / EAS Build (cloud) |
| Lock Screen | expo-local-authentication + custom PIN pad |
| Widget | Kotlin + RemoteViews + React Native bridge |

---

## Build & Release

### ⚠️ Note: GitHub Actions is disabled for this repository
GitHub Actions is currently disabled for this repo. Releases are built locally and uploaded manually.

**مهم:** قابلیت GitHub Actions برای این مخزن غیرفعال است. خروجی‌ها به صورت محلی ساخته و به صورت دستی در بخش ریلیزها قرار می‌گیرند.

### Prerequisites / پیش‌نیازها
- Node.js 20+
- Java 17+
- Android SDK (with NDK 27.3+ and CMake 3.30+)
- An Android device or emulator

### Build APK & AAB / ساخت APK و AAB

```bash
# 1. Clone / کلون کردن
git clone https://github.com/boyitnew/maseAccountant.git
cd maseAccountant

# 2. Install dependencies / نصب وابستگی‌ها
npm ci

# 3. Generate Android project / تولید پروژه اندروید
npx expo prebuild --platform android --clean

# 4. Build APK / ساخت APK
cd android
$env:CMAKE_VERSION = "3.31.5"  # Windows PowerShell
# export CMAKE_VERSION=3.31.5  # Linux/macOS
./gradlew assembleRelease

# 5. Build AAB for Google Play / ساخت AAB برای گوگل پلی
./gradlew bundleRelease

# Outputs:
# APK: android/app/build/outputs/apk/release/*.apk
# AAB: android/app/build/outputs/bundle/release/app-release.aab
```

> **Note:** On environments with read-only SDK, set `local.properties`:
> ```
> sdk.dir=C:/Android/android-sdk
> cmake.dir=C:/Android/android-sdk/cmake/3.31.5
> ndk.dir=C:/Android/android-sdk/ndk/27.3.13750724
> ```
> Also set `CMAKE_VERSION` environment variable to match your installed CMake version.

### Output Files / فایل‌های خروجی

| File | Size | Description |
|---|---|---|
| `app-arm64-v8a-release.apk` | ~32 MB | **Recommended for modern phones** (2020+) |
| `app-armeabi-v7a-release.apk` | ~27 MB | Older phones (pre-2020) |
| `app-x86_64-release.apk` | ~32 MB | 64-bit emulators |
| `app-x86-release.apk` | ~33 MB | 32-bit emulators |
| `app-universal-release.apk` | ~78 MB | All architectures in one |
| `app-release.aab` | ~52 MB | Google Play submission |

---

## Download APK / دانلود APK

Go to [Releases](https://github.com/boyitnew/maseAccountant/releases) page and download the latest APK for your device architecture.

---

## License / مجوز

MIT
