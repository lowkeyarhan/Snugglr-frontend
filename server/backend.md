# Snugglr Backend

**Node.js/Express API server with MongoDB and real-time Socket.io integration.**

## Tech Stack

- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **Socket.io** - Real-time bidirectional communication
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing and security
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security middleware

## Project Structure

```
server/
├── config/                 # Configuration files
│   ├── db.js              # Database connection
│   └── token.js           # JWT configuration
├── controllers/           # Business logic controllers
│   ├── authController.js  # Authentication logic
│   ├── adminController.js # Admin domain management
│   ├── chatController.js  # Chat management
│   ├── confessionController.js # Confession system
│   ├── domainController.js # Domain verification
│   ├── matchController.js # Matching algorithm
│   ├── userController.js  # User management
│   └── notificationController.js # Notifications
├── middleware/            # Custom middleware
│   └── authMiddleware.js  # JWT authentication
├── models/               # Database models
│   ├── User.js           # User schema
│   ├── Match.js          # Match relationships
│   ├── Chat.js           # Chat rooms
│   ├── Message.js        # Individual messages
│   ├── Confession.js     # Anonymous confessions
│   └── Notification.js   # User notifications
├── routes/               # API route definitions
│   ├── authRoutes.js     # Authentication endpoints
│   ├── adminRoutes.js    # Admin endpoints
│   ├── chatRoutes.js     # Chat endpoints
│   ├── confessionRoutes.js # Confession endpoints
│   ├── domainRoutes.js   # Domain endpoints
│   ├── matchRoutes.js    # Matching endpoints
│   ├── notificationRoutes.js # Notification endpoints
│   └── userRoutes.js     # User endpoints
├── sockets/              # Socket.io handlers
│   ├── chatSocket.js     # Real-time chat
│   └── notificationSocket.js # Live notifications
├── utils/                # Utility functions
│   ├── errorHandler.js   # Error handling
│   └── notificationHelper.js # Notification logic
└── server.js             # Main server file
```

## Core Features

### 1. **Authentication System**

- JWT-based authentication with refresh tokens
- University domain verification
- Password hashing with bcryptjs
- Protected route middleware

### 2. **Matching Algorithm**

- Gender-compatible matching
- Swipe-based interaction system
- Mutual match detection
- Automatic chat room creation

### 3. **Real-time Chat**

- Socket.io for live messaging
- Anonymous chat until identity reveal
- Message persistence in MongoDB
- Typing indicators and read receipts

### 4. **Confession System**

- Anonymous confession posting
- Like/unlike functionality
- Automatic cleanup of old confessions
- Pagination and filtering

### 5. **Notification System**

- Real-time push notifications
- Match notifications
- Message notifications
- System-wide announcements

## Database Models

### **User Model**

```javascript
{
  email: String,
  username: String,
  gender: String,
  age: Number,
  interests: [String],
  image: String,
  university: String,
  // ... other profile fields
}
```

### **Match Model**

```javascript
{
  user1: ObjectId,
  user2: ObjectId,
  status: String, // 'pending', 'matched', 'rejected'
  user1Username: String,
  user2Username: String
}
```

### **Chat Model**

```javascript
{
  users: [ObjectId],
  revealed: Boolean,
  lastMessage: ObjectId,
  createdAt: Date
}
```

## Complete API Routes

### **Authentication Routes** (`/api/auth`)

```
POST   /api/auth/register              # User registration with university email
POST   /api/auth/login                 # User login with email/password
GET    /api/auth/me                    # Get current user profile (Protected)
PUT    /api/auth/change-password       # Change user password (Protected)
```

### **User Routes** (`/api/user`)

```
PUT    /api/user/profile               # Update user profile (Protected)
PUT    /api/user/settings              # Update user settings (Protected)
GET    /api/user/potential-matches     # Get potential matches for swiping (Protected)
GET    /api/user/:userId               # Get specific user profile (Protected)
GET    /api/user/community/:community  # Get users by community (Protected)
```

### **Match Routes** (`/api/match`)

```
POST   /api/match/swipe                # Swipe on a user (like/pass) (Protected)
GET    /api/match/matches              # Get user's current matches (Protected)
```

### **Chat Routes** (`/api/chat`)

```
GET    /api/chat                       # Get user's chat conversations (Protected)
GET    /api/chat/:chatId/messages      # Get chat message history (Protected)
POST   /api/chat/:chatId/message       # Send a message to chat (Protected)
POST   /api/chat/guess                 # Submit identity guess (Protected)
GET    /api/chat/:chatId/reveal-status # Get reveal status for chat (Protected)
```

### **Confession Routes** (`/api/confessions`)

```
POST   /api/confessions                # Create new confession (Protected)
GET    /api/confessions                # Get confessions feed with pagination (Protected)
POST   /api/confessions/:confessionId/like    # Like/unlike confession (Protected)
POST   /api/confessions/:confessionId/comment # Comment on confession (Protected)
POST   /api/confessions/cleanup        # Manual cleanup of old confessions (Protected)
```

### **Notification Routes** (`/api/notifications`)

```
GET    /api/notifications              # Get user notifications (Protected)
GET    /api/notifications/unread-count # Get unread notification count (Protected)
PATCH  /api/notifications/:notificationId/read # Mark notification as read (Protected)
PATCH  /api/notifications/read-all    # Mark all notifications as read (Protected)
DELETE /api/notifications/:notificationId     # Delete notification (Protected)
DELETE /api/notifications/clear-read  # Clear all read notifications (Protected)
```

### **Domain Routes** (`/api/domains`)

```
POST   /api/domains/verify             # Verify if email domain is allowed (Public)
GET    /api/domains                    # Get allowed university domains (Public)
GET    /api/domains/:id                # Get specific domain by ID (Public)
```

### **Admin Routes** (`/api/admin`)

```
POST   /api/admin/domains              # Add new allowed domain (Protected)
PUT    /api/admin/domains/:id          # Update allowed domain (Protected)
DELETE /api/admin/domains/:id          # Delete allowed domain (Protected)
```

**Note:** Admin access is verified by checking the user's email against an environment variable containing authorized admin emails. Only users with emails listed in the admin configuration will have access to admin routes.

## Real-time Systems Explained

### **Match Notification System**

#### **How Match Notifications Work:**

1. **Swipe Process**: When User A swipes right on User B
2. **Database Check**: System checks if User B has already swiped right on User A
3. **Match Creation**: If mutual swipe exists, creates a Match record with status "matched"
4. **Chat Room**: Automatically creates a Chat room for the matched users
5. **Notification Generation**: Creates notifications for both users
6. **Real-time Delivery**: Socket.io broadcasts notifications instantly
7. **Frontend Update**: Both users see the match notification in real-time

#### **Notification Flow:**

```javascript
// When a match occurs
const match = await Match.create({
  user1: currentUserId,
  user2: targetUserId,
  status: "matched",
  user1Username: currentUsername,
  user2Username: targetUser.username
});

// Create chat room
const chat = await Chat.create({
  users: [currentUserId, targetUserId],
  revealed: false
});

// Send notifications to both users
await createAndEmitNotification({
  recipient: currentUserId,
  sender: targetUserId,
  type: "new_match",
  title: "It's a Match! 🎉",
  message: "You have a new match! Start chatting now.",
  relatedMatch: match._id,
  relatedChat: chat._id
}, io);
```

### **Chat System Architecture**

#### **How Real-time Chat Works:**

1. **Connection**: User connects to Socket.io server
2. **Room Joining**: User joins chat-specific rooms
3. **Message Broadcasting**: Messages sent to all users in chat room
4. **Message Persistence**: All messages saved to MongoDB
5. **Typing Indicators**: Real-time typing status updates
6. **Message Status**: Read receipts and delivery confirmation

#### **Chat Socket Events:**

```javascript
// Client sends message
socket.emit('send_message', {
  chatId: 'chat123',
  message: 'Hello!',
  type: 'text'
});

// Server broadcasts to chat room
io.to('chat123').emit('new_message', {
  id: 'msg456',
  sender: 'user789',
  message: 'Hello!',
  timestamp: new Date(),
  type: 'text'
});

// Typing indicators
socket.emit('typing_start', { chatId: 'chat123' });
socket.emit('typing_stop', { chatId: 'chat123' });
```

#### **Identity Reveal System:**

1. **Anonymous Phase**: Users chat without knowing each other's identity
2. **Guess Submission**: Users can guess their match's identity
3. **Reveal Trigger**: When both users guess correctly, identities are revealed
4. **Chat Update**: Chat status changes from anonymous to revealed
5. **Profile Access**: Users can now see each other's profiles

### **Socket.io Integration**

#### **Chat Socket** (`sockets/chatSocket.js`)

- **Message Broadcasting**: Real-time message delivery to chat participants
- **Typing Indicators**: Live typing status updates
- **Online/Offline Status**: User presence tracking
- **Message Delivery Confirmation**: Read receipts and delivery status
- **File Sharing**: Real-time media sharing capabilities
- **Voice Messages**: Audio message broadcasting

#### **Notification Socket** (`sockets/notificationSocket.js`)

- **Live Notification Delivery**: Instant notification broadcasting
- **Match Notifications**: Real-time match alerts
- **System Announcements**: Admin broadcast messages
- **Push Notification Support**: Mobile push notification integration
- **Notification Preferences**: User-specific notification settings

## Security Features

### **Authentication Middleware**

```javascript
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization');
  // JWT verification logic
};
```

### **Input Validation**

- Express-validator for request validation
- Sanitization of user inputs
- Rate limiting for API endpoints

### **Security Headers**

- Helmet.js for security headers
- CORS configuration
- Environment variable protection

## Real-time Features

### **Chat System**

- Instant message delivery
- Typing indicators
- Message status tracking
- File sharing capabilities

### **Notification System**

- Push notifications for matches
- Real-time updates for messages
- System-wide announcements
- User activity tracking

## Database Operations

### **MongoDB Integration**

```javascript
// Connection setup
mongoose.connect(process.env.MONGODB_URI);

// Model operations
const user = await User.findById(userId);
const match = await Match.create(matchData);
```

### **Data Relationships**

- User-Match relationships
- Chat-Message associations
- Notification-User connections
- Confession-User interactions

## Error Handling

### **Centralized Error Handler**

```javascript
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
};
```

### **Validation Errors**

- Input validation with express-validator
- Custom error messages
- Graceful error responses

## Performance Optimizations

### **Database Indexing**

- User email and username indexes
- Match relationship indexes
- Message timestamp indexes

### **Caching Strategy**

- JWT token caching
- User session management
- Real-time data optimization

## Development

### **Scripts**

```bash
npm run dev        # Start with nodemon
npm start          # Production start
npm run seed:domains # Seed allowed domains
```

### **Environment Variables**

```env
MONGODB_URI=mongodb://localhost:27017/snugglr
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:5173
PORT=8081
```

## Deployment Considerations

### **Production Setup**

- Environment variable configuration
- Database connection pooling
- Error logging and monitoring
- Health check endpoints

### **Scalability**

- Horizontal scaling with Socket.io
- Database connection optimization
- Caching strategies
- Load balancing support

## API Documentation

### **Request/Response Format**

```javascript
// Success Response
{
  success: true,
  message: "Operation successful",
  data: { /* response data */ }
}

// Error Response
{
  success: false,
  message: "Error description",
  error: "Detailed error info"
}
```

### **Authentication Headers**

```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

## Monitoring & Logging

- Console logging for development
- Error tracking and reporting
- Performance monitoring
- Database query optimization

## Upcoming Features

### 1. **Media Sharing System**

- **Image Upload API**: Endpoints for uploading and sharing images in chats
- **Profile Picture Management**: User profile image upload and management
- **Media Storage**: Cloud storage integration (AWS S3/Cloudinary)
- **Image Processing**: Automatic image compression and optimization
- **Media Gallery**: API endpoints for viewing shared media in conversations

### 2. **Voice Message System**

- **Audio Upload**: Endpoints for voice message recording and upload
- **Audio Processing**: Server-side audio compression and format conversion
- **Audio Storage**: Secure storage for voice messages
- **Transcription Service**: Optional voice-to-text conversion
- **Audio Streaming**: Real-time audio message delivery

### 3. **Theme & Preferences API**

- **Theme Settings**: User theme preference storage and retrieval
- **Custom Themes**: API for creating and managing custom themes
- **System Integration**: Device theme detection and synchronization
- **Preference Management**: Comprehensive user preference system

### 4. **Enhanced Privacy & Security**

- **Privacy Controls**: Granular privacy settings API
- **Security Dashboard**: User security overview and management
- **Block/Report System**: Enhanced user blocking and content reporting
- **Data Management**: GDPR-compliant data export and deletion
- **Activity Logging**: Comprehensive user activity tracking
- **Two-Factor Authentication**: Enhanced security with 2FA support

### 5. **Admin Dashboard Backend**

- **Admin Authentication**: Role-based access control for administrators
- **Content Moderation**: API for reviewing and managing user content
- **User Management**: Comprehensive user administration endpoints
- **Analytics API**: Detailed app usage statistics and insights
- **System Configuration**: App-wide settings management
- **Notification Center**: System-wide announcement broadcasting
- **Report Management**: User report review and resolution system

### 6. **Advanced Chat Features**

- **Message Reactions**: Emoji reactions to messages
- **Message Threading**: Reply-to-message functionality
- **Chat Backup**: Message history backup and restore
- **Message Search**: Full-text search across chat history
- **Chat Export**: Export chat conversations

### 7. **Enhanced Matching System**

- **Advanced Filters**: More sophisticated matching criteria
- **Location-Based Matching**: Geographic proximity matching
- **Interest-Based Matching**: Enhanced algorithm based on user interests
- **Matching Analytics**: Detailed matching statistics and insights
- **Super Likes**: Premium matching features

### 8. **Performance & Scalability**

- **Microservices Architecture**: Breaking down monolithic structure
- **Redis Caching**: Advanced caching for better performance
- **Database Sharding**: Horizontal database scaling
- **CDN Integration**: Content delivery network for media
- **Load Balancing**: Advanced load balancing strategies
