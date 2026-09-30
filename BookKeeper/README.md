# BookKeeper

Offline-first bookkeeping for small businesses, freelancers and market
traders. Record income & expenses, track who owes you (and who you owe),
and see simple profit/loss reports — all on your phone, no internet
required.

**Author:** Mr Dave Adex | DAVA TECK

---

## ✨ Features (MVP v0.1.0)

- **Transactions** — record income and expenses with categories, notes and
  dates. Filter by type, delete with a long-press.
- **Ledger (Customers & Suppliers)** — track how much each customer owes
  you, or how much you owe each supplier. Full charge/payment history per
  contact.
- **Dashboard** — this month's income, expenses and net profit at a
  glance, plus recent activity.
- **Reports** — this month / last month / all-time totals, a category
  breakdown, and CSV export via the native Share sheet.
- **Receipt photos** — attach a photo (camera or gallery) to any
  transaction (`react-native-image-picker`).
- **Settings** — currency symbol, optional PIN app-lock, JSON backup &
  restore, full data reset.
- **Offline-first** — everything is stored locally on-device
  (`AsyncStorage`); no account, no server, no internet connection needed.

## 🧱 Architecture

```
BookKeeper/
├── android/                 # Native Android project (Gradle) — CI builds this
├── App.tsx                  # App shell: providers + lock gate + navigation
├── index.js                 # RN entry point
├── src/
│   ├── types/models.ts      # Domain models (Transaction, Contact, LedgerEntry, ...)
│   ├── database/
│   │   ├── storage.ts       # Typed AsyncStorage read/write wrapper
│   │   └── repositories.ts  # CRUD + business rules (balances, seeding, backup)
│   ├── store/AppDataContext.tsx  # React Context exposing app data + actions
│   ├── navigation/           # Root stack + bottom tabs, typed routes
│   ├── screens/               # Dashboard, Transactions, Ledger, Reports, Settings
│   ├── components/            # Reusable UI (Screen, Card, PrimaryButton, ...)
│   └── utils/                 # Formatting, id generation, hashing
└── __tests__/                # Jest unit tests (business logic + smoke render test)
```

**Design decisions & trade-offs (documented on purpose):**

- **Storage:** Data is stored as JSON via `@react-native-async-storage/async-storage`
  rather than SQLite. This keeps the dependency surface small (fewer native
  modules = fewer ways the first CI build can fail) and is more than enough
  for a single-device small-business MVP. The repository layer
  (`src/database/repositories.ts`) is the only place that talks to storage,
  so swapping to SQLite or a synced backend later does not require
  touching any screen.
- **State management:** A single React Context + hooks
  (`useAppData()`) instead of Redux/Zustand — fewer moving parts for an
  MVP of this size. Can be swapped in without touching screens if the app
  grows.
- **App lock:** PIN is hashed with SHA-256 (`js-sha256`, a pure-JS
  implementation — zero native dependencies, zero extra CI build risk)
  via `src/utils/hash.ts`. Note that any 4–6 digit PIN has inherently low
  entropy regardless of hash algorithm (same trade-off as a phone's
  lock-screen PIN) — it's a local deterrent, not protection against a
  determined attacker with access to the device's storage. See Roadmap
  for OS-backed secure storage.
- **Charts:** Category breakdowns use a simple `View`-based bar chart
  (`src/components/BarRow.tsx`) instead of a native charting library —
  zero extra native dependencies, zero extra CI build risk.

## 🚀 Getting started (local development)

```bash
cd BookKeeper
npm install
npm run android   # requires an Android emulator/device + Android SDK locally
```

Useful scripts:

```bash
npm run lint        # ESLint
npm run typecheck   # TypeScript, no emit
npm test            # Jest unit tests
```

## 📦 Building & shipping the APK

You do **not** need Android Studio to get an installable APK — GitHub
Actions builds it for you.

### Where
`.github/workflows/bookkeeper-android-build.yml` (repo root `.github/`)

### How it works
1. Triggers on: push to any branch touching `BookKeeper/**`, pull requests
   touching `BookKeeper/**`, a pushed tag like `bookkeeper-v1.0.0`, or a
   manual "Run workflow" click.
2. Installs JS deps, runs lint + typecheck + unit tests.
3. Builds the Android APK with Gradle (`./gradlew assembleDebug` by
   default).
4. Uploads the APK as a downloadable **workflow artifact** on every run.
5. If triggered by a `bookkeeper-v*` tag, or manually with
   `create_release: true`, it also attaches the APK to a **GitHub
   Release**.

### Getting the APK
- **Every run:** GitHub → **Actions** → pick the run → **Artifacts** →
  download `bookkeeper-debug-apk` (or `-release-apk`).
- **Tagged release:** push a tag, e.g.:
  ```bash
  git tag bookkeeper-v0.1.0
  git push origin bookkeeper-v0.1.0
  ```
  The APK will show up under **Releases** on GitHub.
- **On-demand:** GitHub → **Actions** → *BookKeeper — Android Build* →
  **Run workflow** → choose `debug` or `release`.

### Installing the APK on a phone
The debug APK is unsigned/dev-signed and not from the Play Store, so
Android will warn about "unknown sources" — that's expected for this
MVP stage. Enable "Install unknown apps" for your file manager/browser,
then open the downloaded `.apk`.

### Producing a signed release APK (optional, once you have a keystore)
Add these **repository secrets** (Settings → Secrets and variables →
Actions):

| Secret | Value |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | `base64 -w0 your-release.keystore` output |
| `ANDROID_KEYSTORE_PASSWORD` | keystore password |
| `ANDROID_KEY_ALIAS` | key alias |
| `ANDROID_KEY_PASSWORD` | key password |

Then run the workflow manually with `build_type: release`. Without these
secrets, a release run automatically falls back to an unsigned debug
build so the pipeline never fails for lack of signing credentials.

## 🗺️ Roadmap (post-MVP)

- OS-backed secure storage for the PIN (`react-native-keychain` /
  Android Keystore) instead of a SHA-256 hash in AsyncStorage.
- Copy camera-captured receipt photos into permanent app storage (e.g.
  via `react-native-fs`) — right now a camera capture lives in a
  temporary OS cache location until copied elsewhere; gallery picks are
  already persistent `content://` URIs.
- SQLite (or a sync backend) for larger datasets / multi-device sync.
- PDF invoice generation and native date picker.
- Play Store listing + signed release pipeline wired to a real keystore.
