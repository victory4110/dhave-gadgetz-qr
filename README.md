# DHave Gadgetz Payment QR

A QR-based payment information system built for a retail client. Customers scan a permanent QR code, open a mobile-friendly page containing the business's bank details, and copy the account number with one tap.

**Live application:** [dhave-gadgetz-qr.vercel.app](https://dhave-gadgetz-qr.vercel.app)

## Why I built it

The client needed a faster and more reliable way to share payment details during in-person transactions. Repeatedly typing or sending an account number slowed the process and increased the chance of mistakes.

This project keeps the printed QR code stable while the account information is managed behind it.

## User flow

1. A customer scans the business's QR code.
2. The scan reaches the Express API, which confirms that the account exists.
3. The customer is redirected to a responsive account-details page.
4. The page retrieves the correct details from MongoDB.
5. The customer copies the account number and completes the transfer in their banking app.

## Features

- Permanent QR codes linked to stored merchant details
- Responsive payment-information page for mobile devices
- One-tap account-number copying
- MongoDB-backed account storage
- API endpoint for creating or updating merchant details and generating a QR code
- Health-check endpoint for deployment monitoring
- Vercel serverless deployment configuration

## Technology

- Node.js and Express
- MongoDB and Mongoose
- HTML, CSS, and browser JavaScript
- `qrcode` for QR generation
- Vercel for deployment

## Architecture

```text
QR scan
   │
   ▼
Express route  ──►  MongoDB account lookup
   │
   ▼
Responsive account-details page
   │
   ▼
Copy account number and complete bank transfer
```

## API routes

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Confirm that the service is running |
| `POST` | `/api/accounts/generate-qr` | Create or update account details and return a QR code |
| `GET` | `/api/accounts/details/:accountNumber` | Retrieve account details for the profile page |
| `GET` | `/api/pay/:accountNumber` | Validate an account and redirect a QR scan to its profile |

## Run locally

Requirements:

- Node.js 18 or later
- A MongoDB database

```bash
git clone https://github.com/victory4110/dhave-gadgetz-qr.git
cd dhave-gadgetz-qr
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:3000` after setting the environment values.

## Environment variables

```env
MONGODB_URI=mongodb_connection_string
BASE_URL=http://localhost:3000
```

Never commit real credentials. The repository's `.gitignore` excludes `.env` files.

## Current limitations

- The QR flow displays transfer details but does not independently confirm a manual bank transfer.
- Merchant administration is API-based; there is not yet a dedicated authenticated admin dashboard.
- Automated test coverage has not yet been added.

## My contribution

I designed and built the application for the client, including the QR flow, Express API, MongoDB models, account-details interface, copy interaction, and deployment configuration.

## Author

**Victory Ogundipe** — [Portfolio](https://victory4110.github.io/portfolio/) · [GitHub](https://github.com/victory4110) · [LinkedIn](https://www.linkedin.com/in/ogundipe-victory-708875337)
