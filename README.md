# Eco_Heaven
<img src="https://socialify.git.ci/Qhathizwe/Eco_Heaven/image?language=1&name=1&owner=1&stargazers=1&theme=Auto" alt="Eco_Heaven" width="640" height="320" />

# Eco Heaven – Full-Stack Hotel Booking Platform

Eco Heaven is a full-stack hotel accommodation and booking platform designed to make discovering, managing, and booking accommodation easier. Users can explore available accommodation, view room information, make bookings, manage their profiles, save favourites, submit reviews, and complete payments through Paystack.

The application is built with **React, TypeScript, Node.js, Express, and PostgreSQL**. It uses **Vercel** for frontend hosting, **Render** for backend hosting, and **Neon** for the PostgreSQL database.

## Live Application

- **Frontend:** https://eco-heaven.vercel.app/
- **GitHub Repository:** https://github.com/Qhathizwe/Eco_Heaven

## Project Overview

Eco Heaven was developed as a full-stack web application to demonstrate how a frontend application communicates with a backend API and a relational database.

The platform provides separate experiences for ordinary users and administrators.

### Main Features

#### User Features
- User registration and login.
- Password hashing and secure authentication.
- Google OAuth authentication.
- Browse accommodation listings.
- View accommodation details, images, facilities, and room information.
- View available rooms and pricing.
- Make accommodation bookings.
- Complete bookings using Paystack.
- View booking information.
- Manage personal profile information.
- Add and remove accommodation favourites.
- Submit accommodation reviews and ratings.

#### Administrator Features
- Access the administration dashboard.
- Manage accommodation listings.
- Manage rooms.
- View and manage bookings.
- Manage users.

#### Payment Features
- Paystack payment initialization.
- Server-side booking and payment validation.
- Payment reference generation.
- Payment verification.
- Booking confirmation after successful payment verification.
- Currency configured for South African Rand (ZAR).

## Technology Stack

| Area | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| Styling | CSS |
| State Management | Redux Toolkit, React Redux |
| Routing | React Router |
| Backend | Node.js, Express.js, TypeScript |
| Database | PostgreSQL |
| Database Hosting | Neon |
| Backend Hosting | Render |
| Frontend Hosting | Vercel |
| Authentication | JWT, bcryptjs, Passport.js, Google OAuth |
| Image Storage | Cloudinary, Multer |
| Payments | Paystack |
| Email | Nodemailer |
| Development | npm, Git, GitHub |

## Application Architecture

The application follows a client-server architecture.

1. The React frontend displays the application and handles user interaction.
2. Redux Toolkit manages frontend application state and API requests.
3. Express.js exposes REST API endpoints.
4. Backend controllers handle incoming requests and responses.
5. Services contain business logic and database operations.
6. PostgreSQL stores application data.
7. External services provide authentication, image storage, email, and payment processing.

```text
                    USER
                     |
                     v
             REACT FRONTEND
             TypeScript + Vite
                     |
                     v
             REDUX TOOLKIT
                     |
                     v
              EXPRESS API
              Node.js Server
                     |
          +----------+----------+
          |          |          |
          v          v          v
       ROUTES    CONTROLLERS   MIDDLEWARE
                     |
                     v
                  SERVICES
                     |
                     v
                POSTGRESQL
                 NEON DB

       External Integrations:
       - Paystack
       - Google OAuth
       - Cloudinary
       - Nodemailer

       Hosting:
       - Vercel: Frontend
       - Render: Backend
       - Neon: Database
```

## Project Structure

The repository is organized into two main applications.

```text
Eco_Heaven/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   └── server.ts
│   │
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── redux/
│   │   ├── styles/
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

*The structure above describes the main application organization. Individual folders may contain additional files and subfolders.*

## Getting Started – Local Installation

Follow these instructions to run Eco Heaven on your local machine.

### 1. Prerequisites

Install the following:

- Node.js (LTS version recommended).
- npm (included with Node.js).
- Git.
- Visual Studio Code or another code editor.
- A PostgreSQL database, such as a Neon database.
- Cloudinary account for image storage.
- Paystack account or test credentials for payment testing.
- Google OAuth credentials if testing Google authentication.

Check that Node.js and npm are installed:

```bash
node -v
npm -v
```

### 2. Clone the Repository

Open a terminal and run:

```bash
git clone https://github.com/Qhathizwe/Eco_Heaven.git
```

Navigate into the project:

```bash
cd Eco_Heaven
```

### 3. Set Up the Backend

Navigate into the backend directory:

```bash
cd backend
```

Install backend dependencies:

```bash
npm install
```

The backend uses the following main dependencies:

- express – creates the API server.
- pg – connects to PostgreSQL.
- bcryptjs – hashes user passwords.
- jsonwebtoken – handles JWT authentication.
- passport and passport-google-oauth20 – Google authentication.
- dotenv – loads environment variables.
- cors – manages cross-origin requests.
- cloudinary – stores accommodation images.
- multer and multer-storage-cloudinary – handles image uploads.
- nodemailer – sends emails.
- typescript and tsx – TypeScript development and execution.

### 4. Configure Backend Environment Variables

Create a `.env` file inside the `backend` directory.

```env
PORT=7000

FRONTEND_URL=http://localhost:5173

DATABASE_URL=your_neon_postgresql_connection_string

DB_USER=your_database_user
DB_HOST=your_database_host
DB_DATABASE=your_database_name
DB_PASSWORD=your_database_password

JWT_SECRET=your_secure_jwt_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=your_google_callback_url

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

PAYSTACK_SECRET_KEY=your_paystack_secret_key
```

**Important:** This is an environment-variable template. Confirm the exact variable names used by your backend configuration before adding them. The Paystack service and Cloudinary configuration must use matching names.

Never commit your `.env` file or expose secret credentials on GitHub.

### 5. Run the Backend

Start the backend development server:

```bash
npm run dev
```

The backend is configured to use port `7000` by default.

Local API base URL:

```text
http://localhost:7000/api
```

Keep the backend terminal running while working on the frontend.

### 6. Set Up the Frontend

Open another terminal.

From the project root, navigate to the frontend:

```bash
cd frontend
```

Install frontend dependencies:

```bash
npm install
```

The frontend uses:

- react – builds the user interface.
- react-dom – renders React components.
- react-router-dom – handles application navigation.
- @reduxjs/toolkit – manages application state.
- react-redux – connects React components to Redux.
- vite – development server and build tool.
- typescript – type safety.

### 7. Configure Frontend Environment Variables

Create a `.env` file inside the `frontend` directory.

```env
VITE_API_URL=http://localhost:7000/api
```

The frontend API configuration should use this variable when communicating with the backend.

Do not put private keys or server-side secrets in frontend environment variables. Vite exposes variables prefixed with `VITE_` to the browser.

### 8. Run the Frontend

Start the development server:

```bash
npm run dev
```

Open the local URL provided by Vite, normally:

```text
http://localhost:5173
```

Your local application should now be running.

## Authentication and Authorization

Eco Heaven supports user authentication and protected application functionality.

The backend uses:

- bcryptjs to hash passwords before storing them.
- JSON Web Tokens (JWT) for authentication.
- Express middleware to protect restricted endpoints.
- Passport.js and Google OAuth for Google sign-in.

Passwords should never be stored as plain text.

Administrator functionality is restricted to authorized administrator accounts.

## Accommodation and Room Management

Users can browse accommodation listings and view detailed accommodation information.

Accommodation information includes details such as:

- Accommodation name and description.
- Location and address.
- Images.
- Facilities and amenities.
- Room information.
- Pricing.
- Availability information.

Administrators can manage accommodation listings and rooms through the administrative functionality.

## Booking Management

The booking process allows users to select an accommodation, choose a room, and provide their booking dates and guest information.

The backend validates booking information and checks room availability before creating a booking.

Bookings use statuses such as:

- Pending
- Confirmed
- Cancelled
- Completed

A successful payment verification is required before the booking is confirmed through the payment workflow.

## Paystack Payment Integration

Eco Heaven integrates Paystack to process accommodation payments.

The payment process follows this sequence:

1. The user selects an accommodation and room.
2. The user enters check-in and check-out dates.
3. The frontend sends booking details to the backend.
4. The backend validates the booking information.
5. The backend retrieves the room price from the database.
6. The backend calculates the total amount.
7. The backend initializes a Paystack transaction.
8. The user completes payment through Paystack.
9. The user returns to the application.
10. The backend verifies the payment reference with Paystack.
11. After successful verification, the booking is created and confirmed.

The backend must calculate and validate payment amounts. It must not trust an amount supplied by the browser.

### Payment Security

- Keep the Paystack secret key on the backend.
- Use Paystack test credentials for development.
- Never commit payment credentials to GitHub.
- Verify transactions on the backend before confirming bookings.
- Do not use real customer payment information when testing.

## Reviews and Favourites

### Reviews

Users can submit accommodation ratings and written reviews.

The review functionality supports:
- Ratings from 1 to 5.
- Review titles.
- Written comments.
- Review summaries.
- Average rating calculations.

### Favourites

Authenticated users can save accommodation listings to their favourites and remove them when they no longer need them.

Favourite records are associated with users and accommodation listings.

## User Profiles

The profile functionality allows authenticated users to access and manage their account information.

Profile information includes personal details such as name, email address, and phone number, depending on the fields supported by the application.

## Deployment and Hosting

Eco Heaven is deployed using three hosting services.

| Application Component | Hosting Provider |
|---|---|
| Frontend | Vercel |
| Backend API | Render |
| PostgreSQL Database | Neon |

### Frontend Deployment – Vercel

The frontend is deployed through Vercel.

Live frontend:

https://eco-heaven.vercel.app/

Typical Vercel configuration:

- Root Directory: `frontend`
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

Configure the frontend environment variable in Vercel:

```env
VITE_API_URL=https://your-render-backend-url/api
```

Replace the example URL with the actual deployed Render backend URL.

### Backend Deployment – Render

The backend is hosted on Render.

Typical backend configuration:

- Root Directory: `backend`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`

The backend must have a production start script in `backend/package.json`, for example:

```json
"start": "node dist/server.js"
```

This assumes the TypeScript build outputs `dist/server.js`. Confirm the actual output location in `tsconfig.json` before using this command.

Configure all required backend environment variables in the Render dashboard.

Also configure:

```env
FRONTEND_URL=https://eco-heaven.vercel.app
```

If multiple frontend origins are supported, configure them according to the backend's CORS implementation.

### Database Deployment – Neon

Eco Heaven uses PostgreSQL hosted by Neon.

The backend connects to the database through the PostgreSQL connection string configured in its environment variables.

```env
DATABASE_URL=your_neon_connection_string
```

Keep the database connection string private.

## Available NPM Scripts

### Backend

| Command | Purpose |
|---|---|
| `npm install` | Installs backend dependencies |
| `npm run dev` | Starts the backend development server |
| `npm run build` | Compiles TypeScript |

A production `npm start` script should be configured to run the compiled backend.

### Frontend

| Command | Purpose |
|---|---|
| `npm install` | Installs frontend dependencies |
| `npm run dev` | Starts the Vite development server |
| `npm run build` | Builds the production frontend |
| `npm run lint` | Runs ESLint |
| `npm run preview` | Previews the production build locally |

## Troubleshooting

### Backend Cannot Connect to PostgreSQL

Check:

- The `DATABASE_URL` value.
- Neon database availability.
- Database credentials.
- Network access.
- SSL requirements.

### Frontend Cannot Connect to Backend

Check:

- The `VITE_API_URL` value.
- Whether the backend is running.
- The Render deployment status.
- CORS configuration.
- Browser developer console errors.

### Authentication Problems

Check:

- JWT configuration.
- Token handling.
- Protected route middleware.
- Google OAuth credentials and callback URL.

### Image Upload Problems

Check:

- Cloudinary environment variables.
- Cloudinary account configuration.
- Multer upload configuration.
- Backend logs.

### Payment Verification Problems

Check:

- Paystack secret key.
- Transaction reference.
- Backend payment verification response.
- Paystack test/live mode.
- Booking validation and availability.

## Security Considerations

The application uses several security practices:

- Password hashing with bcryptjs.
- JWT-based authentication.
- Protected backend routes.
- Role-based access control.
- Server-side booking validation.
- Server-side payment verification.
- Environment variables for sensitive credentials.
- Database constraints for data integrity.

Production deployments should also use HTTPS, appropriate request validation, secure token handling, restricted CORS origins, and appropriate rate limiting.

## Future Improvements

Possible improvements for future versions include:

- Automated database migrations.
- Automated backend and frontend tests.
- Paystack webhook handling for payment event reconciliation.
- More advanced room availability management.
- Booking cancellation and refund workflows.
- Email booking confirmations.
- Improved analytics for administrators.
- More advanced search and filtering.
- Pagination for large accommodation listings.
- Additional accessibility improvements.

## Learning Outcomes

Developing Eco Heaven provided practical experience in:

- Full-stack web development.
- React and TypeScript.
- Redux Toolkit state management.
- REST API development.
- Node.js and Express.
- PostgreSQL database design.
- Authentication and authorization.
- Password hashing.
- Google OAuth integration.
- Cloud image uploads.
- Payment gateway integration.
- Frontend and backend deployment.
- Environment configuration.
- Debugging and API integration.

## Author

**Scelo Mike Phoswa**

Junior Full-Stack Developer | IT Technician | Systems Development

GitHub: https://github.com/Qhathizwe

Portfolio: https://mi-portfolio-psi-six.vercel.app/

---

*Eco Heaven is a full-stack hotel accommodation and booking application developed as a practical software development project.*
