# Caprice MGMT

A production management platform for photography and media studios. Built to replace spreadsheet-based workflows with a real-time, role-aware dashboard backed entirely by **Google Sheets** as a zero-cost database.

---

## Features

| Module | Description |
|---|---|
| **Dashboard** | KPI cards (revenue, expenses, capital, cash, net profit), monthly growth chart, recent transactions, partner distribution, project pipeline, ideas pipeline, gear checklist progress |
| **Task Board** | Kanban board with drag-and-drop, configurable pipeline stages, full task CRUD, email notifications on create/update |
| **Projects** | Project cards grouped by status, category filter, full CRUD |
| **Wallet** | Transaction log with search, type filter, member filter, date range filter — Admin only |
| **Members** | Team roster with role, email, profit share %, equity distribution — Admin only |
| **Ideas** | Idea board with star rating, category filter, status tracking |
| **Checklist** | Equipment checklist organized in named sections, per-item packed/unpacked toggle |
| **Auth** | Google OAuth via NextAuth v5, role-based access control (Admin / Member) |
| **Email** | Notifications via Resend (with Gmail SMTP fallback) on task events |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.3 (App Router) |
| Runtime | React 19 |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion 12 |
| Auth | NextAuth v5 (Google OAuth) |
| Database | Google Sheets (via `google-spreadsheet` v5) |
| Email | Resend + Nodemailer (Gmail SMTP fallback) |
| Drag & Drop | `@hello-pangea/dnd` |
| Icons | Lucide React |
| Deployment | Vercel |

---

## Architecture

```
Browser → Next.js App Router (Vercel)
                │
                ├── /api/data     →  Google Sheets (service account)
                ├── /api/auth     →  Google OAuth (NextAuth v5)
                └── email events  →  Resend / Gmail SMTP
```

Google Sheets acts as the database. Each sheet tab corresponds to a data type (`Members`, `Transactions`, `Projects`, `Ideas`, `Checklist`, `Tasks`, `Columns`). The app reads and writes rows via a Google service account — no separate database or backend infrastructure required.

---

## Prerequisites

- Node.js 18+
- A **Google Cloud** project with:
  - Google Sheets API enabled
  - Google Drive API enabled
  - OAuth 2.0 credentials (for user sign-in)
  - A service account with a JSON key (for Sheets access)
- A **Google Spreadsheet** shared with the service account email (`Editor` permission)
- A **Resend** account and API key (for email notifications)

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
# ── Google OAuth (for user sign-in) ─────────────────────────────────────────
AUTH_GOOGLE_ID=your_google_oauth_client_id
AUTH_GOOGLE_SECRET=your_google_oauth_client_secret

# ── NextAuth ─────────────────────────────────────────────────────────────────
AUTH_SECRET=generate_with__openssl_rand_-base64_32
AUTH_URL=http://localhost:3000

# ── Google Sheets (service account) ─────────────────────────────────────────
GOOGLE_SPREADSHEET_ID=your_spreadsheet_id_from_the_url
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----\n"

# ── Email notifications ───────────────────────────────────────────────────────
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx

# ── Gmail SMTP fallback (optional) ───────────────────────────────────────────
GMAIL_USER=your@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password
```

> **`GOOGLE_PRIVATE_KEY` on Vercel:** paste the raw key value in the Vercel environment variable UI without extra quotes. The app handles `\n` normalization automatically.

---

## Google Sheets Structure

Create one spreadsheet and add the following tabs. The **first row** of each tab must be a header row with these exact column names:

### `Members`
| id | name | role | sharePercentage | email |
|---|---|---|---|---|

### `Transactions`
| id | description | amount | type | date | memberId |
|---|---|---|---|---|---|

> `type` values: `income` · `expense` · `capital`

### `Projects`
| id | title | status | category | client | date | notes |
|---|---|---|---|---|---|---|

### `Ideas`
| id | title | category | status | rating | notes |
|---|---|---|---|---|---|

### `Checklist`
| id | name | category | isPacked | quantity | notes |
|---|---|---|---|---|---|

> `category` is used as the section/group name for checklist items

### `Tasks`
| id | title | description | status | assignedTo | priority | dueDate | notes |
|---|---|---|---|---|---|---|---|

### `Columns`
| id | label | color | order |
|---|---|---|---|

> Stores the Kanban board column configuration (managed in-app via the Workflow Engine modal)

---

## Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-org/photobiz-web.git
cd photobiz-web

# 2. Install dependencies
npm install

# 3. Configure environment variables
# Create .env.local and fill in all values (see above)

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with your Google account.

---

## Role Setup

Roles are stored in the `Members` sheet. After a user signs in for the first time, find their record in the sheet and set the `role` column:

| Role | Access |
|---|---|
| `Admin` | Full access — all pages including Wallet and Members management |
| `Member` | Dashboard, Tasks, Projects, Ideas, Checklist — read-only on Members data |

The app checks `session.user.role` on every protected API route and page redirect.

---

## Deployment (Vercel)

1. Push the repository to GitHub
2. Import the project in the [Vercel dashboard](https://vercel.com/new)
3. Add all environment variables from `.env.local` under **Settings → Environment Variables**
4. Set `AUTH_URL` to your production domain (e.g. `https://caprice-mgmt.vercel.app`)
5. Add your production domain to the **Authorized redirect URIs** in Google Cloud Console

```bash
# Or deploy directly via CLI:
npx vercel --prod
```

---

## Project Structure

```
photobiz-web/
├── app/
│   ├── page.js              # Dashboard
│   ├── tasks/               # Kanban board
│   ├── projects/            # Project management
│   ├── wallet/              # Financial transactions (Admin)
│   ├── members/             # Team management (Admin)
│   ├── ideas/               # Idea board
│   ├── checklist/           # Equipment checklist
│   ├── login/               # Auth page
│   └── api/
│       └── data/route.js    # Single CRUD endpoint for all sheet types
├── components/
│   ├── layout/
│   │   └── MainLayout.js    # Sidebar + mobile nav + providers
│   ├── tasks/               # Kanban-specific components
│   ├── ui/                  # Primitive components (NumberTicker)
│   ├── AppModal.js          # Shared modal with Framer Motion spring
│   └── ActionButtons.js     # Row action buttons
├── context/
│   ├── AppContext.js        # Global data state + CRUD helpers
│   └── TasksContext.js      # Kanban state + column management
├── lib/
│   ├── googleSheets.js      # Google Sheets read/write helpers
│   └── email/               # Resend + Gmail notification service
├── auth.js                  # NextAuth v5 full config
└── auth.config.js           # NextAuth edge-compatible config (middleware)
```

---

## Scripts

```bash
npm run dev      # Start dev server (Turbopack)
npm run build    # Production build + type check
npm run start    # Start production server
npm run lint     # ESLint
```

---

## License

Private — all rights reserved © 2026 Caprice Media.
