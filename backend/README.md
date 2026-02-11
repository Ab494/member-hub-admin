# MemberHub Backend

Production-ready Node.js backend for the MemberHub Membership Management System.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with refresh tokens
- **Background Jobs**: BullMQ with Redis
- **External API**: MPESA Daraja API for mobileValidation**: Joi
- **Logging**: Winston

## Features

- JWT-based authentication with role-based access control
- Member management with search payments
- ** functionality
- Membership packages CRUD
- MPESA payment integration with STK Push
- Background job processing for payment verification
- Audit logging for all admin actions
- Pluggable access control layer (AxTraxNG ready)
- Input validation and rate limiting

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+

## Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/memberhub

# JWT
JWT_SECRET=your-secure-secret-key
JWT_REFRESH_SECRET=your-secure-refresh-key

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# MPESA (sandbox)
MPESA_CONSUMER_KEY=your-consumer-key
MPESA_CONSUMER_SECRET=your-consumer-secret
MPESA_SHORT_CODE=174379
MPESA_PASSKEY=your-passkey
MPESA_CALLBACK_URL=https://your-domain.com/api/payments/mpesa/callback
MPESA_ENV=sandbox
```

4. Run database migrations:
```bash
npm run prisma:migrate
```

5. Generate Prisma client:
```bash
npm run prisma:generate
```

## Development

```bash
# Run development server
npm run dev

# Run background worker
npm run worker:payments

# Run both (concurrently)
npm run dev & npm run worker:payments
```

## Production

```bash
# Build TypeScript
npm run build

# Run migrations
npm run prisma:migrate:prod

# Start production server
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register (admin only)
- `POST /api/auth/refresh-token` - Refresh token
- `GET /api/auth/profile` - Get current user profile

### Members
- `GET /api/members` - List members (with search/filter)
- `GET /api/members/:id` - Get member details
- `POST /api/members` - Create member (admin only)
- `PUT /api/members/:id` - Update member (admin only)
- `DELETE /api/members/:id` - Delete member (admin only)
- `GET /api/members/status/:search` - Check membership status

### Packages
- `GET /api/packages` - List packages
- `GET /api/packages/:id` - Get package details
- `POST /api/packages` - Create package (admin only)
- `PUT /api/packages/:id` - Update package (admin only)
- `DELETE /api/packages/:id` - Delete package (admin only)
- `POST /api/packages/:id/toggle-active` - Toggle package status

### Payments
- `POST /api/payments/initiate` - Initiate MPESA payment
- `POST /api/payments/mpesa/callback` - MPESA callback (public)
- `GET /api/payments` - List payments
- `GET /api/payments/stats` - Get payment statistics

### Renewals
- `POST /api/renewals` - Initiate renewal
- `GET /api/renewals` - List renewals

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/revenue` - Revenue chart data

### Access Control
- `POST /api/access-control/:memberId/enable` - Enable user access
- `POST /api/access-control/:memberId/disable` - Disable user access
- `POST /api/access-control/:memberId/department` - Assign department
- `GET /api/access-control/:memberId/status` - Get user access status

## Folder Structure

```
backend/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── config/                # Configuration
│   ├── lib/                   # Utilities (prisma, redis, mpesa, etc.)
│   ├── middleware/            # Express middleware
│   ├── modules/               # Feature modules
│   │   ├── auth/
│   │   ├── members/
│   │   ├── packages/
│   │   ├── payments/
│   │   ├── renewals/
│   │   ├── dashboard/
│   │   └── accessControl/
│   ├── validators/            # Joi validation schemas
│   ├── workers/               # BullMQ workers
│   └── index.ts               # Main application entry
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment | development |
| PORT | Server port | 3001 |
| DATABASE_URL | PostgreSQL connection string | - |
| JWT_SECRET | JWT signing secret | - |
| JWT_REFRESH_SECRET | Refresh token secret | - |
| REDIS_HOST | Redis host | localhost |
| REDIS_PORT | Redis port | 6379 |
| MPESA_CONSUMER_KEY | MPESA Daraja consumer key | - |
| MPESA_CONSUMER_SECRET | MPESA Daraja consumer secret | - |
| MPESA_SHORT_CODE | MPESA short code | 174379 |
| MPESA_PASSKEY | MPESA passkey | - |
| MPESA_CALLBACK_URL | Callback URL for STK push | - |
| MPESA_ENV | Environment (sandbox/production) | sandbox |

## MPESA Integration

The backend integrates with MPESA Daraja API for mobile payments:

1. **STK Push**: Initiates a payment request to the customer's phone
2. **Callback**: Receives payment confirmation from MPESA
3. **Background Processing**: Uses BullMQ to process payment confirmations and update membership status

To test with sandbox:
1. Register at [MPESA Developer Portal](https://developer.safaricom.co.ke)
2. Create a test app
3. Copy consumer key and secret to `.env`

## Access Control Layer

The system uses a pluggable access control interface. Current implementation is a `DummyProvider` that logs actions but doesn't integrate with any external system.

To enable AxTraxNG integration:
1. Implement the `AxTraxNGProvider` class
2. Set `ACCESS_CONTROL_TYPE=axtraxng` in environment
3. Configure AxTraxNG credentials

## License

MIT
