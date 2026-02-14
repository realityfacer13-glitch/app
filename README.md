# Kasheer Grocery Delivery Platform

Kasheer is a full-stack grocery delivery system with:
- **Backend API**: Node.js + Express + Firebase Admin
- **Mobile App**: React Native with Expo (customer)
- **Admin Panel**: React + Vite web app (operations)
- **Database**: Firestore + Firebase Storage

## Monorepo Structure

```text
kasheer/
├── backend/                 # Express REST API
│   └── src/
├── mobile/                  # Expo React Native app
│   ├── screens/
│   ├── services/
│   └── context/
├── admin/                   # React admin app
│   └── src/
└── README.md
```

## 1) Prerequisites

- Node.js 18+
- npm 9+
- Firebase project (Auth, Firestore, Storage enabled)
- Expo CLI (`npm i -g expo-cli`) or `npx expo`

## 2) Firebase Setup

1. Create Firebase project.
2. Enable **Phone Authentication** in Firebase Auth.
3. Create Firestore database in production/test mode.
4. Create Storage bucket.
5. Generate a service account key JSON for backend.

## 3) Backend Setup (`backend/`)

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Create `backend/.env`:

```env
PORT=4000
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n","client_email":"...","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}
```

### API Base URL
`http://localhost:4000`

## 4) Mobile Setup (`mobile/`)

```bash
cd mobile
npm install
npx expo start
```

Create `mobile/.env`:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:4000
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

## 5) Admin Setup (`admin/`)

```bash
cd admin
npm install
npm run dev
```

Create `admin/.env`:

```env
VITE_API_BASE_URL=http://localhost:4000
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Create Firebase Auth users for admins and set their Firestore profile `role: "admin"`.

## 6) Firestore Data Model

### `users/{userId}`
```json
{
  "name": "Aqib Mir",
  "phone": "+919876543210",
  "address": "Rajbagh, Srinagar",
  "role": "customer",
  "createdAt": "timestamp"
}
```

### `categories/{categoryId}`
```json
{
  "name": "Fruits",
  "description": "Fresh seasonal fruits",
  "imageUrl": "https://.../fruits.jpg"
}
```

### `products/{productId}`
```json
{
  "name": "Apple",
  "categoryId": "fruits",
  "price": 120,
  "unit": "kg",
  "stock": 80,
  "imageUrl": "https://.../apple.jpg",
  "isActive": true,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### `carts/{userId}`
```json
{
  "items": [
    {
      "productId": "apple_1",
      "name": "Apple",
      "quantity": 2,
      "price": 120,
      "unit": "kg",
      "imageUrl": "https://.../apple.jpg"
    }
  ],
  "total": 240,
  "updatedAt": "timestamp"
}
```

### `orders/{orderId}`
```json
{
  "userId": "uid_123",
  "items": [{ "productId": "apple_1", "quantity": 2, "price": 120 }],
  "totalAmount": 240,
  "paymentMethod": "COD",
  "status": "PLACED",
  "deliveryAddress": "Rajbagh, Srinagar",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

## 7) REST API Summary

### Auth
- `POST /api/auth/verify` - verifies Firebase ID token and creates user profile.
- `GET /api/auth/me` - returns current user.

**Example response**:
```json
{
  "message": "Token verified",
  "userId": "abc123",
  "phone": "+919876543210"
}
```

### Catalog
- `GET /api/categories`
- `GET /api/products?categoryId=fruits`

### Cart
- `GET /api/cart`
- `POST /api/cart/items`
- `PATCH /api/cart/items/:productId`
- `DELETE /api/cart/items/:productId`

### Orders
- `POST /api/orders` (COD)
- `GET /api/orders/my`
- `GET /api/orders/admin/all`
- `PATCH /api/orders/admin/:orderId/status`

## 8) Deployment Notes

### Backend on Render
1. Push repo to GitHub.
2. Create Render Web Service for `backend` directory.
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add env vars (`PORT`, `FIREBASE_SERVICE_ACCOUNT`, `FIREBASE_STORAGE_BUCKET`).

### Backend on Heroku
1. Create app and connect repo.
2. Set stack to Node.
3. Add config vars same as above.
4. Deploy.

### Expo Mobile Build
```bash
cd mobile
npx eas build -p android
npx eas build -p ios
```
Set Expo env vars in EAS secrets.

### Admin on Vercel/Netlify
1. Deploy `admin` folder.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Add all `VITE_...` variables.

## 9) Order Status Lifecycle

`PLACED -> CONFIRMED -> OUT_FOR_DELIVERY -> DELIVERED`

Can be set to `CANCELLED` at admin side.
