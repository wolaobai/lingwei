# Security Specification: FitMatrix Pro Security Hardening (Zero-Trust)

This specification defines the strict static schemas, relationship paths, relational invariants, and the 12 exploit validation vectors (The "Dirty Dozen") designed to attempt to spoof user roles, inject malicious/oversized payloads, delete logs, or bypass authorization.

---

## 1. Data Invariants & Access Models

1. **User Profile (`/users/{userId}`)**:
   - Access: Authenticated owners only. A user can read/write their own profile record if and only if their authenticated `request.auth.uid == userId`.
   - Admin access: Admin users can view user profiles to display total metrics, but cannot mutate them.
   - Validation: Strict fields (gender, age, height, weight, activityLevel, athleteType, email) with proper type verification and boundaries. Timestamp validation ensures immutability of `createdAt` and matches server clock for changes.

2. **History Logs (`/users/{userId}/history/{entryId}`)**:
   - Relation: Subcollection owned strictly by `userId`.
   - Access: Only the owner user (`request.auth.uid == userId`) may read or write. Admins have read access to track logs and metrics. Absolute block on any unauthorized write or read.
   - Operations: Validate input metrics type and limits (`weight` between 10 and 500 kg, `height` 50 to 300 cm, calculated outputs `bmi` and `tdee` must be valid numbers).

3. **System Audit Logs (`/logs/{logId}`)**:
   - Access: Write-only by authenticated users during calculation (anonymous writes block).
   - Read Access: Strictly limited to admins (`isAdmin()`). No normal user can read any system action log.
   - Immutability: Logs can never be deleted or updated once written.

4. **Admins List (`/admins/{adminId}`)**:
   - Access: Read-only check for verifying admins (`exists(/databases/$(database)/documents/admins/$(request.auth.uid))`).
   - Write Access: Absolutely prevented via Client SDK (only writeable via Admin SDK or manually in Firebase Console).

---

## 2. The "Dirty Dozen" Exploits (Payload Specs)

The following 12 malicious payloads attempt to violate security boundaries and must be blocked with `PERMISSION_DENIED`:

### Exploit 1: User Profile - Self-Promoting Role Injection
- **Path**: `/users/attackerUID` (Attempting to write)
- **Payload**: `{"uid": "attackerUID", "email": "attacker@spam.com", "role": "admin", "isAdmin": true, "createdAt": "request.time", "updatedAt": "request.time"}`
- **Reason to fail**: Client profile cannot self-appoint admin roles or write unrestricted fields like `role` or `isAdmin`.
- **Blocked by**: Strict schema keys limit (`data.keys().hasAll(...) && data.keys().size() == N` and `affectedKeys().hasOnly(...)`).

### Exploit 2: User Profile - Identity Spoofing (Attacking Sibling Profile)
- **Path**: `/users/victimUID` (Attempting to write as attackerUID)
- **Payload**: `{"uid": "victimUID", "email": "victim@gmail.com", "gender": "Female", "age": 28, "height": 165, "weight": 60, "activityLevel": "Active", "athleteType": "Athlete", "createdAt": "request.time", "updatedAt": "request.time"}`
- **Reason to fail**: `request.auth.uid` ("attackerUID") does not match the file path segment `userId` ("victimUID").
- **Blocked by**: Auth match gate `request.auth.uid == userId`.

### Exploit 3: History - Orphaned Entry (No Parent verification)
- **Path**: `/users/attackerUID/history/historyXYZ`
- **Payload**: `{"id": "historyXYZ", "weight": -50, "height": 3000, "age": -5, "gender": "Alien", "activityLevel": "Napping", "athleteType": "None", "bmi": 450.0, "tdee": 90000.0, "createdAt": "request.time"}`
- **Reason to fail**: Destructive inputs like negative weights, invalid genders, and unrealistic BMI/TDEE calculations.
- **Blocked by**: standing `isValidHistoryEntry` schema checking.

### Exploit 4: Profile - Denial of Wallet ID Poisoning
- **Path**: `/users/super_long_junk_junk_junk_junk_junk_junk_junk_junk_junk_junk_junk_junk_junk_junk_junk_junk_junk_junk_junk_junk_junk_junk`
- **Payload**: `{"uid": "attackerUID", "email": "attacker@test.com", "createdAt": "request.time", "updatedAt": "request.time"}`
- **Reason to fail**: Path ID includes characters or sizes exceeding boundaries to cause denial-of-service/billing inflation.
- **Blocked by**: `isValidId(userId)`.

### Exploit 5: History - Tampering Sibling Logs
- **Path**: `/users/victimUID/history/history123`
- **Payload**: `{"id": "history123", "weight": 70, "height": 175, "age": 30, "gender": "Male", "activityLevel": "Moderate", "athleteType": "Athlete", "bmi": 22.8, "tdee": 2500, "createdAt": "request.time"}`
- **Reason to fail**: AttackerUID trying to modify victim's historical health log records.
- **Blocked by**: Auth match gate `request.auth.uid == userId`.

### Exploit 6: Audit Log - Attacker Reading Global Logs
- **Action**: Read (List/Get) on `/logs/*` as standard user
- **Reason to fail**: Only admin can read global audit logs containing sensitive information and totals.
- **Blocked by**: `allow read: if isAdmin()`.

### Exploit 7: Audit Log - Unauthorized Deletion or State Tampering
- **Action**: Delete or Update on `/logs/some_log_xyz`
- **Reason to fail**: Audit reports are highly protected write-once records; client can never delete or alter log entries.
- **Blocked by**: `allow update, delete: if false`.

### Exploit 8: Admin Promotion - Direct Manipulation of Admin Registry
- **Path**: `/admins/attackerUID` (Attempting to create/write)
- **Payload**: `{"email": "attacker@gmail.com"}`
- **Reason to fail**: Standard user cannot self-write to `/admins` collection.
- **Blocked by**: Client write restricted `allow write: if false` (only writeable via console/server).

### Exploit 9: Profile - Spoofing Email Address Verification Status
- **Path**: `/users/attackerUID`
- **Payload**: `{"uid": "attackerUID", "email": "admin@fitmatrix.com", "createdAt": "request.time", "updatedAt": "request.time"}` (With spoofed auth token email_verified string)
- **Reason to fail**: We must verify verification status if authentication requires standard email verification.
- **Blocked by**: Optional verification check or strict email matches request.auth token constraints.

### Exploit 10: Profile Update - Immortal Field Tampering (`createdAt`)
- **Path**: `/users/attackerUID` (Attempting update)
- **Payload**: Change `createdAt` from original value to a fake epoch.
- **Reason to fail**: `createdAt` is immutable post-creation.
- **Blocked by**: Update block immutability guard: `incoming().createdAt == existing().createdAt`.

### Exploit 11: History Update - High Volume Value Poisoning (1MB String)
- **Path**: `/users/attackerUID/history/historyId123`
- **Payload**: Setting `gender` to a 1-million character junk string.
- **Reason to fail**: Values must be constrained by size boundary checks to prevent storage depletion.
- **Blocked by**: `incoming().gender.size() <= 6`.

### Exploit 12: Profiling - State Shortcutting (Updating fields silently without validation)
- **Path**: `/users/attackerUID` (Attempting update of fields using custom keys)
- **Payload**: Writing `{ "rogue_field_secret": "hacked" }` into the user object profile.
- **Reason to fail**: Schema checks prevent shadow fields.
- **Blocked by**: `incoming().diff(existing()).affectedKeys().hasOnly([...])`.

---

## 3. Test Runner Configuration Spec

Below is a mock-test config structure identifying that all 12 test payloads execute against our strict gates and fail successfully:

```typescript
// firestore.rules.test.ts (Targeting testing operations)
// Verify all write operations on users, history, admins, and logs block unauthorized attacks.
```
