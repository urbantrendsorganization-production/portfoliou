## PortfolioU System

**Version:** `1.0.0-beta`  
**Status:** Beta — Open for early access  
**Platform:** [portfoliou.urbantrends.dev](https://portfoliou.urbantrends.dev)

PortfolioU is a talent marketplace for college creatives in beauty, web development, graphic design, and fashion. Students build public portfolios and apply to paid gigs posted by verified businesses.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router, `output: standalone`) |
| Backend | Django 5 + Django REST Framework |
| Auth | JWT (`simplejwt`) + Google OAuth |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Realtime | Django Channels + Redis |
| Payments | Stripe |
| State | Zustand |
| Styling | Tailwind CSS |
| Deploy | Docker + Nginx |

---

## System Health API

The backend exposes a public health endpoint — no auth required.

```
GET /api/health/
```

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0-beta",
  "services": {
    "database": "healthy",
    "api": "healthy"
  },
  "counts": {
    "users": 15,
    "gigs": 7
  },
  "timestamp": "2026-04-13T10:00:00.000Z"
}
```

`status` is `"healthy"` when all services are up, `"degraded"` when the database is unreachable.

---

## Key Routes

### Public
| Route | Description |
|---|---|
| `/` | Landing page |
| `/browse` | Talent discovery grid |
| `/[username]` | Public portfolio page |
| `/about`, `/contact`, `/terms`, `/privacy` | Info pages |

### Auth
| Route | Description |
|---|---|
| `/signup` | Register as student or client (email or Google) |
| `/login` | Sign in |
| `/onboarding` | Post-Google-signup role + username setup |

### Dashboard (requires auth)
| Route | Description |
|---|---|
| `/dashboard` | Main dashboard with stats and quick actions |
| `/portfolio` | Manage work samples |
| `/gigs` | Browse and post gigs |
| `/analytics` | Profile view and engagement stats |
| `/messages` | Direct messaging |
| `/settings` | Profile and account settings |

### Admin (staff only)
| Route | Description |
|---|---|
| `/admin` | User, gig, and content management |

---

## Development Setup

### Prerequisites
- Node.js 20+
- Python 3.12+
- Redis (for realtime features)

### Frontend

```bash
npm install
npm run dev        # http://localhost:3000
```

Environment variables (`.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env   # fill in your values

python manage.py migrate
python manage.py seed_data     # loads 10 students + 5 clients + 7 gigs
python manage.py runserver     # http://localhost:8000
```

Environment variables (`backend/.env`):
```
SECRET_KEY=your-secret-key
DEBUG=True
GOOGLE_CLIENT_ID=your_google_client_id
DATABASE_URL=sqlite:///db.sqlite3
REDIS_URL=redis://localhost:6379/0
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### Docker (full stack)

```bash
docker-compose up --build
```

---

## Seed Data

Run `python manage.py seed_data` inside `/backend` to populate:
- 10 student profiles across all disciplines
- 5 client profiles
- 7 open gigs

Clear seed data: `python manage.py seed_data --clear`

Demo credentials (after seed):

| Username | Password |
|---|---|
| `amara_diallo` | `demo1234` |
| `kevin_ochieng` | `demo1234` |
| `zara_mwangi` | `demo1234` |

All demo accounts use `@demo.portfoliou.dev` emails.

---

## API Reference

Base URL: `http://localhost:8000/api/`

| Endpoint | Auth | Description |
|---|---|---|
| `GET /api/health/` | None | System health + version |
| `POST /api/auth/register/` | None | Create account |
| `POST /api/auth/login/` | None | Get JWT tokens |
| `POST /api/auth/google/` | None | Google OAuth login |
| `GET /api/profiles/` | Optional | List profiles (filterable by role, discipline, username) |
| `GET /api/profiles/me/` | Required | Current user's profile |
| `PATCH /api/profiles/{id}/` | Required | Update profile |
| `GET /api/work-samples/` | Optional | List work samples |
| `POST /api/work-samples/` | Required | Upload work sample |
| `GET /api/gigs/` | Optional | List gigs |
| `POST /api/gigs/` | Required | Create gig (clients) |
| `POST /api/gig-applications/` | Required | Apply to gig (students) |
| `GET /api/messages/` | Required | List messages |
| `POST /api/messages/` | Required | Send message |
| `GET /api/analytics/` | Required | Profile analytics |
| `GET /api/notifications/` | Required | Notifications |
| `GET /api/admin/stats/` | Staff | Platform-wide stats |

---

## License

MIT — see [LICENSE](./LICENSE).
