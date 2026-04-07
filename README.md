# Barq Dashboard

An admin dashboard for the **Barq Shipping** platform, built with Next.js 15, React 19, TypeScript, and Tailwind CSS v4. It provides a comprehensive management interface for orders, vendors, agents, products, customers, and more — communicating with the Barq Shipping REST API and receiving real-time updates over Socket.IO.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Development Workflow](#development-workflow)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## Features

- **Orders Management** – View, filter, and manage shipping orders.
- **Vendors & Agents** – Onboard and manage vendors and delivery agents.
- **Products & Categories** – Full CRUD for products, categories, and subcategories.
- **Customers** – Browse and manage customer accounts.
- **Offers & Banners** – Create and schedule promotional offers and banner images.
- **Notifications** – Push notification support via Firebase Cloud Messaging (FCM).
- **Customer Service Tickets** – Track and resolve support tickets.
- **Towns** – Configure service areas and delivery zones.
- **Real-time Updates** – Live order status changes via Socket.IO.
- **Responsive UI** – Mobile-friendly layout built with Tailwind CSS v4.
- **Rich Components** – Interactive charts (ApexCharts), calendar (FullCalendar), maps (jVectorMap), rich-text editor (react-quill), drag-and-drop, file uploads, and more.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router) |
| Language | TypeScript 5 |
| UI | React 19 + Tailwind CSS v4 |
| Charts | ApexCharts + react-apexcharts |
| Calendar | FullCalendar 6 |
| Maps | @react-jvectormap |
| HTTP Client | Axios |
| Real-time | Socket.IO Client |
| Notifications | Firebase (FCM) |
| Linting | ESLint (eslint-config-next) |
| Formatting | Prettier + prettier-plugin-tailwindcss |

---

## Prerequisites

- **Node.js** ≥ 18.18.0 (LTS recommended)
- **npm** ≥ 9 (bundled with Node.js)

---

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/moalmobayed/barq-dashboard.git
cd barq-dashboard

# 2. Install dependencies
npm install
```

---

## Development Workflow

### Run locally

```bash
npm run dev
```

Opens the dev server at [http://localhost:3000](http://localhost:3000) with hot-module replacement.

### Build for production

```bash
npm run build
```

Outputs an optimized production build to `.next/`.

### Start production server

```bash
npm run start
```

Serves the previously built output on port 3000.

### Lint

```bash
npm run lint
```

Runs Next.js ESLint rules across the project. Fix reported issues before opening a pull request.

### Format (Prettier)

```bash
npx prettier --write .
```

Formats all files according to `.prettierrc`. The Prettier config includes `prettier-plugin-tailwindcss` to automatically sort Tailwind class names.

---

## Project Structure

```
barq-dashboard/
├── public/                   # Static assets (images, icons, service worker)
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── (admin)/          # Admin-only routes (layout + all feature pages)
│   │   │   ├── admins/
│   │   │   ├── agents/
│   │   │   ├── banners/
│   │   │   ├── categories/
│   │   │   ├── customer-service/
│   │   │   ├── customers/
│   │   │   ├── notifications/
│   │   │   ├── offers/
│   │   │   ├── orders/
│   │   │   ├── privacy-policy/
│   │   │   ├── products/
│   │   │   ├── profile/
│   │   │   ├── subcategories/
│   │   │   ├── terms-and-conditions/
│   │   │   ├── towns/
│   │   │   ├── vendors/
│   │   │   └── page.tsx      # Dashboard home
│   │   ├── (full-width-pages)/  # Auth & other full-width pages
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/           # Feature-specific React components
│   ├── context/              # React context providers
│   │   ├── AuthContext.tsx
│   │   ├── SidebarContext.tsx
│   │   └── ThemeContext.tsx
│   ├── hooks/                # Custom React hooks (data-fetching per resource)
│   ├── lib/
│   │   ├── api/              # Axios-based API client modules (one per resource)
│   │   ├── firebase/         # Firebase app initialisation & FCM helpers
│   │   └── config.ts         # API base-URL resolution (production vs staging)
│   └── types/                # Shared TypeScript type definitions
├── .eslintrc.json
├── .prettierrc
├── eslint.config.mjs
├── next.config.ts
├── postcss.config.js
├── postcss.config.js          # Tailwind CSS via PostCSS plugin
└── tsconfig.json
```

---

## Configuration

### API endpoints

API base URLs are resolved automatically in `src/lib/config.ts` based on the runtime environment — no additional environment variables are required:

| Environment | Base URL |
|---|---|
| Production build (non-preview) | `https://api.barqshipping.com/api/v1` |
| Development / Vercel preview | `https://api-staging.barqshipping.com/api/v1` |

The same logic applies to the Socket.IO connection URL (`SOCKET_URL`).

### Firebase (Push Notifications)

Firebase is initialised with a hardcoded project configuration in `src/lib/firebase/config.ts` (project: `barq-f7cbb`). No additional setup is required for the default Firebase project. If you need to use a different Firebase project, replace the `firebaseConfig` object in that file with your own project credentials.

---

## Deployment

The project is configured for deployment on **[Vercel](https://vercel.com)**:

1. Push the repository to GitHub.
2. Import the repository in the Vercel dashboard.
3. Vercel auto-detects Next.js and uses the following commands:
   - **Build:** `npm run build`
   - **Output directory:** `.next`
4. No additional environment variables are required for basic deployment.

The `.vercel` directory is intentionally excluded from version control (see `.gitignore`).

---

## Contributing

1. Fork the repository and create a feature branch: `git checkout -b feature/your-feature`.
2. Make your changes and ensure the project builds and lints without errors:
   ```bash
   npm run build
   npm run lint
   ```
3. Commit your changes with a descriptive message.
4. Open a pull request against the `main` branch.

---

Made with ❤️ by the Barq team.
