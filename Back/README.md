# WorkHQ Backend

Backend API for WorkHQ - HR Management System

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma
- **Authentication**: Supabase Auth

## Setup

### Prerequisites

- Node.js 18 or higher
- PostgreSQL database (Supabase recommended)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `env.example`:
```bash
cp env.example .env
```

3. Update the `.env` file with your credentials:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

4. Generate Prisma client:
```bash
npm run generate
```

5. Run database migrations:
```bash
npm run migrate
```

6. (Optional) Seed the database:
```bash
npm run seed
```

## Development

Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:5000`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server
- `npm run migrate` - Run Prisma migrations
- `npm run generate` - Generate Prisma client
- `npm run seed` - Seed database with initial data

## API Endpoints

### Health Check
- `GET /health` - Check if API is running

### Authentication
- `POST /api/auth/register` - Register new user
- `GET /api/auth/profile` - Get user profile

### Attendance
- `POST /api/attendance/check` - Check-in/out
- `GET /api/attendance/history` - Get attendance history

### Leave
- `POST /api/leave/apply` - Apply for leave
- `PUT /api/leave/:id/approve` - Approve/reject leave
- `GET /api/leave/balance/:id` - Get leave balances

### Payroll
- `GET /api/payroll/:employeeId` - Get payroll details

## Project Structure

```
Back/
├── src/
│   ├── controllers/    # Request handlers
│   ├── routes/        # API routes
│   ├── services/      # Business logic
│   ├── middleware/    # Custom middleware
│   ├── utils/         # Utility functions
│   ├── types/         # TypeScript types
│   └── index.ts       # Main application file
├── prisma/
│   ├── schema.prisma  # Database schema
│   └── seed.ts        # Database seeding
├── dist/              # Compiled JavaScript (generated)
└── node_modules/      # Dependencies
```

## Environment Variables

See `env.example` for all required environment variables.

## License

ISC

