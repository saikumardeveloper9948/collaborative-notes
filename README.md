<<<<<<< HEAD
# Collaborative Candidate Notes

A real-time collaborative application for recruiters and hiring managers to share candidate feedback and receive tag-based notifications.

## 🚀 Features

### Core Functionality
- **Authentication System**: Secure user registration and login with JWT
- **Dashboard**: Overview of candidates and notifications
- **Candidate Management**: Create and manage candidate profiles
- **Real-time Notes**: Live collaborative notes for each candidate
- **@Mention System**: Tag users with autocomplete functionality
- **Notifications**: Real-time notifications for mentions and updates
- **Responsive Design**: Works on desktop and mobile devices

### Technical Features
- **Real-time Communication**: Socket.io for live messaging
- **Modern UI**: Clean, intuitive interface with Tailwind CSS
- **Security**: JWT authentication, input validation, and XSS protection
- **Scalable Architecture**: Modular backend with proper separation of concerns

## 🛠 Tech Stack

### Frontend
- **React 19** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Socket.io Client** - Real-time communication
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Socket.io** - Real-time bidirectional communication
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd collaborative-notes
   ```

2. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/collaborative-notes
   JWT_SECRET=your-super-secret-jwt-key-here
   CLIENT_URL=http://localhost:5173
   ```

4. **Start the backend server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   ```

2. **Start the frontend development server**
   ```bash
   npm run dev
   ```

3. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 🎯 Usage Guide

### Getting Started
1. **Register/Login**: Create an account or sign in with existing credentials
2. **Dashboard**: View all candidates and notifications
3. **Create Candidates**: Add new candidates with name, email, and position
4. **Collaborative Notes**: Click on a candidate to open the notes interface
5. **Real-time Messaging**: Send notes that appear instantly for all users
6. **@Mentions**: Use @username to tag specific users
7. **Notifications**: Receive real-time notifications for mentions

### Key Features Demo
- **Real-time Collaboration**: Open multiple browser tabs and see live updates
- **@Mention System**: Type @ followed by a username to tag someone
- **Notifications**: Tagged users receive instant notifications
- **Responsive Design**: Test on mobile devices for responsive behavior

## 🏗 Architecture

### Backend Structure
```
server/
├── controllers/     # Business logic
├── models/         # Database schemas
├── routes/         # API endpoints
├── middleware/     # Authentication & validation
├── sockets/        # Real-time communication
└── server.js       # Main server file
```

### Frontend Structure
```
client/src/
├── pages/          # Page components
├── contexts/       # React contexts
├── hooks/          # Custom hooks
└── components/     # Reusable components
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Configured for secure cross-origin requests
- **XSS Protection**: Input sanitization and security headers
- **Route Protection**: All sensitive routes require authentication

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas or local MongoDB
2. Configure environment variables
3. Deploy to platforms like Heroku, Railway, or DigitalOcean

### Frontend Deployment
1. Build the production version: `npm run build`
2. Deploy to Vercel, Netlify, or any static hosting service

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Candidate creation and management
- [ ] Real-time note sending and receiving
- [ ] @mention functionality with autocomplete
- [ ] Notification system
- [ ] Responsive design on mobile
- [ ] Error handling and validation

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Candidate Endpoints
- `GET /api/candidates` - Get all candidates
- `POST /api/candidates` - Create new candidate
- `GET /api/candidates/:id` - Get specific candidate
- `PUT /api/candidates/:id` - Update candidate
- `DELETE /api/candidates/:id` - Delete candidate

### Notes Endpoints
- `GET /api/notes/candidate/:candidateId` - Get candidate notes
- `POST /api/notes` - Create new note
- `PUT /api/notes/:noteId` - Update note
- `DELETE /api/notes/:noteId` - Delete note

### Socket Events
- `join-candidate-room` - Join candidate's note room
- `new-note` - Send new note
- `note-created` - Receive new note
- `typing-start/stop` - Typing indicators

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is created for the Algohire Full-Stack Developer Hiring Hackathon.

## 🎯 Future Enhancements

If given more time, I would implement:

1. **Advanced Search & Filtering**: Search candidates by name, position, or status
2. **File Attachments**: Allow uploading resumes and documents
3. **Email Notifications**: Send email alerts for important mentions
4. **Candidate Status Workflow**: Visual pipeline for candidate progression
5. **Analytics Dashboard**: Track hiring metrics and team performance
6. **Mobile App**: Native mobile application for on-the-go access
7. **Advanced Permissions**: Role-based access control for different user types
8. **Export Functionality**: Export candidate data and notes to PDF/CSV
9. **Integration APIs**: Connect with ATS systems and job boards
10. **Real-time Video Calls**: Built-in video interviewing capabilities

##  Support  https://github.com/saikumardeveloper9948

=======
# collaborative-notes
REACT
>>>>>>> e6555d61abc6be4f030d939f004724b224c52ee8
