# Snugglr Frontend

**React-based anonymous dating app frontend built with modern web technologies.**

## Tech Stack

- **React 19** - Latest React with hooks and functional components
- **TypeScript** - Type-safe JavaScript for better development experience
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework for rapid styling
- **Framer Motion** - Animation library for smooth UI transitions
- **React Router** - Client-side routing for SPA navigation
- **Axios** - HTTP client for API communication

## Project Structure

```
client/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── landingNavbar.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── PublicRoute.tsx
│   │   └── Sidebar.tsx
│   ├── pages/              # Route-based page components
│   │   ├── auth.tsx        # Login/Register page
│   │   ├── chat.tsx        # Chat interface
│   │   ├── create.tsx      # Create confession page
│   │   ├── home.tsx        # Main dashboard
│   │   ├── landing.tsx     # Landing page
│   │   ├── onboarding.tsx  # User setup
│   │   ├── profile.tsx     # User profile
│   │   └── settings.tsx    # App settings
│   ├── utils/              # Utility functions
│   │   ├── api.ts          # API client configuration
│   │   └── auth.ts         # Authentication helpers
│   ├── assets/             # Static assets
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # App entry point
│   └── index.css           # Global styles
├── package.json
└── vite.config.ts
```

## Key Features

### 1. **Authentication System**

- JWT-based authentication with localStorage persistence
- Protected and public route handling
- Automatic token refresh and validation

### 2. **Anonymous Matching**

- Swipe-based interface for potential matches
- Gender-compatible matching algorithm
- Real-time match notifications

### 3. **Confession System**

- Anonymous confession posting and viewing
- Like/unlike functionality
- Pagination for confession feed

### 4. **Real-time Chat**

- Socket.io integration for live messaging
- Anonymous chat until identity reveal
- Guess-based identity reveal system
- Message history and typing indicators

### 5. **User Onboarding**

- Multi-step profile creation
- Interest selection and personality setup
- University domain verification

## Core Components

### **Landing Page** (`landing.tsx`)

- Animated hero section with Framer Motion
- Call-to-action buttons for auth
- Responsive design with Tailwind CSS

### **Home Dashboard** (`home.tsx`)

- Swipeable match cards
- Confession feed with interactions
- Navigation to different app sections

### **Chat Interface** (`chat.tsx`)

- Real-time messaging with Socket.io
- Identity guessing system
- Reveal mechanics for matched users

### **Authentication** (`auth.tsx`)

- Login/register forms
- University email validation
- JWT token management

## API Integration

### **API Client** (`utils/api.ts`)

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8081";
```

- Centralized API configuration
- Automatic token attachment
- Error handling and response formatting

### **Authentication Helpers** (`utils/auth.ts`)

- Token storage and retrieval
- User session management
- Logout functionality

## State Management

- **React Hooks** - useState, useEffect for local state
- **Context API** - Global state for user authentication
- **Local Storage** - Persistent data storage
- **Socket.io** - Real-time state updates

## Styling & Animation

### **Tailwind CSS**

- Utility-first approach for rapid development
- Responsive design with mobile-first approach
- Dark/light theme support

### **Framer Motion**

- Smooth page transitions
- Interactive animations
- Loading states and micro-interactions

## Development

### **Scripts**

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### **Environment Variables**

```env
VITE_API_URL=http://localhost:8081
```

## Build & Deployment

- **Vite** handles bundling and optimization
- **TypeScript** compilation for type safety
- **Tailwind CSS** purging for minimal bundle size
- **Static asset optimization**

## Key Features Implementation

### **Route Protection**

```typescript
<ProtectedRoute>
  <Home />
</ProtectedRoute>
```

### **Real-time Updates**

```typescript
useEffect(() => {
  socket.on("new_message", handleNewMessage);
  return () => socket.off("new_message");
}, []);
```

## Performance Optimizations

- **Code splitting** with React.lazy()
- **Image optimization** for user profiles
- **Bundle size optimization** with Vite
- **Real-time efficiency** with Socket.io

## Upcoming Features

### 1. **Media Sharing**

- **Image Upload**: Users can upload and share images in chat conversations
- **Profile Pictures**: Custom profile picture upload and management
- **Image Compression**: Automatic image optimization for faster loading
- **Media Gallery**: View and manage shared media in conversations

### 2. **Voice Messages**

- **Voice Recording**: Record and send voice messages in chats
- **Audio Playback**: Built-in audio player with waveform visualization
- **Voice Transcription**: Optional text transcription of voice messages
- **Audio Quality Settings**: Configurable recording quality options

### 3. **Theme Customization**

- **Dark/Light Mode**: Toggle between dark and light themes
- **Custom Themes**: Personalized color schemes and layouts
- **System Theme**: Automatic theme detection based on device settings
- **Theme Persistence**: Save user theme preferences across sessions

### 4. **Privacy & Security Center**

- **Privacy Settings**: Granular control over profile visibility and data sharing
- **Security Dashboard**: Account security overview and settings
- **Block/Report System**: Enhanced user blocking and content reporting
- **Data Management**: View, download, and delete personal data
- **Activity Logs**: Track account activity and login history

### 5. **Admin Dashboard**

- **Content Moderation**: Review and manage user-generated content
- **User Management**: Monitor user activity and handle reports
- **Analytics Dashboard**: App usage statistics and insights
- **System Settings**: Configure app-wide settings and features
- **Notification Center**: Send system-wide announcements
