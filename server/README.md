# Snugglr Backend API

A comprehensive backend API for Snugglr, a social platform designed for college students to connect, share confessions, and chat anonymously within their institution. Built with Express.js, TypeScript, and MongoDB.

## Overview

Snugglr is a college-focused social platform that enables students to:

- **Share anonymous confessions** within their institution
- **Engage with confessions** through likes and comments
- **Chat privately** with other students (personal and group chats)
- **Manage profiles** with preferences and personal information
- **Connect securely** with institution-based authentication

The backend provides RESTful APIs with JWT authentication, comprehensive Swagger documentation, and MongoDB for data persistence.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js 5.x
- **Language**: TypeScript
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens)
- **Documentation**: Swagger/OpenAPI 3.0
- **Security**: bcrypt for password hashing

## Database Schema

### Models

#### 1. **User** (`models/profile/User.ts`)

Represents a user account in the system.

**Fields:**

- `name` (String, required): User's full name (3-30 characters)
- `username` (String, required, unique): Auto-generated anonymous username (6-30 characters)
- `email` (String, required, unique): Email address (must be from allowed college domain)
- `password` (String, required): Hashed password (min 8 characters)
- `role` (String, enum): User role - `user`, `admin`, or `superadmin` (default: `user`)
- `phoneNumber` (String, optional): User's phone number
- `collegeName` (String, optional): Name of the college
- `institution` (ObjectId, required): Reference to `AllowedCollege`
- `profilePicture` (String, optional): URL to profile picture
- `birthday` (Date, optional): User's date of birth
- `gender` (String, enum, optional): `male`, `female`, `non-binary`, `other`, `prefer-not-to-say`
- `pronouns` (String, optional): User's preferred pronouns
- `favArtists` (Array[String], default: []): Favorite artists
- `favMovies` (Array[String], default: []): Favorite movies
- `favAlbums` (Array[String], default: []): Favorite albums
- `favSpotOnCampus` (String, optional): Favorite spot on campus
- `loveLanguage` (String, optional): User's love language
- `quirkyFacts` (String, optional, max 500 chars): Quirky facts about the user
- `idealDate` (String, optional, max 500 chars): Description of ideal date
- `fantasies` (String, optional, max 500 chars): User fantasies
- `isActive` (Boolean, default: true): Account status
- `createdAt` (Date, auto): Creation timestamp
- `updatedAt` (Date, auto): Last update timestamp

**Indexes:**

- `email` (unique)
- `username` (unique, case-insensitive)

**Virtual:**

- `age`: Calculated from `birthday`

---

#### 2. **AllowedCollege** (`models/admin/AllowedCollege.ts`)

Represents an institution/college that is allowed to use the platform.

**Fields:**

- `institutionName` (String, required): Name of the institution
- `domain` (String, required, unique): Email domain (e.g., "college.edu")
- `isActive` (Boolean, default: true): Whether the institution is active
- `createdAt` (Date, auto): Creation timestamp
- `updatedAt` (Date, auto): Last update timestamp

**Indexes:**

- `domain` (unique)

---

#### 3. **Confession** (`models/confessions/Confession.ts`)

Represents an anonymous confession posted by a user.

**Fields:**

- `user` (ObjectId, required): Reference to `User` who posted
- `confession` (String, required, max 1000 chars): The confession text
- `institution` (ObjectId, required): Reference to `AllowedCollege`
- `likesCount` (Number, default: 0): Number of likes
- `createdAt` (Date, auto): Creation timestamp
- `updatedAt` (Date, auto): Last update timestamp

**Indexes:**

- `institution` + `createdAt` (descending) - for efficient pagination

---

#### 4. **Comment** (`models/confessions/Comment.ts`)

Represents a comment on a confession or a reply to another comment.

**Fields:**

- `confession` (ObjectId, required): Reference to `Confession`
- `user` (ObjectId, required): Reference to `User` who commented
- `text` (String, required, max 500 chars): Comment text
- `parentComment` (ObjectId, optional): Reference to parent `Comment` (for replies)
- `likesCount` (Number, default: 0): Number of likes
- `createdAt` (Date, auto): Creation timestamp
- `updatedAt` (Date, auto): Last update timestamp

**Indexes:**

- `confession`

---

#### 5. **Like** (`models/confessions/Like.ts`)

Represents a like on a confession or comment.

**Fields:**

- `user` (ObjectId, required): Reference to `User` who liked
- `targetId` (ObjectId, required): ID of the target (confession or comment)
- `targetType` (String, enum, required): `confession` or `comment`
- `createdAt` (Date, auto): Creation timestamp
- `updatedAt` (Date, auto): Last update timestamp

**Indexes:**

- `user` + `targetId` + `targetType` (unique) - prevents duplicate likes

---

#### 6. **ChatRoom** (`models/chats/ChatRoom.ts`)

Represents a chatroom (personal or group).

**Fields:**

- `institute` (ObjectId, required): Reference to `AllowedCollege`
- `users` (Array[ObjectId], required): Array of `User` IDs in the chat
- `type` (String, enum, required): `personal` or `group`
- `groupName` (String, optional): Name of the group (only for group chats)
- `revealed` (Boolean, default: false): Whether identities are revealed
- `createdAt` (Date, auto): Creation timestamp
- `updatedAt` (Date, auto): Last update timestamp

**Indexes:**

- `institute`
- `users` + `institute` (unique, partial filter: `type === "personal"`) - prevents duplicate personal chats

**Pre-save Hook:**

- Sorts user IDs for personal chats to ensure consistent ordering

---

#### 7. **Message** (`models/chats/Message.ts`)

Represents a message in a chatroom.

**Fields:**

- `chatId` (ObjectId, required): Reference to `ChatRoom`
- `sender` (ObjectId, required): Reference to `User` who sent the message
- `text` (String, optional): Message content (for text messages)
- `type` (String, enum, default: "text"): `text` or `system`
- `readBy` (Array[ObjectId], default: []): Array of `User` IDs who have read the message
- `createdAt` (Date, auto): Creation timestamp
- `updatedAt` (Date, auto): Last update timestamp

**Indexes:**

- `chatId` + `createdAt` (descending) - for efficient message loading

---

## API Endpoints

### Base URL

```
http://localhost:8080/api
```

### Authentication

All endpoints except `/auth/register` and `/auth/login` require a Bearer token in the Authorization header:

```
Authorization: Bearer <token>
```

---

### Authentication Routes (`/api/auth`)

#### `POST /auth/register`

Register a new user account.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john.doe@college.edu",
  "password": "SecurePass123",
  "gender": "male",
  "birthday": "2000-01-15",
  "pronouns": "he/him"
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "User created successfully",
  "user": { ... },
  "token": "jwt_token_here"
}
```

---

#### `POST /auth/login`

Login with email or phone number.

**Request Body:**

```json
{
  "email": "john.doe@college.edu",
  "password": "SecurePass123"
}
```

OR

```json
{
  "phoneNumber": "+1234567890",
  "password": "SecurePass123"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "jwt_token_here"
  }
}
```

---

### User Profile Routes (`/api/profile`)

#### `GET /profile/me`

Get the authenticated user's profile.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "...",
    "username": "...",
    "email": "...",
    ...
  }
}
```

---

#### `PUT /profile/update`

Update the authenticated user's profile.

**Headers:** `Authorization: Bearer <token>`

**Request Body:** (all fields optional)

```json
{
  "name": "Updated Name",
  "username": "newusername",
  "favArtists": ["Artist1", "Artist2"],
  ...
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": { ... }
}
```

---

### Confession Routes (`/api/confession`)

#### `POST /confession`

Create a new confession.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "text": "I have a crush on someone in my class but too shy to talk"
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "confession": "...",
    "user": "...",
    "institution": "...",
    "likesCount": 0,
    "createdAt": "..."
  }
}
```

---

#### `GET /confession`

Get all confessions for the user's institution (paginated).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

- `page` (integer, default: 1): Page number
- `limit` (integer, default: 20): Items per page

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "confessions": [...],
    "currentPage": 1,
    "totalPages": 5,
    "totalConfessions": 100
  }
}
```

---

#### `POST /confession/:confessionId/like`

Like or unlike a confession.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

```json
{
  "success": true,
  "liked": true
}
```

---

#### `POST /confession/:confessionId/comment`

Comment on a confession.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "text": "I totally agree with this!"
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "data": { ... }
}
```

---

#### `POST /confession/:confessionId/comment/:commentId/reply`

Reply to a comment.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "text": "I think so too!"
}
```

**Response:** `201 Created`

---

#### `POST /confession/:commentId/like`

Like or unlike a comment.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

```json
{
  "success": true,
  "liked": true
}
```

---

#### `GET /confession/:confessionId/comments`

Get all comments for a confession.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [...]
}
```

---

### Chatroom Routes (`/api/room`)

#### `POST /room/personal`

Create a new personal chatroom (1-on-1 chat).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "userIds": ["user_id_1", "user_id_2"]
}
```

**Response:** `200 OK` (if exists) or `201 Created` (if new)

```json
{
  "_id": "...",
  "institute": "...",
  "users": ["...", "..."],
  "type": "personal",
  "revealed": false,
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

#### `POST /room/group`

Create a new group chatroom.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "userIds": ["user_id_1", "user_id_2", "user_id_3"],
  "groupName": "Study Group"
}
```

**Response:** `201 Created`

```json
{
  "_id": "...",
  "institute": "...",
  "users": ["...", "...", "..."],
  "type": "group",
  "groupName": "Study Group",
  "revealed": false,
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

#### `GET /room/my-chats`

Get all chatrooms for the authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

```json
[
  {
    "_id": "...",
    "institute": "...",
    "users": [{ "_id": "...", "name": "..." }],
    "type": "personal",
    "createdAt": "...",
    "updatedAt": "..."
  },
  ...
]
```

---

#### `GET /room/:chatId`

Get a single chatroom by ID.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

```json
{
  "_id": "...",
  "institute": "...",
  "users": [{ "_id": "...", "name": "..." }],
  "type": "group",
  "groupName": "...",
  "revealed": false,
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

#### `POST /room/add-user`

Add a user to a group chat.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "chatId": "chat_id",
  "userIdToAdd": "user_id"
}
```

**Response:** `200 OK`

```json
{
  "_id": "...",
  "users": ["...", "...", "...", "..."],
  ...
}
```

---

#### `POST /room/remove-user`

Remove a user from a group chat.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "chatId": "chat_id",
  "userIdToRemove": "user_id"
}
```

**Response:** `200 OK`

---

### Message Routes (`/api/message`)

#### `GET /message/:chatId`

Get messages for a chatroom (paginated).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

- `page` (integer, default: 1): Page number
- `limit` (integer, default: 50): Messages per page

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "_id": "...",
        "text": "...",
        "sender": { "_id": "...", "name": "...", "username": "..." },
        "readBy": [...],
        "createdAt": "..."
      },
      ...
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "totalMessages": 150,
      "totalPages": 3,
      "revealed": false
    }
  }
}
```

---

#### `POST /message/:chatId`

Send a new message to a chatroom.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "text": "Hello everyone!"
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "message": {
      "_id": "...",
      "text": "...",
      "sender": { ... },
      "readBy": [],
      "createdAt": "..."
    }
  }
}
```

---

## File Structure

```
Snugglr backend new/
├── configs/                    # Configuration files
│   ├── jwt.ts                 # JWT token generation utilities
│   ├── mongoDb.ts             # MongoDB connection setup
│   └── swagger.ts             # Swagger/OpenAPI configuration
│
├── controllers/               # Request handlers (business logic)
│   ├── authController.ts      # Authentication logic (register, login)
│   ├── confessionController.ts # Confession CRUD and interactions
│   ├── messageController.ts   # Message sending and retrieval
│   ├── roomController.ts      # Chatroom management
│   └── userController.ts      # User profile management
│
├── middleware/                # Express middleware
│   └── authMiddleware.ts      # JWT authentication middleware
│
├── models/                    # Mongoose schemas/models
│   ├── admin/
│   │   └── AllowedCollege.ts  # Institution/college model
│   ├── chats/
│   │   ├── ChatRoom.ts        # Chatroom model
│   │   └── Message.ts         # Message model
│   ├── confessions/
│   │   ├── Comment.ts         # Comment model
│   │   ├── Confession.ts      # Confession model
│   │   └── Like.ts            # Like model
│   ├── preferences/
│   │   └── Settings.ts        # User settings (currently empty)
│   └── profile/
│       └── User.ts            # User model
│
├── routes/                    # Express route definitions
│   ├── authRoute.ts          # Authentication routes
│   ├── confessionRoute.ts    # Confession routes
│   ├── messageRoute.ts       # Message routes
│   ├── roomRoute.ts          # Chatroom routes
│   └── userRoute.ts          # User profile routes
│
├── utils/                     # Utility functions
│   └── usernameGenerator.ts  # Anonymous username generation
│
├── index.ts                   # Application entry point
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── nodemon.json               # Nodemon configuration
└── README.md                  # This file
```

---

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=8080
CLIENT_URL=http://localhost:5173

# Database
MONGO_URI=mongodb://localhost:27017/snugglr

# JWT Configuration
JWT_SECRET=your_secret_key_here
JWT_EXPIRY=21d
```

---

## Installation & Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd "Snugglr backend new"
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   npm start
   ```

---

## API Documentation

Interactive API documentation is available via Swagger UI when the server is running:

```
http://localhost:8080/api-docs
```

The Swagger documentation includes:

- All available endpoints
- Request/response schemas
- Authentication requirements
- Example requests and responses

---

## Key Features

### Security

- JWT-based authentication
- Password hashing with bcrypt
- Institution-based access control
- Email domain validation for registration

### Data Integrity

- Unique constraints on critical fields
- Indexes for optimized queries
- Pre-save hooks for data consistency
- Validation at schema level

### User Experience

- Anonymous username generation
- Pagination for large datasets
- Read receipts for messages
- Institution-scoped content (confessions, chats)

### Scalability

- Efficient database indexing
- Pagination support
- Lean queries where appropriate
- Modular code structure

---

## Development

### Scripts

- `npm run dev` - Start development server with hot reload (nodemon)
- `npm start` - Start production server
- `npm test` - Run tests (not yet implemented)

### Code Style

- TypeScript for type safety
- Express.js for routing
- Mongoose for database operations
- JSDoc comments for Swagger documentation

---

## License

ISC

---

## Author

Snugglr Development Team
