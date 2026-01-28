# Society Management API

Complete Node.js + Express + MongoDB backend for Society/Apartment Management App.

## Features

- 🔐 **Authentication**: JWT-based auth with email/password and phone OTP
- 👥 **User Roles**: Super Admin, Society Admin, Resident, Gatekeeper, Committee Member
- 🏢 **Society Management**: Multi-society support, blocks, floors, flats
- 💰 **Billing**: Auto-generate bills, late fees, payment tracking
- 💳 **Payments**: Razorpay & Stripe integration
- 📝 **Complaints**: Ticket system with status tracking
- 🚗 **Visitors**: OTP/QR verification, entry/exit logs
- 🚘 **Vehicles**: Registration, parking management
- 📢 **Notices**: Announcements with expiry dates
- 📊 **Dashboard**: Role-based analytics

## Setup

1. Clone and install dependencies:
```bash
cd backend-api
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Update `.env` with your values:
- MongoDB connection string
- JWT secret
- Razorpay/Stripe keys (optional)
- SMTP settings (optional)

4. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/verify-otp` - Verify registration OTP
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/send-login-otp` - Request login OTP
- `POST /api/auth/verify-login-otp` - Login with OTP
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Society
- `POST /api/societies` - Create society
- `GET /api/societies` - Get all societies
- `GET /api/societies/:id` - Get society by ID
- `PUT /api/societies/:id` - Update society
- `POST /api/societies/:id/blocks` - Add block
- `POST /api/societies/:id/amenities` - Add amenity

### Flats
- `GET /api/flats` - Get all flats
- `GET /api/flats/:id` - Get flat by ID
- `PUT /api/flats/:id` - Update flat
- `POST /api/flats/:id/assign-resident` - Assign resident

### Bills
- `POST /api/bills/generate` - Generate monthly bills
- `GET /api/bills` - Get all bills
- `GET /api/bills/:id` - Get bill by ID
- `POST /api/bills/:id/mark-paid` - Mark as paid
- `POST /api/bills/apply-late-fee` - Apply late fees

### Payments
- `POST /api/payments/razorpay/create-order` - Create Razorpay order
- `POST /api/payments/razorpay/verify` - Verify Razorpay payment
- `POST /api/payments/stripe/create-intent` - Create Stripe intent
- `GET /api/payments/history` - Get payment history

### Complaints
- `POST /api/complaints` - Create complaint
- `GET /api/complaints` - Get all complaints
- `PUT /api/complaints/:id/status` - Update status
- `PUT /api/complaints/:id/assign` - Assign complaint
- `POST /api/complaints/:id/comments` - Add comment

### Visitors
- `POST /api/visitors` - Register visitor
- `GET /api/visitors` - Get all visitors
- `POST /api/visitors/verify-otp` - Verify visitor OTP
- `POST /api/visitors/verify-qr` - Verify visitor QR
- `POST /api/visitors/:id/checkin` - Check in
- `POST /api/visitors/:id/checkout` - Check out

### Vehicles
- `POST /api/vehicles` - Register vehicle
- `GET /api/vehicles` - Get all vehicles
- `GET /api/vehicles/check/:number` - Check vehicle
- `PUT /api/vehicles/:id/parking` - Assign parking

### Notices
- `POST /api/notices` - Create notice
- `GET /api/notices` - Get all notices
- `PUT /api/notices/:id` - Update notice
- `POST /api/notices/:id/toggle-pin` - Pin/unpin

### Dashboard
- `GET /api/dashboard/stats` - Get role-based stats
- `GET /api/dashboard/collection-chart` - Collection chart data
- `GET /api/dashboard/recent-activity` - Recent activity

## Deployment

Deploy to:
- **Railway**: `railway up`
- **Render**: Connect GitHub repo
- **Heroku**: `heroku create && git push heroku main`
- **DigitalOcean App Platform**: Connect GitHub repo
- **AWS EC2/ECS**: Use Docker

## Environment Variables

| Variable | Description |
|----------|-------------|
| PORT | Server port (default: 5000) |
| MONGODB_URI | MongoDB connection string |
| JWT_SECRET | JWT signing secret |
| JWT_EXPIRES_IN | Token expiry (default: 7d) |
| RAZORPAY_KEY_ID | Razorpay key ID |
| RAZORPAY_KEY_SECRET | Razorpay secret |
| STRIPE_SECRET_KEY | Stripe secret key |
| FRONTEND_URL | Frontend URL for CORS |
