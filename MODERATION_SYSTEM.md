# Event Moderation System

## Overview
Events submitted by users are now sent to the backend for your manual review before appearing on the map.

## System Flow

```
User creates event → Backend stores in pending_events → You review & approve
                                                              ↓
                                                    Event appears on map
```

## How It Works

### 1. User Submits Event
- User fills out event form and clicks "Publică Eveniment"
- Event is sent to backend: `POST http://localhost:5000/api/events/submit`
- User sees message: "Event submitted for moderation"
- Event stored in Firestore `pending_events` collection with `status: 'pending'`

### 2. You Review Pending Events
Get all pending events:
```bash
curl http://localhost:5000/api/events/pending
```

Returns JSON array of pending events with all details (title, description, location, photos, etc.)

### 3. Approve Events
```bash
curl -X POST http://localhost:5000/api/events/approve/[eventId] \
  -H "Content-Type: application/json" \
  -d '{"approvedBy": "your-name"}'
```

This:
- Copies event to `events` collection with `status: 'approved'`
- Event immediately appears on the map
- Updates pending event record

### 4. Reject Events (Optional)
```bash
curl -X POST http://localhost:5000/api/events/reject/[eventId] \
  -H "Content-Type: application/json" \
  -d '{"reason": "Inappropriate content", "rejectedBy": "your-name"}'
```

## Backend Setup Requirements

To make the moderation system work, add these to `backend/.env`:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-email@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
```

**How to get these values:**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project → Project Settings (gear icon)
3. Go to "Service Accounts" tab
4. Click "Generate New Private Key"
5. Copy the JSON values into `.env`

## Available Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/events/submit` | POST | Submit event for moderation |
| `/api/events/pending` | GET | Get all pending events |
| `/api/events/approve/:id` | POST | Approve an event |
| `/api/events/reject/:id` | POST | Reject an event |

## Firestore Collections

### `pending_events`
Stores events awaiting review:
- `status`: 'pending' \| 'approved' \| 'rejected'
- `title`, `description`, `date`, `organizer`, etc.
- `createdAt`: When submitted
- `userId`, `userName`: Who submitted
- `approvedAt`, `approvedBy`: If approved
- `rejectionReason`, `rejectedAt`, `rejectedBy`: If rejected

### `events`
Only contains approved events:
- `status`: 'approved'
- `approvedAt`, `approvedBy`: Admin who approved
- All other event data

## Map Display
- Only events with `status: 'approved'` appear on the map
- Fetched by: `fetchEventsFromFirestore()` in `src/services/firestore.ts`

## Testing the System

1. **Start backend:**
   ```bash
   cd backend && npm run dev
   ```

2. **Create an event** in the app as a logged-in user

3. **Check pending events:**
   ```bash
   curl http://localhost:5000/api/events/pending
   ```

4. **Approve an event:**
   ```bash
   curl -X POST http://localhost:5000/api/events/approve/[eventId] \
     -H "Content-Type: application/json" \
     -d '{"approvedBy": "me"}'
   ```

5. **Refresh the map** - approved event now appears!

## Future Enhancement: Admin Panel

To make approving events easier, create an admin panel component that:
- Fetches `/api/events/pending`
- Displays event cards with preview images
- Shows approve/reject buttons
- Calls the approve/reject endpoints

This would be a better UX than using curl commands.
