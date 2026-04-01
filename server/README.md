# Survey Builder Backend

Local Node.js/Express API with Prisma and PostgreSQL.

## Prerequisites
- Node.js 18+
- PostgreSQL instance

## Setup
1.  **Install dependencies**:
    ```bash
    cd server
    npm install
    ```
2.  **Environment Variables**:
    Create a `.env` file in the `server/` root:
    ```env
    PORT=3001
    DATABASE_URL="postgresql://user:pass@localhost:5432/dbname"
    JWT_SECRET="your-strong-secret-key"
    FRONTEND_URL="http://localhost:3000"
    ```
3.  **Prisma Setup**:
    ```bash
    npx prisma generate
    npx prisma db push
    ```

## Running
- **Development**: `npm run dev` (uses `tsx watch`)
- **Production**: `npm run build` then `npm start`

## Demo Data
- Sync the local schema first if needed: `npx prisma db push`
- Seed one published demo survey with five submitted responses: `npm run seed:mock-survey`
- Seed output includes:
  - owner login credentials
  - the survey id
  - the public survey path
