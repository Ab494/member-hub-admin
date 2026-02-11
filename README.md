# MemberHub - Membership Management Dashboard

A modern admin dashboard for managing memberships, built with React, Vite, Tailwind CSS, and TypeScript.

## Features

- 🔐 **Authentication** - JWT-based login with role-based access
- 📊 **Dashboard** - Stats overview, recent renewals, revenue tracking
- 👥 **Members Management** - Search, filter, view profiles
- 💳 **Payments** - Transaction history with filters
- 📦 **Packages CRUD** - Create, edit, delete membership packages
- 📱 **Responsive** - Mobile-friendly design
- 🔄 **MPESA Integration** - STK push for renewals (ready for backend)
- 🔗 **AxTraxNG Ready** - Sync status fields prepared

## Quick Start

1. Clone and install dependencies:
```bash
npm install
```

2. Create `.env` file:
```env
VITE_API_URL=http://localhost:3001/api
```

3. Run development server:
```bash
npm run dev
```

## Folder Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn components
│   ├── DashboardLayout.tsx
│   ├── StatusBadge.tsx
│   ├── StatCard.tsx
│   ├── SearchInput.tsx
│   ├── Pagination.tsx
│   ├── Skeleton.tsx
│   └── RenewMembershipModal.tsx
├── contexts/           # React contexts
│   └── AuthContext.tsx
├── hooks/              # Custom hooks
├── lib/                # Utilities
│   ├── api.ts          # Axios client with interceptors
│   └── utils.ts
├── pages/              # Page components
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── Members.tsx
│   ├── MemberProfile.tsx
│   ├── Payments.tsx
│   └── Packages.tsx
├── services/           # API services
│   ├── auth.service.ts
│   ├── members.service.ts
│   ├── packages.service.ts
│   ├── payments.service.ts
│   └── dashboard.service.ts
└── types/              # TypeScript types
    └── index.ts
```

## API Integration

All services in `src/services/` make real API calls to the backend.
The axios client in `src/lib/api.ts` handles:

- JWT token management
- Auth header injection
- Token refresh
- Error handling with toast notifications

### Required Backend Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login with email/password |
| POST | `/auth/refresh` | Refresh auth token |
| POST | `/auth/logout` | Logout user |
| GET | `/dashboard/stats` | Dashboard statistics |
| GET | `/dashboard/revenue` | Revenue chart data |
| GET | `/members` | List members with filters |
| GET | `/members/:id` | Get single member |
| POST | `/members` | Create new member |
| PATCH | `/members/:id` | Update member |
| DELETE | `/members/:id` | Delete member |
| POST | `/members/renew` | Renew membership (STK push) |
| POST | `/members/:id/sync-axtrax` | Sync with AxTraxNG |
| GET | `/payments` | List payments with filters |
| GET | `/payments/:id` | Get single payment |
| GET | `/payments/stats` | Payment statistics |
| GET | `/payments/export` | Export payments CSV |
| GET | `/packages` | List all packages |
| GET | `/packages/:id` | Get single package |
| POST | `/packages` | Create package |
| PATCH | `/packages/:id` | Update package |
| DELETE | `/packages/:id` | Delete package |
| POST | `/packages/:id/toggle-active` | Toggle package status |

## AxTraxNG Integration

Member profiles include sync status fields:
- `axtraxId` - External system ID
- `axtraxSyncStatus` - 'synced' | 'pending' | 'failed'
- `axtraxLastSync` - Last sync timestamp

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:3001/api` |

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn UI** - Component library
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Query** - Data fetching
- **date-fns** - Date formatting
