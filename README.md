# Brew&Co API

A production-ready Express.js application with TypeScript, featuring dual-server architecture with nginx reverse proxy support.

## Features

- **Dual Server Architecture**: Separate Express servers for public and admin APIs
- **TypeScript**: Full type safety and modern JavaScript features
- **Authentication & Authorization**: JWT-based auth with role-based access control (RBAC)
- **Database**: MongoDB with Mongoose ODM
- **Email**: MailerSend integration for transactional emails
- **Internationalization**: i18next for multi-language support
- **Security**: Helmet, CORS, bcrypt password hashing
- **Logging**: Winston for application logging
- **Validation**: Zod for request validation
- **Testing**: Vitest for unit and integration tests
- **Code Quality**: ESLint and Prettier for code formatting
- **Nginx Ready**: Pre-configured nginx setup for reverse proxy

## Architecture

### Public API (api.domain.com)
- Port: 9001
- Routes:
  - `/auth/*` - Authentication endpoints (login, register, password reset)
  - `/categories` - Public read-only category endpoints
  - All routes are public (no authentication required)

### Admin API (admin.domain.com)
- Port: 9002
- Routes:
  - `/categories` - Protected CRUD endpoints for categories
  - All routes require authentication and authorization

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Edit `.env` and configure your environment variables:
- Database connection string
- JWT secret
- MailerSend API key
- Port numbers (if different from defaults)

### 3. Development Mode

Run both servers simultaneously:
```bash
npm run dev:both
```

Or run them separately:
```bash
# Terminal 1 - Public API
npm run dev:public

# Terminal 2 - Admin API
npm run dev:admin
```

### 4. Production Deployment

See [NGINX_SETUP.md](./NGINX_SETUP.md) for detailed nginx configuration and production deployment guide.

## Available Scripts

- `npm run dev` - Run the original single server (legacy)
- `npm run dev:public` - Run public API in development mode
- `npm run dev:admin` - Run admin API in development mode
- `npm run dev:both` - Run both APIs simultaneously
- `npm run build` - Build for production
- `npm run start:public` - Start public API in production
- `npm run start:admin` - Start admin API in production
- `npm run start:both` - Start both APIs in production
- `npm test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run test:ui` - Run tests with UI
- `npm run coverage` - Generate test coverage report
- `npm run lint` - Lint code
- `npm run lint:fix` - Lint and fix code
- `npm run format` - Format code with Prettier
- `npm run type-check` - Check TypeScript types

## Project Structure

```
src/
├── apps/
│   ├── public/           # Public API server
│   │   ├── app.public.ts
│   │   └── routes/       # Public routes
│   └── protected/        # Admin API server
│       ├── app.protected.ts
│       └── routes/       # Protected routes
├── common/
│   ├── controllers/      # Request handlers
│   ├── middlewares/      # Express middlewares
│   ├── models/          # Mongoose models
│   ├── services/        # Business logic
│   ├── templates/       # Email templates
│   └── utils/           # Utility functions
├── config/              # Configuration files
├── errors/              # Custom error classes
├── interfaces/          # TypeScript interfaces
└── types/               # Type definitions
```

## Nginx Setup

The project includes a pre-configured nginx setup for reverse proxy. See [NGINX_SETUP.md](./NGINX_SETUP.md) for:
- Complete nginx installation guide
- SSL/HTTPS setup with Let's Encrypt
- PM2 process management
- Monitoring and logging
- Security best practices
- Troubleshooting tips

## API Endpoints

### Public API (api.domain.com)

**Authentication**
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/validate-reset-code` - Validate reset code
- `POST /auth/reset-password` - Reset password

**Categories**
- `GET /categories` - Get all categories (paginated)
- `GET /categories/:id` - Get category by ID

### Admin API (admin.domain.com)

All endpoints require authentication (JWT token in Authorization header).

**Categories**
- `POST /categories` - Create new category
- `PUT /categories/:id` - Update category
- `DELETE /categories/:id` - Delete category

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PUBLIC_PORT` | Port for public API | 9001 |
| `PROTECTED_PORT` | Port for admin API | 9002 |
| `MONGODB_URI` | MongoDB connection string | - |
| `JWT_SECRET` | Secret key for JWT | - |
| `MAILERSEND_API_KEY` | MailerSend API key | - |
| `MAILERSEND_FROM_EMAIL` | Sender email address | - |
| `MAILERSEND_FROM_NAME` | Sender name | - |
| `NODE_ENV` | Environment (development/production) | development |

## Testing

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run coverage
```

## Production Deployment

### Using PM2 (Recommended)

1. Build the application:
```bash
npm run build
```

2. Start with PM2 using ecosystem config:
```bash
pm2 start ecosystem.config.js
```

Or start individually:
```bash
pm2 start dist/apps/public/app.public.js --name brewaco-public
pm2 start dist/apps/protected/app.protected.js --name brewaco-admin
```

3. Save PM2 configuration:
```bash
pm2 save
pm2 startup
```

### Using Docker (Optional)

Docker configuration can be added based on your deployment needs.

## Security

- **Password Hashing**: bcrypt with configurable salt rounds
- **JWT Authentication**: Secure token-based authentication
- **CORS**: Configured for specific origins
- **Helmet**: Security headers enabled
- **Input Validation**: Zod schema validation
- **Rate Limiting**: Can be configured in nginx

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

ISC

## Support

For detailed nginx setup and deployment instructions, see [NGINX_SETUP.md](./NGINX_SETUP.md).

