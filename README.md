Backend as a Service (BaaS) Platform

A Backend as a Service (BaaS) platform for application development, providing authentication, database management, and API services. Built with Node.js, Express, MongoDB, and MySQL.

## 🚀 Key Features

- **Multi-Tenant Architecture** - Separate authentication for console and tenant users
- **Dynamic Database Management** - Create databases, collections, and attributes on-the-fly
- **Dual Authentication** - JWT-based and API key authentication
- **Google OAuth Integration** - Third-party authentication support
- **Redis Caching** - High-performance caching with auto-invalidation
- **Rate Limiting & Logging** - Built-in security and monitoring

## 💡 Engineering Highlights

- Designed a multi-tenant backend architecture with isolated authentication flows
- Implemented JWT-based authentication with automatic token refresh mechanism
- Integrated MongoDB and MySQL for different data requirements (user data vs. structured project data)
- Built dynamic schema management allowing runtime database and collection creation
- Implemented Redis caching layer with intelligent cache invalidation
- Created API-key-based access control for tenant applications
- Added rate limiting and centralized error handling for production readiness
- Structured logging system for debugging and monitoring

## 🛠️ Tech Stack

**Backend:** Node.js, Express.js  
**Databases:** MongoDB, MySQL, Redis  
**Authentication:** JWT, bcrypt, Google OAuth  
**Tools:** Mongoose, Axios, CORS, express-rate-limit

## 📐 Architecture Overview

```
Client Applications
   ↓
API Gateway (Rate Limiter, CORS, Error Handler)
   ↓
Authentication Layer (Console Auth / Tenant Auth / OAuth)
   ↓
Business Logic (Controllers: User, Project, Database, Collection, Document)
   ↓
Caching Layer (Redis)
   ↓
Data Persistence Layer
   ├── MongoDB
   │   ├── Users
   │   ├── Identities
   │   └── Sessions
   └── MySQL
       ├── Projects
       ├── Databases
       ├── Collections
       ├── Attributes
       └── Documents
```

**Architectural Decision:** MongoDB stores authentication data (users, sessions) for flexible schema and fast reads, while MySQL stores structured project data (databases, collections, documents) ensuring ACID compliance and relational integrity.

## 📁 Project Structure

```
backend/
├── src/
│   ├── app.js                     # Express configuration
│   ├── index.js                   # Entry point
│   ├── controllers/               # Business logic
│   │   ├── User.controller.js
│   │   ├── tenant.controller.js
│   │   ├── project.controller.js
│   │   └── database.controller/
│   ├── middleware/                # Auth, caching, rate limiting
│   ├── models/                    # MongoDB schemas
│   ├── routes/                    # API endpoints
│   ├── utils/                     # Helpers & logging
│   └── config/                    # Redis config
├── logs/                          # Application logs
└── .env.example                   # Environment variables template
```

## 🔧 Installation

### Prerequisites
Node.js (v16+), MongoDB, MySQL (v8.0+), Redis (v6.0+)

### Setup
```bash
# Clone and install
git clone <repository-url>
cd backend
npm install

# Setup MySQL schema
mysql -u root -p < src/schema/mysql_schema.sql

# Start Redis
redis-server

# Run application
npm run dev  # Development
node src/index.js  # Production
```

Server runs on `http://localhost:8000`

## 🔐 Environment Variables

```env
# Application
NODE_ENV=development
PORT=8000
CORS_ORIGIN=*

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net

# JWT
ACCESS_TOKEN_SECRET=<generate_secret>
ACCESS_TOKEN_LIFE=1d
REFRESH_TOKEN_SECRET=<generate_secret>
REFRESH_TOKEN_LIFE=7d

# Google OAuth
GOOGLE_CLIENT_ID=<your_client_id>
GOOGLE_CLIENT_SECRET=<your_client_secret>
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback
OAUTH_ENCRYPTION_KEY=<32_character_key>

# MySQL
MYSQL_HOST=localhost
MYSQL_USER=backend_app
MYSQL_PASSWORD=<your_password>
MYSQL_DATABASE=backend
MYSQL_PORT=3306

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

Generate secrets: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## 📡 API Endpoints

### Authentication
```http
POST   /api/v1/users/register             # Register console user
POST   /api/v1/users/login                # Login console user
POST   /api/v1/tenantuser/tenantRegister  # Register tenant user
POST   /api/v1/tenantuser/tenantlogin     # Login tenant user
GET    /auth/google                       # Google OAuth
```

### Project Management
```http
POST   /api/v1/projects/create            # Create project
GET    /api/v1/projects/list              # List all projects
GET    /api/v1/projects/:id               # Get project details
PUT    /api/v1/projects/:id               # Update project
DELETE /api/v1/projects/:id               # Delete project
```

### Database & Collections
```http
POST   /api/v1/projects/:id/createdatabase        # Create database
POST   /api/v1/database/:id/createCollection      # Create collection
POST   /api/v1/attributes/:id/attributes          # Add attribute to collection
```

### Document Operations (API Key Required)
```http
POST   /api/v1/collection/:id/documents           # Create document
GET    /api/v1/collection/:id/documents           # List documents
POST   /api/v1/collection/:id/documents/query     # Query with filters
GET    /api/v1/collection/:id/documents/:doc_id   # Get document by ID
PUT    /api/v1/collection/:id/documents/:doc_id   # Update document
DELETE /api/v1/collection/:id/documents/:doc_id   # Delete document
```

### Example: Create Document
```bash
curl -X POST http://localhost:8000/api/v1/collection/{collection_id}/documents \
  -H "X-API-Key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'
```

📄 **Complete API Documentation:** See [docs/API.md](docs/API.md) for detailed endpoint documentation with request/response examples.

## 🔒 Authentication Types

- **JWT-based Authentication** - Console users authenticate using access and refresh tokens stored in HTTP-only cookies. Automatic token refresh mechanism handles token expiration seamlessly.
- **API Key Authentication** - Tenant applications access document APIs using API keys provided per project, validated via `X-API-Key` header.

## 📝 Additional Features

- **Logging:** All logs in `logs/combined.log`, errors in `logs/error.log`
- **Caching:** Redis caching for projects, SDK details, user data
- **Rate Limiting:** Per-IP rate limits for API protection

## 👤 Author

**ANUJ YADAV**

## 📄 License

ISC License

---

**Built with ❤️ using Node.js, Express, MongoDB, and MySQL**

