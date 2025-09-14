# Vi-Try - Virtual Clothing Try-On Platform

A Next.js-based e-commerce platform with virtual try-on capabilities, user management, and intelligent product categorization.

## Features

- 🛍️ Product browsing with intelligent categorization
- 👤 User authentication and profile management
- ⚙️ Comprehensive user settings with default values
- 🔍 Advanced product search and filtering
- 💳 Stripe payment integration
- 📱 Responsive design with modern UI
- 🔐 Secure user authentication with NextAuth
- 🗂️ Automatic product categorization based on keywords

## Getting Started

### Prerequisites
- Node.js 18.x or later
- MongoDB database
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Configure your environment variables in `.env`

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Deployment

### Vercel Deployment (Recommended)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel --prod
```

3. Set environment variables in Vercel dashboard

### Docker Deployment

1. Build and run with Docker Compose:
```bash
docker-compose up --build -d
```

### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Product Categories

The application automatically categorizes products based on keywords:

- **Shirts**: Shirts, blouses, tops, tunics
- **Pants**: Pants, trousers, jeans, chinos
- **Dresses**: Dresses, gowns, frocks
- **Traditional**: Shalwar kameez, kurta, lehenga, saree
- **Formal**: Suits, blazers, coats, formal wear
- **Casual**: T-shirts, hoodies, casual wear
- **Accessories**: Belts, bags, scarves, jewelry
- **Footwear**: Shoes, boots, sandals, sneakers
- **Other**: Uncategorized products

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `NEXTAUTH_SECRET` | NextAuth.js secret key | Yes |
| `NEXTAUTH_URL` | Application URL | Yes |

See `.env.example` for complete list of environment variables.

## Technologies Used

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB, Mongoose
- **Authentication**: NextAuth.js
- **Payments**: Stripe
- **Deployment**: Vercel, Docker
