# CashFlow - Smart Personal Budgeting

A specialized budgeting tool for users in Bangladesh, featuring AI-powered SMS parsing for bKash, Nagad, and local banks.

## Features
- **AI SMS Parser**: Copy-paste your transaction SMS (bKash, Nagad, BD Banks) to automatically log expenses.
- **Bangla Support**: Fully localized in English and Bangla.
- **BD Banks Integration**: Comprehensive support for bKash, Nagad, Rocket, DBBL, City Bank, Eastern Bank, Pubali Bank, and 20+ other local banks.
- **Instant Themes**: Switch between multiple dark and light themes (Midnight, Emerald, Amethyst, Onyx) instantly.
- **PWA Ready**: Install it on your phone for a native app experience.

## 🚀 How to Publish (Web)
This app is optimized for **Firebase App Hosting**. To go live:
1. **Push to GitHub**: Create a new repository on GitHub and push this code.
2. **Connect to Firebase**: Go to the [Firebase Console](https://console.firebase.google.com/), select your project, and go to **App Hosting**.
3. **Set Up Deployment**: Connect your GitHub repository. Firebase will automatically build and deploy your Next.js app.
4. **Environment Variables**: Add your `GOOGLE_GENAI_API_KEY` in the App Hosting dashboard to enable AI features.

## 📱 Mobile Installation (PWA)
1. Open your published URL in a mobile browser.
2. **iOS**: Tap 'Share' > 'Add to Home Screen'.
3. **Android**: Tap 'Settings' (3 dots) > 'Install app'.

## 🍎 Publishing to App Store / Play Store
Use **[PWABuilder](https://www.pwabuilder.com/)**:
1. Enter your published URL into PWABuilder.
2. Generate packages for Google Play (TWA) and iOS (App Store).
3. Submit the generated packages to the respective store consoles.
