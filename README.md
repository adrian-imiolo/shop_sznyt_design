# Sznyt Design — E-commerce Shop

A premium e-commerce shop for designer wooden picture frames. Built to replace an existing WooCommerce site at [sznytdesign.pl](https://sznytdesign.pl).

## Tech Stack

**Frontend**
- React 19 + TypeScript
- Tailwind CSS v4
- Vite
- React Router v7
- Clerk (authentication)

**Backend**
- Node.js + Express
- Prisma ORM
- PostgreSQL
- Stripe (payments)
- Nodemailer (transactional email)

## Features

- Product catalog with image hover swap
- Shopping cart with real-time stock validation
- Stripe checkout (card, BLIK, Przelewy24)
- Order management with line items and stock decrement on purchase
- Customer order history (authenticated)
- Admin panel — product CRUD + order overview
- Contact form with email notifications
- Clerk authentication with Polish localization

## Project Structure

```
/                   # React frontend (Vite)
  src/
    pages/          # Route-level components
    components/     # Shared UI components
    context/        # CartContext
    lib/            # Utilities (API base URL)
    types.ts        # Shared TypeScript types

backend/            # Express API
  index.js          # All routes + Stripe webhook
  prisma/
    schema.prisma   # DB schema
    seed.js         # Seed data
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Stripe account
- Clerk account

### Frontend setup

```bash
npm install
cp .env.example .env
# Fill in your values in .env
npm run dev
```

### Backend setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in your values in .env
npx prisma migrate dev
npx prisma generate
npx tsx index.js
```

### Environment variables

See `.env.example` (frontend) and `backend/.env.example` for all required variables.

### Testing payments locally

Run the Stripe CLI to forward webhook events:

```bash
stripe listen --forward-to localhost:3000/webhook
```

## Deployment

- **Frontend** → Vercel
- **Backend + Database** → Railway
- **Domain + Email** → cyberfolks.pl (DNS pointing to Vercel/Railway)
