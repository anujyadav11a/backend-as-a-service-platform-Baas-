# API Documentation

Complete API reference for Backend as a Service (BaaS) Platform.

## Base URL
```
http://localhost:8000
```

## Authentication

All authenticated endpoints require either:
- **JWT Token** (Console Users): Pass in `Authorization` header or HTTP-only cookie
- **API Key** (Tenant Applications): Pass in `X-API-Key` header

---

## Console User Authentication

### Register User
```http
POST /api/v1/users/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user_id",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### Login User
```http
POST /api/v1/users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token",
    "user": {
      "id": "user_id",
      "email": "user@example.com"
    }
  }
}
```

### Logout User
```http
POST /api/v1/users/logout
Authorization: Bearer <access_token>
```

---

## Tenant User Authentication

### Register Tenant User
```http
POST /api/v1/tenantuser/tenantRegister
Content-Type: application/json

{
  "email": "tenant@example.com",
  "password": "securePassword123",
  "name": "Jane Doe"
}
```

### Login Tenant User
```http
POST /api/v1/tenantuser/tenantlogin
Content-Type: application/json

{
  "email": "tenant@example.com",
  "password": "securePassword123"
}
```

### Get Current Tenant User
```http
GET /api/v1/tenantuser/getCurrentUser
Authorization: Bearer <access_token>
```

### Get Tenant Sessions
```http
GET /api/v1/tenantuser/getTenantsessions
Authorization: Bearer <access_token>
```

### Revoke Tenant Session
```http
DELETE /api/v1/tenantuser/revokeSession/:sessionId
Authorization: Bearer <access_token>
```

---

## Google OAuth

### Initiate Google OAuth
```http
GET /auth/google
```
Redirects to Google OAuth consent screen.

### OAuth Callback
```http
GET /auth/google/callback?code=<auth_code>
```
Handles OAuth callback and creates/authenticates user.

---

## Project Management

### Create Project
```http
POST /api/v1/projects/create
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "My Project",
  "description": "Project description"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "projectId": "proj_123",
    "name": "My Project",
    "apiKey": "generated_api_key"
  }
}
```

### List User Projects
```http
GET /api/v1/projects/list
Authorization: Bearer <access_token>
```

### Get Project Details
```http
GET /api/v1/projects/:project_id
Authorization: Bearer <access_token>
```

### Get Project SDK Details
```http
POST /api/v1/projects/sdkdetails
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "projectId": "proj_123"
}
```

### Update Project
```http
PUT /api/v1/projects/:projectId
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Updated Project Name",
  "description": "Updated description"
}
```

### Delete Project
```http
DELETE /api/v1/projects/:projectId
Authorization: Bearer <access_token>
```

### Search Projects
```http
GET /api/v1/projects/search?q=search_term
Authorization: Bearer <access_token>
```

---

## Database Management

### Create Database
```http
POST /api/v1/projects/:project_id/createdatabase
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "my_database",
  "description": "Database description"
}
```

### List All Databases
```http
GET /api/v1/projects/:project_id/listdatabases
Authorization: Bearer <access_token>
```

### Delete Database
```http
DELETE /api/v1/database/deleteDatabase/:database_id
Authorization: Bearer <access_token>
```

---

## Collection Management

### Create Collection
```http
POST /api/v1/database/:database_id/createCollection
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "users_collection",
  "description": "Collection for user data"
}
```

### List All Collections
```http
GET /api/v1/database/:database_id/listCollections
Authorization: Bearer <access_token>
```

### Delete Collection
```http
DELETE /api/v1/collection/deleteCollection/:collection_id
Authorization: Bearer <access_token>
```

---

## Attribute Management

### Add Attribute (Column)
```http
POST /api/v1/attributes/:collection_id/attributes
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "email",
  "type": "VARCHAR",
  "size": 255,
  "required": true,
  "unique": true,
  "defaultValue": null
}
```

**Supported Types:**
- VARCHAR
- INT
- TEXT
- DATE
- DATETIME
- BOOLEAN
- DECIMAL

### List Attributes
```http
GET /api/v1/attributes/:collection_id/attributes
Authorization: Bearer <access_token>
```

### Update Attribute
```http
PUT /api/v1/attributes/:collection_id/attributes/:attribute_id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "email_address",
  "type": "VARCHAR",
  "size": 300
}
```

### Delete Attribute
```http
DELETE /api/v1/attributes/:collection_id/attributes/:attribute_id
Authorization: Bearer <access_token>
```

---

## Document Operations

**Note:** All document operations require API Key authentication via `X-API-Key` header.

### Create Document
```http
POST /api/v1/collection/:collection_id/documents
X-API-Key: <your_api_key>
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30,
  "status": "active"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "documentId": "doc_123",
    "name": "John Doe",
    "email": "john@example.com",
    "age": 30,
    "status": "active",
    "createdAt": "2026-08-22T10:30:00Z"
  }
}
```

### Get All Documents (with pagination)
```http
GET /api/v1/collection/:collection_id/documents?page=1&limit=10
X-API-Key: <your_api_key>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 10, max: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "documents": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalDocuments": 50,
      "limit": 10
    }
  }
}
```

### Query Documents (with filters)
```http
POST /api/v1/collection/:collection_id/documents/query
X-API-Key: <your_api_key>
Content-Type: application/json

{
  "filters": {
    "age": { "$gte": 18, "$lte": 65 },
    "status": "active",
    "name": { "$like": "John%" }
  },
  "sort": {
    "field": "createdAt",
    "order": "DESC"
  },
  "page": 1,
  "limit": 10
}
```

**Supported Filter Operators:**
- `$eq`: Equal to
- `$ne`: Not equal to
- `$gt`: Greater than
- `$gte`: Greater than or equal to
- `$lt`: Less than
- `$lte`: Less than or equal to
- `$like`: Pattern matching (SQL LIKE)
- `$in`: Value in array

### Get Document by ID
```http
GET /api/v1/collection/:collection_id/documents/:document_id
X-API-Key: <your_api_key>
```

### Update Document
```http
PUT /api/v1/collection/:collection_id/documents/:document_id
X-API-Key: <your_api_key>
Content-Type: application/json

{
  "name": "John Updated",
  "age": 31,
  "status": "inactive"
}
```

### Delete Document
```http
DELETE /api/v1/collection/:collection_id/documents/:document_id
X-API-Key: <your_api_key>
```

---

## Error Responses

All endpoints return standardized error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

**Common Error Codes:**
- `400`: Bad Request - Invalid input
- `401`: Unauthorized - Missing or invalid authentication
- `403`: Forbidden - Insufficient permissions
- `404`: Not Found - Resource doesn't exist
- `409`: Conflict - Resource already exists
- `429`: Too Many Requests - Rate limit exceeded
- `500`: Internal Server Error

---

## Rate Limits

- **Default Rate Limit**: 100 requests per 15 minutes per IP
- **Document API**: 1000 requests per hour per API key

Rate limit headers included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1629876543
```

---

## Caching

Cached endpoints (automatically invalidated on updates):
- `GET /api/v1/projects/list` - 5 minutes
- `GET /api/v1/projects/:id` - 5 minutes
- `POST /api/v1/projects/sdkdetails` - 10 minutes
- `GET /api/v1/tenantuser/getCurrentUser` - 2 minutes

---

## Pagination

All list endpoints support pagination:

**Query Parameters:**
- `page`: Page number (starts at 1)
- `limit`: Items per page (default: 10, max: 100)

**Response Format:**
```json
{
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10
  }
}
```
