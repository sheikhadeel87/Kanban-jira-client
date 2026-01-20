# Kanban-Jira - Task Management System

A modern, organization-based Kanban board application built with React and Node.js, inspired by Jira. This application provides a complete task management solution with role-based access control, project management, and team collaboration features.

## 🏗️ Architecture

The application follows a hierarchical organization-based structure:

```
Organization
  └── Users (Owner, Admin, Member)
      └── Projects
          └── Boards
              └── Tasks
```

### Key Concepts

- **Organization**: Top-level entity that owns all resources
- **Users**: Belong to an organization with roles (Owner, Admin, Member)
- **Projects**: Work containers within an organization
- **Boards**: Kanban boards within projects
- **Tasks**: Individual work items on boards

## ✨ Features

### Organization Management
- Create and manage organizations
- Invite users via email invitations
- Role-based access control (Owner, Admin, Member)
- View organization members and their roles

### Project Management
- Create and manage projects within organizations
- Assign members to projects
- Project-level permissions and settings
- View all projects you're a member of

### Board Management
- Create multiple Kanban boards per project
- Drag-and-drop task management
- Board-level member assignments
- Customizable board columns (To Do, In Progress, Completed)

### Task Management
- Create, edit, and delete tasks
- Assign tasks to multiple team members
- File attachments via Cloudinary
- Task status tracking
- Task descriptions and metadata

### User Features
- **Dashboard**: View all accessible projects and boards
- **Project View**: See boards within a project
- **Board View**: Interactive Kanban board with drag-and-drop
- **Task Management**: Create and update tasks
- **Team Collaboration**: View tasks assigned to you and your team

### Admin Features
- **Admin Dashboard**: Overview of all projects, boards, tasks, and users
- **Project Management**: Create, edit, and delete projects
- **Board Management**: Manage all boards across projects
- **Task Management**: View and manage all tasks
- **User Management**: View all users in the organization

## 🛠️ Tech Stack

### Frontend
- **React 18**: UI library
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **React Router v6**: Client-side routing
- **Axios**: HTTP client
- **@dnd-kit**: Drag and drop functionality
- **React Hot Toast**: Toast notifications
- **Lucide React**: Icon library

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **MongoDB**: Database (via Mongoose)
- **JWT**: Authentication
- **Cloudinary**: File storage
- **Nodemailer**: Email service
- **bcryptjs**: Password hashing

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn
- MongoDB database (local or cloud)
- Cloudinary account (for file uploads)
- Email service credentials (Gmail or other SMTP)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```env
PORT=5005
MONGODB_URI=mongodb://localhost:27017/kanban-jira
JWT_SECRET=your-secret-key-here
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:3000
```

4. Start the backend server:
```bash
npm run dev
```

The backend API will be available at `http://localhost:5005`

### Frontend Setup

1. Navigate to the ui directory:
```bash
cd ui
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional, defaults are set):
```env
VITE_API_URL=http://localhost:5005/api
```

4. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## 📋 Role-Based Permissions

### Owner
- ✅ Create/Delete organization
- ✅ Invite users
- ✅ Create/Assign projects
- ✅ Create boards
- ✅ Create/Update/Delete tasks
- ✅ Access all projects and boards

### Admin
- ❌ Create/Delete organization
- ✅ Invite users
- ✅ Create/Assign projects
- ✅ Create boards
- ✅ Create/Update/Delete tasks
- ✅ Access all projects and boards

### Member
- ❌ Create/Delete organization
- ❌ Invite users
- ❌ Create/Assign projects
- ❌ Create boards
- ✅ Create tasks
- ✅ Update assigned tasks
- ❌ Delete tasks
- ✅ View projects/boards they're members of

## 📁 Project Structure

```
kanban-jira/
├── backend/
│   ├── api/                    # API documentation
│   ├── config/                 # Configuration files
│   │   └── cloudinary.js       # Cloudinary setup
│   ├── controllers/            # Route controllers
│   │   ├── authController.js   # Authentication
│   │   ├── organizationController.js
│   │   ├── projectController.js
│   │   ├── boardController.js
│   │   ├── taskController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── auth.js            # JWT authentication middleware
│   ├── models/                 # Mongoose models
│   │   ├── organization.model.js
│   │   ├── user.model.js
│   │   ├── project.model.js
│   │   ├── board.model.js
│   │   ├── task.model.js
│   │   └── organizationInvitation.model.js
│   ├── routes/                 # Express routes
│   │   ├── authRoutes.js
│   │   ├── organizationRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── boardsRoutes.js
│   │   ├── taskRoutes.js
│   │   └── userRoutes.js
│   ├── utils/                  # Utility functions
│   │   ├── permissions.js     # Permission helpers
│   │   ├── emailService.js    # Email sending
│   │   └── db.utils.js
│   ├── server.js               # Express server
│   └── package.json
│
└── ui/
    ├── src/
    │   ├── components/         # Reusable components
    │   │   ├── Layout.jsx     # Main layout
    │   │   ├── ProtectedRoute.jsx
    │   │   ├── TaskCard.jsx   # Draggable task card
    │   │   └── TaskModal.jsx  # Task create/edit modal
    │   ├── context/
    │   │   └── AuthContext.jsx # Auth state management
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Organization.jsx
    │   │   ├── ProjectList.jsx
    │   │   ├── ProjectBoards.jsx
    │   │   ├── ProjectSettings.jsx
    │   │   ├── BoardView.jsx
    │   │   ├── User/
    │   │   │   └── UserDashboard.jsx
    │   │   └── Admin/
    │   │       ├── AdminDashboard.jsx
    │   │       ├── ProjectManagement.jsx
    │   │       ├── BoardManagement.jsx
    │   │       └── TaskManagement.jsx
    │   ├── services/
    │   │   └── api.js         # API service layer
    │   ├── App.jsx            # Main app with routing
    │   ├── main.jsx           # Entry point
    │   └── index.css          # Global styles
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

## 🔐 Authentication Flow

1. **Registration**: 
   - New users can register with an invitation token (from organization invitation)
   - Or create a new organization during registration
   - Users are automatically assigned to an organization

2. **Login**: 
   - JWT token is issued upon successful login
   - Token is stored in localStorage
   - Token includes user ID, role, and organization ID

3. **Protected Routes**: 
   - All routes except `/login` and `/register` require authentication
   - Admin routes require `role: 'admin'` or `role: 'owner'`

## 📧 Email Invitations

The system supports email invitations for:
- **Organization Invitations**: Invite users to join your organization
- Invitation tokens expire after 7 days
- Users can register or login with the invitation token

## 🎯 Usage Guide

### For Organization Owners/Admins

1. **Create Organization**: First user becomes the owner
2. **Invite Members**: Go to Organization page → Invite Member
3. **Create Projects**: Navigate to Projects → Create Project
4. **Assign Members**: Add members to projects via Project Settings
5. **Create Boards**: Within a project, create boards for different workflows
6. **Manage Tasks**: Create and assign tasks to team members

### For Members

1. **Accept Invitation**: Register or login with invitation token
2. **View Projects**: See all projects you're a member of
3. **Access Boards**: Open boards within your projects
4. **Create Tasks**: Add tasks to boards you have access to
5. **Update Tasks**: Drag and drop tasks to update status
6. **View Assigned Tasks**: See tasks assigned to you

## 🔌 API Integration

The frontend communicates with the backend API. All API calls are handled through `services/api.js`.

### Base URL
```
http://localhost:5005/api
```

### Authentication
- JWT tokens are stored in `localStorage`
- Tokens are automatically included in API requests via Axios interceptors
- On 401 errors, users are redirected to login

### Main API Endpoints

- `/auth/*` - Authentication (register, login)
- `/organizations/*` - Organization management
- `/projects/*` - Project management
- `/boards/*` - Board management
- `/tasks/*` - Task management
- `/users/*` - User management

See `backend/api.md` for complete API documentation.

## 🛠️ Development

### Available Scripts

#### Backend
- `npm start`: Start production server
- `npm run dev`: Start development server with nodemon

#### Frontend
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

### Code Style

- ESLint is configured for React
- Follow React best practices
- Use functional components with hooks
- Keep components small and focused
- Use Tailwind CSS for styling

## 🐛 Troubleshooting

### CORS Issues
- Make sure the backend has CORS enabled
- Backend should allow requests from `http://localhost:3000`

### API Connection Issues
- Verify the backend is running on port 5005
- Check the `VITE_API_URL` in `.env` file
- Ensure the backend API endpoints match the frontend API calls

### Database Connection
- Verify MongoDB is running
- Check `MONGODB_URI` in backend `.env`
- Ensure database name is correct

### File Upload Issues
- Verify Cloudinary credentials in backend `.env`
- Check Cloudinary configuration in `backend/config/cloudinary.js`

### Email Issues
- Verify email credentials in backend `.env`
- For Gmail, use App Password (not regular password)
- Check email service configuration

### Build Issues
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`
- Clear npm cache: `npm cache clean --force`

## 📝 Environment Variables

### Backend (.env)
```env
PORT=5005
MONGODB_URI=mongodb://localhost:27017/kanban-jira
JWT_SECRET=your-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5005/api
```

## 🚀 Deployment

### Backend Deployment
- See `backend/VERCEL_DEPLOYMENT_CONFIG.md` for Vercel deployment
- Ensure all environment variables are set in deployment platform
- MongoDB Atlas recommended for production database

### Frontend Deployment
- Build the project: `npm run build`
- Deploy the `dist` folder to your hosting service
- Update `VITE_API_URL` to point to production API

## 📄 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For issues and questions, please open an issue on the repository.

---

**Built with ❤️ using React, Node.js, and MongoDB**