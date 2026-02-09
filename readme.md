# Snugglr - Anonymous Campus Dating Platform

<div align="center">
  <h3>Your Campus. Your Mystery. Your Match.</h3>
  <p>The premium anonymous dating experience designed exclusively for university students.</p>
</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Architecture](#architecture)
- [Key Components](#key-components)
- [State Management](#state-management)
- [Routing](#routing)
- [API Integration](#api-integration)
- [Styling](#styling)
- [Development Guidelines](#development-guidelines)

---

## 🎯 Overview

Snugglr is a modern, anonymous dating platform built specifically for university students. It prioritizes **personality over appearance**, **safety over exposure**, and **genuine connections over superficial interactions**.

The platform allows students to:

- Create anonymous profiles with personality-driven content
- Match with other students based on interests and vibes
- Chat anonymously before revealing identities
- Play a "guessing game" to reveal identities when both parties are ready
- Share confessions and interact with the campus community

---

## ✨ Features

### Core Features

- **🔐 Verified Student Access**: University email verification (.edu domains)
- **👤 Total Anonymity**: Identity hidden until mutual reveal
- **💬 Real-time Messaging**: WebSocket-powered chat with typing indicators
- **🎭 Guessing Game**: Identity reveal mechanic requiring mutual consent
- **📱 Confessions Feed**: Anonymous campus confessions with likes and comments
- **🎨 Modern UI/UX**: Sleek, dark-mode enabled interface with smooth animations
- **📊 Admin Dashboard**: Comprehensive moderation tools for platform admins

### User Features

- Anonymous profile creation with personality attributes
- Interest-based matching algorithm
- Private chat rooms with reveal mechanism
- Confession posting and interaction
- Profile customization with preferences
- Settings management (notifications, privacy, etc.)

---

## 🛠 Tech Stack

### Frontend Framework

- **React 18** - UI library with hooks and functional components
- **TypeScript** - Type-safe development
- **Vite** - Next-generation frontend build tool

### Routing & Navigation

- **React Router DOM v6** - Client-side routing with protected routes

### Styling

- **Tailwind CSS** - Utility-first CSS framework
- **PostCSS** - CSS processing and optimization
- **Material Symbols** - Icon library for consistent UI

### State Management

- **React Hooks** - Built-in state management (useState, useEffect, useContext)
- **Custom Hooks** - Reusable logic (useAuth, useChat)

### HTTP & Real-time Communication

- **Axios** - HTTP client for API requests
- **WebSocket** - Real-time bidirectional communication for chat

### Code Quality

- **ESLint** - Linting and code quality enforcement
- **TypeScript Compiler** - Type checking and compilation

---

## 📁 Project Structure

```
/Users/arhandas/Desktop/Snugglr/
├── api/                        # API client layer
│   ├── admin/                  # Admin API endpoints
│   │   └── api.ts             # Admin operations (users, moderation)
│   └── user/                   # User API endpoints
│       ├── auth.ts            # Authentication & user management
│       ├── confessions.ts     # Confession operations
│       ├── http.ts            # Axios instance & interceptors
│       ├── match.ts           # Matching algorithm API
│       ├── messages.ts        # Chat message operations
│       ├── rooms.ts           # Chat room management
│       └── user.ts            # User profile operations
│
├── src/                        # Main source directory
│   ├── components/             # React components
│   │   ├── admin/             # Admin panel components
│   │   │   ├── comments.tsx
│   │   │   ├── community.tsx
│   │   │   ├── confessions.tsx
│   │   │   ├── dashboard.tsx
│   │   │   ├── matches.tsx
│   │   │   ├── reports.tsx
│   │   │   ├── rooms.tsx
│   │   │   └── users.tsx
│   │   │
│   │   ├── layout/            # Layout components
│   │   │   └── Sidebar.tsx   # Navigation sidebar
│   │   │
│   │   ├── routes/            # Route guards
│   │   │   ├── AdminRoute.tsx       # Admin-only access
│   │   │   ├── ProtectedRoute.tsx   # Authenticated users only
│   │   │   └── PublicRoute.tsx      # Unauthenticated users only
│   │   │
│   │   ├── ui/                # Reusable UI components
│   │   │   ├── Button.tsx    # Button with variants & loading states
│   │   │   ├── Input.tsx     # Input & Textarea components
│   │   │   ├── Loader.tsx    # Loading spinner
│   │   │   ├── Modal.tsx     # Modal/Dialog component
│   │   │   ├── Select.tsx    # Dropdown select
│   │   │   └── Toggle.tsx    # Toggle switch
│   │   │
│   │   └── user/              # User-facing components
│   │       ├── chat/          # Chat-related components
│   │       │   ├── ChatProfile.tsx    # Right sidebar profile
│   │       │   ├── ChatSidebar.tsx    # Left sidebar chat list
│   │       │   ├── ChatWindow.tsx     # Main chat interface
│   │       │   └── MessageBubble.tsx  # Individual message
│   │       ├── ConfessionModal.tsx
│   │       ├── MainContent.tsx
│   │       ├── NotificationsPane.tsx
│   │       └── PhoneMockup.tsx
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAuth.ts         # Authentication hook
│   │   └── useChat.ts         # Chat functionality hook
│   │
│   ├── pages/                  # Page components
│   │   ├── admin.tsx          # Admin dashboard
│   │   ├── auth.tsx           # Login/Register page
│   │   ├── chat.tsx           # Chat interface
│   │   ├── home.tsx           # Main feed/home page
│   │   ├── landing.tsx        # Landing page (marketing)
│   │   ├── notFound.tsx       # 404 error page
│   │   ├── onboarding.tsx     # User onboarding flow
│   │   ├── profile.tsx        # User profile page
│   │   └── settings.tsx       # Settings page
│   │
│   ├── utils/                  # Utility functions
│   │   ├── date.ts            # Date formatting utilities
│   │   └── validation.ts      # Form validation helpers
│   │
│   ├── App.tsx                 # Root application component
│   ├── main.tsx               # Application entry point
│   └── index.css              # Global styles & Tailwind imports
│
├── public/                     # Static assets
├── dist/                       # Production build output
│
├── index.html                  # HTML template
├── package.json               # Dependencies & scripts
├── tsconfig.json              # TypeScript configuration
├── vite.config.ts             # Vite configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── postcss.config.js          # PostCSS configuration
└── eslint.config.js           # ESLint configuration
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Snugglr
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:

   ```env
   VITE_API_URL=http://localhost:8080
   VITE_WS_URL=ws://localhost:8080
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to `http://localhost:5173` (or the port shown in terminal)

---

## 📜 Available Scripts

| Command           | Description                              |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | Start development server with hot reload |
| `npm run build`   | Build for production (TypeScript + Vite) |
| `npm run preview` | Preview production build locally         |
| `npm run lint`    | Run ESLint for code quality checks       |

---

## 🏗 Architecture

### Component Architecture

The application follows a **component-based architecture** with clear separation of concerns:

1. **Pages** (`src/pages/`) - Route-level components representing full pages
2. **Layout Components** (`src/components/layout/`) - Shared layout elements (Sidebar, Header)
3. **Feature Components** (`src/components/user/`, `src/components/admin/`) - Domain-specific components
4. **UI Components** (`src/components/ui/`) - Reusable, atomic UI elements
5. **Route Guards** (`src/components/routes/`) - Authentication & authorization wrappers

### Data Flow

```
User Action → Component → Custom Hook → API Client → Backend
                    ↓
              State Update
                    ↓
              UI Re-render
```

### Authentication Flow

1. User logs in via `/auth` page
2. `useAuth` hook manages authentication state
3. Token stored in `localStorage`
4. Protected routes check authentication via route guards
5. API requests automatically include auth token via Axios interceptors

---

## 🔑 Key Components

### Custom Hooks

#### `useAuth`

Manages authentication state and operations.

```typescript
const { user, loading, authenticated, login, register, logout } = useAuth();
```

**Features:**

- Automatic token management
- User state persistence
- Login/register/logout operations

#### `useChat`

Manages chat functionality including WebSocket connections.

```typescript
const {
  chats,
  messages,
  activeChatId,
  setActiveChatId,
  sendMessage,
  submitGuess,
} = useChat();
```

**Features:**

- Real-time message updates via WebSocket
- Chat room management
- Message history
- Identity reveal mechanics

### UI Components

All UI components support:

- **Dark mode** compatibility
- **Variants** (primary, secondary, danger, etc.)
- **Loading states**
- **Error handling**
- **Accessibility** (ARIA labels, keyboard navigation)

Example:

```tsx
<Button
  variant="primary"
  size="lg"
  isLoading={loading}
  icon="send"
  onClick={handleSubmit}
>
  Send Message
</Button>
```

---

## 🎨 State Management

The application uses **React Hooks** for state management:

### Local State

- `useState` for component-level state
- `useEffect` for side effects and lifecycle

### Shared State

- Custom hooks (`useAuth`, `useChat`) for cross-component state
- Context API for deeply nested prop drilling (if needed)

### Server State

- API responses cached in component state
- WebSocket for real-time updates
- Optimistic UI updates for better UX

---

## 🛣 Routing

### Route Structure

| Path          | Component  | Protection | Description            |
| ------------- | ---------- | ---------- | ---------------------- |
| `/`           | Landing    | Public     | Marketing landing page |
| `/auth`       | Auth       | Public     | Login/Register         |
| `/onboarding` | Onboarding | Protected  | New user setup         |
| `/home`       | Home       | Protected  | Main feed              |
| `/chat`       | Chat       | Protected  | Messaging interface    |
| `/profile`    | Profile    | Protected  | User profile           |
| `/settings`   | Settings   | Protected  | Account settings       |
| `/admin`      | Admin      | Admin      | Admin dashboard        |
| `*`           | NotFound   | Public     | 404 page               |

### Route Guards

#### PublicRoute

Redirects authenticated users to `/home`

#### ProtectedRoute

Redirects unauthenticated users to `/auth`

#### AdminRoute

Requires admin/superadmin role, redirects others to `/home`

---

## 🔌 API Integration

### API Client (`api/user/http.ts`)

Configured Axios instance with:

- Base URL from environment variables
- Automatic authentication headers
- Request/response interceptors
- Error handling

### Endpoints

#### Authentication (`api/user/auth.ts`)

- `loginUser(data)` - User login
- `registerUser(data)` - User registration
- `logout()` - Clear session
- `getAuthToken()` - Retrieve stored token
- `isAuthenticated()` - Check auth status

#### User Profile (`api/user/user.ts`)

- `getMyProfile(token)` - Get current user
- `updateUserProfile(data, token)` - Update profile

#### Messaging (`api/user/messages.ts`)

- `getMessages(chatId, token)` - Fetch chat history
- `sendMessage(chatId, text, token)` - Send message

#### Confessions (`api/user/confessions.ts`)

- `getConfessions(token)` - Fetch confessions
- `createConfession(data, token)` - Post confession
- `likeConfession(id, token)` - Like confession
- `commentOnConfession(id, comment, token)` - Add comment

---

## 🎨 Styling

### Tailwind CSS Configuration

Custom design tokens defined in `tailwind.config.js`:

```javascript
colors: {
  primary: '#000000',
  secondary: '#6b7280',
  background: {
    light: '#ffffff',
    dark: '#0a0a0a'
  }
}
```

### Design System

- **Typography**: Inter (body), Pacifico (brand)
- **Spacing**: 4px base unit
- **Border Radius**: Rounded corners (8px, 12px, 24px)
- **Shadows**: Soft, elevated, and glow variants
- **Transitions**: Smooth 200-300ms transitions

### Dark Mode

Automatic dark mode support via Tailwind's `dark:` prefix:

```tsx
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
  Content
</div>
```

---

## 👨‍💻 Development Guidelines

### Code Style

- **TypeScript**: Use type annotations for all props and state
- **Component Naming**: PascalCase for components, camelCase for functions
- **File Naming**: PascalCase for components (`.tsx`), camelCase for utilities (`.ts`)
- **Imports**: Absolute imports from `src/` using path aliases

### Component Guidelines

1. **Keep components focused** - Single responsibility principle
2. **Extract reusable logic** into custom hooks
3. **Use TypeScript interfaces** for props
4. **Handle loading and error states** explicitly
5. **Add meaningful comments** only when necessary

### Git Workflow

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit: `git commit -m "feat: add feature"`
3. Push and create PR: `git push origin feature/your-feature`

### Commit Convention

Follow conventional commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring
- `style:` - Styling changes
- `docs:` - Documentation
- `chore:` - Maintenance tasks

---

## 📦 Build & Deployment

### Production Build

```bash
npm run build
```

Output: `dist/` directory

### Preview Production Build

```bash
npm run preview
```

### Deployment Platforms

The app can be deployed to:

- **Vercel** (Recommended for Vite/React)
- **Netlify**
- **AWS S3 + CloudFront**
- **Docker container**

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests if applicable
5. Commit with conventional commit messages
6. Push to your fork
7. Open a Pull Request

---

## 📄 License

This project is private and proprietary.

---

## 👤 Author

**Arhan Das**

---

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first approach
- Vite for blazing-fast build times
- The open-source community

---

<div align="center">
  <p>Made with ♥ by Arhan</p>
  <p>© 2026 Snugglr. All rights reserved.</p>
</div>
