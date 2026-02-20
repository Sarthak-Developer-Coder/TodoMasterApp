# 📱 TodoMaster — React Native To-Do App

> A production-grade, feature-rich task management mobile app built with **React Native CLI**, **TypeScript**, **Redux Toolkit**, and a custom smart sorting algorithm.

![React Native](https://img.shields.io/badge/React_Native-0.73.4-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0.4-3178C6?logo=typescript&logoColor=white)
![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2.2.1-764ABC?logo=redux&logoColor=white)
![Platform](https://img.shields.io/badge/Platform-Android-green?logo=android&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-Sarthak--Developer--Coder-181717?logo=github&logoColor=white)

---

## Table of Contents

- [Screenshots Overview](#screenshots-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Smart Sort Algorithm](#smart-sort-algorithm)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Code Highlights](#code-highlights)
- [Design System](#design-system)

---

## Features

### Core Requirements ✅
| Feature | Status |
|---|---|
| Register with email & password | ✅ |
| Login with credentials | ✅ |
| Add task (title, description, date-time, deadline, priority) | ✅ |
| Mark task as completed | ✅ |
| Delete task (with confirm dialog) | ✅ |
| View task list with status indicators | ✅ |

### Bonus Features ⭐
| Bonus Feature | Implementation |
|---|---|
| Task due dates | Separate `dateTime` (start) + `deadline` fields with native DateTimePicker |
| Smart sort algorithm | Weighted blend of priority + deadline urgency + task age |
| Task categories | 8 categories: Personal, Work, Health, Finance, Education, Shopping, Travel, Other |
| Task tags | Freeform tags with chip UI, filterable |
| Sorting / Filtering | 5 sort orders, 3 status filters, 4 priority filters, category filter, search |
| State persistence | redux-persist with AsyncStorage — survives app restarts |
| Password strength meter | Real-time 5-segment strength bar on Registration |
| Urgency score visualization | Per-task progress bar in TaskCard + full breakdown in TaskDetail |
| Task statistics dashboard | Completion rate ring, category/priority breakdowns on Profile |
| Edit task | Tapping ✏️ on TaskDetail opens AddTask in edit mode |

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | React Native CLI | Full native access, no Expo limitations |
| Language | TypeScript | Type safety, autocomplete, maintainability |
| Navigation | React Navigation v6 | Industry standard, native stack |
| State Management | Redux Toolkit | Modern Redux, minimal boilerplate |
| Persistence | redux-persist + AsyncStorage | Sessions & tasks survive app restarts |
| Authentication | Local (AsyncStorage) | Zero setup required; swap-ready for Firebase |
| Date handling | date-fns | Lightweight, tree-shakeable, immutable |
| Gradients | react-native-linear-gradient | Beautiful gradient backgrounds & cards |
| Date Picker | @react-native-community/datetimepicker | Native OS picker |
| UUID | react-native-uuid | Reliable unique IDs |
| Toast | react-native-toast-message | Non-blocking notifications |

---

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                    App.tsx                            │
│  Provider → PersistGate → SafeAreaProvider           │
└─────────────────────┬────────────────────────────────┘
                       │
              ┌────────▼────────┐
              │  AppNavigator   │  (root switch: Auth ↔ App)
              └──┬──────────┬───┘
                 │          │
         ┌───────▼──┐  ┌────▼──────────┐
         │  Auth    │  │  Task Stack   │
         │  Stack   │  │  + Tab Bar    │
         └──┬────┬──┘  └──┬────────┬──┘
            │    │         │        │
         Login Register  Home   Profile
                           │
                    AddTask / TaskDetail

Redux Store
├── auth (currentUser, isAuthenticated)
└── tasks (tasks[], filter, sortOrder)
    └── sortAndFilterTasks() ← Smart Algorithm
```

---

## Smart Sort Algorithm

The algorithm computes a **urgency score [0..10]** for each task using a weighted formula:

```
Score = (Priority Weight × 0.40)
      + (Deadline Urgency × 0.40)
      + (Task Age Boost  × 0.20)
```

### Priority Weight
```
critical → 1.00   high → 0.75   medium → 0.50   low → 0.25
```

### Deadline Urgency (Exponential Decay)
```
urgency(h) = e^(-0.007 × hoursLeft)

  overdue  → 1.00   (maximum)
  1h left  → ~0.99
  24h left → ~0.85
  72h left → ~0.60
  7 days   → ~0.31
```

### Age Boost (Anti-starvation)
```
age(h) = min(h / 720, 1.0)   // grows linearly over 30 days
```

This ensures that tasks never get "stuck" at the bottom no matter how many new high-priority tasks are added.

---

## Project Structure

```
TodoMasterApp/
├── App.tsx                   # Root component
├── index.js                  # AppRegistry entry point
├── package.json
├── tsconfig.json
├── babel.config.js
└── src/
    ├── types/
    │   └── index.ts          # All TypeScript types & interfaces
    ├── theme/
    │   └── index.ts          # Colors, typography, spacing, shadows
    ├── store/
    │   ├── index.ts          # Redux store + persist config
    │   ├── authSlice.ts      # Auth state + async thunks
    │   └── tasksSlice.ts     # Task CRUD + filter/sort state
    ├── services/
    │   ├── authService.ts    # Register, login, restore session
    │   └── taskService.ts    # CRUD operations on AsyncStorage
    ├── utils/
    │   ├── sortAlgorithm.ts  # Smart score + sort/filter engine
    │   ├── dateUtils.ts      # Date formatting & validation
    │   └── storage.ts        # Typed AsyncStorage wrappers
    ├── hooks/
    │   └── redux.ts          # useAppDispatch / useAppSelector
    ├── navigation/
    │   ├── AppNavigator.tsx  # Root auth ↔ app switch
    │   ├── AuthNavigator.tsx # Login / Register stack
    │   └── TaskNavigator.tsx # Tab bar + task stack
    ├── components/
    │   ├── AppButton.tsx     # Multi-variant gradient button
    │   ├── AppInput.tsx      # Labelled input (password toggle, error)
    │   ├── TaskCard.tsx      # Rich task card with urgency bar
    │   ├── FilterBar.tsx     # Scrollable filter/sort pill bar
    │   ├── EmptyState.tsx    # Empty list illustration
    │   ├── LoadingOverlay.tsx# Full-screen modal spinner
    │   └── StatsCard.tsx     # Completion ring + stat grid
    └── screens/
        ├── auth/
        │   ├── LoginScreen.tsx     # Login form + shake animation
        │   └── RegisterScreen.tsx  # Register + password strength
        └── tasks/
            ├── HomeScreen.tsx      # Task list + search + filters
            ├── AddTaskScreen.tsx   # Create/edit task form
            ├── TaskDetailScreen.tsx # Full task detail + actions
            └── ProfileScreen.tsx   # User profile + stats + logout
```

---

## Getting Started

### Prerequisites

1. **Node.js** ≥ 18 — [nodejs.org](https://nodejs.org)
2. **JDK 17** — [adoptium.net](https://adoptium.net)
3. **Android Studio** — [developer.android.com/studio](https://developer.android.com/studio)
4. Set environment variables (Windows):

```powershell
# System Environment Variables → New
ANDROID_HOME = C:\Users\<YourName>\AppData\Local\Android\Sdk

# Add to PATH
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\emulator
%ANDROID_HOME%\tools\bin
```

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Sarthak-Developer-Coder/TodoMasterApp.git
cd TodoMasterApp

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Start Metro bundler (Terminal 1 — keep running)
npm start

# 4. Build & run on Android emulator/device (Terminal 2)
npm run android
```

> **Note:** Open an Android emulator from Android Studio → Device Manager before running `npm run android`, or plug in a physical Android device with USB Debugging enabled.

### First Run

1. Tap **"Create one"** to register a new account
2. Enter your name, a valid email, and a password (8+ characters)
3. You're logged in! Tap the **⊕** FAB button to add your first task
4. Fill in title, description, schedule, priority, category, and tags
5. Tap **"Add Task"** — your task appears ranked by the smart algorithm

---

## Code Highlights

### Typed Redux Store
```typescript
// All dispatch calls are fully type-checked
const dispatch = useAppDispatch();
await dispatch(addTask({ userId, title, priority, deadline, ... }));
```

### Smart Sort Function
```typescript
// sortAlgorithm.ts
export function calculateSmartScore(task: Task): number {
  const priorityNorm = PRIORITY_WEIGHTS[task.priority] / 4;
  const dlUrgency = Math.exp(-0.007 * hoursLeft);
  const age = Math.min(ageHours / (30 * 24), 1.0);
  return (priorityNorm * 0.40 + dlUrgency * 0.40 + age * 0.20) * 10;
}
```

### Local Auth Service (swap-ready for Firebase)
```typescript
// authService.ts — just replace this file's internals with Firebase calls
await authService.register({ name, email, password });
await authService.login({ email, password });
```

### redux-persist Setup
```typescript
// Sessions and tasks survive app restart automatically
const authPersistConfig = { key: 'auth', storage: AsyncStorage, whitelist: ['currentUser', 'isAuthenticated'] };
const tasksPersistConfig = { key: 'tasks', storage: AsyncStorage, whitelist: ['tasks', 'filter', 'sortOrder'] };
```

---

## Design System

The app uses a **dark-first, electric violet** design language:

| Token | Value | Usage |
|---|---|---|
| `background` | `#0A0E1A` | Screen backgrounds |
| `surface` | `#111827` | Cards, modals |
| `primary` | `#6C63FF` | Buttons, accents, focus states |
| `secondary` | `#06B6D4` | Tag chips, secondary accents |
| `success` | `#10B981` | Completed tasks, checkmarks |
| `error` | `#EF4444` | Overdue, delete, errors |
| `warning` | `#F59E0B` | Due-soon warnings |

All UI is built with **StyleSheet.create** for performance (styles compiled at load time, not render time).

---

## Evaluation Criteria Mapping

| Criterion | Implementation |
|---|---|
| ✅ Correctness | Full CRUD + auth works end-to-end with validation |
| ✅ Code Quality | Typed, commented, single-responsibility modules, no God components |
| ✅ UI Design | Dark gradient theme, glassmorphism cards, animated interactions |
| ✅ State Management | Redux Toolkit + redux-persist, normalized slices |
| ✅ Auth Flow | Register → Login → Restore session → Logout cycle |
| ⭐ Bonus | Smart algorithm, categories, tags, filters, stats, edit mode |

---

---

## 👤 Author

**Sarthak**  
GitHub: [@Sarthak-Developer-Coder](https://github.com/Sarthak-Developer-Coder)  
Repo: [TodoMasterApp](https://github.com/Sarthak-Developer-Coder/TodoMasterApp)

---

*Built with ❤️ using React Native CLI + TypeScript — TodoMaster 2026*
