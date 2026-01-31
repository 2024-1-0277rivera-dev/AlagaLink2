# Database Migration Plan: Mock to Firebase

This guide prepares the AlagaLink system for the transition from static JSON mock data to a live Firebase Firestore NoSQL database.

## 📂 Collection Mapping
The current `mockData/` structures map directly to Firestore Collections:

| Mock File | Firestore Collection | Key Index |
|-----------|----------------------|-----------|
| `members/`| `users` | `id` (e.g., LT-PWD-1001) |
| `lost-found/`| `reports` | `id` (e.g., R-12345) |
| `programs/records.ts` | `programRequests` | `id` (e.g., req-123) |
| `programs/devices.ts` | `inventory_devices` | `id` |
| `notifications/` | `notifications` | `id` |
| `directMessages` (State) | `messages` | `threadKey` (Composite ID) |

## 🛠 Preparation Steps

### 1. User Profile Flattening
Ensure the `customData` and `history` objects are stored as Map types in Firestore. 
- **Nested Arrays**: `familyComposition` should be stored as an array of objects within the user document.

### 2. Image Handling
- Current system uses Base64 or external URLs.
- **Firebase Step**: Use **Firebase Storage** to host user photos and inventory assets. Store the resulting `downloadURL` in the Firestore document string field.

### 3. Real-time Implementation
Replace the `setUsers`, `setReports`, and `setProgramRequests` calls in `AppContext.tsx` with Firestore `onSnapshot` listeners to enable multi-admin real-time synchronization.

### 4. Mock Data JSON Export
To facilitate the initial "Seed", export the current aggregate `MOCK_USERS` and `MOCK_REPORTS` from `mockData/index.ts` using a standard JSON.stringify tool and import them using a Firebase Admin SDK script.
