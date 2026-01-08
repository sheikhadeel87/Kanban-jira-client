# Kanban Board - Frontend

A modern React + Vite + Tailwind CSS frontend for the Kanban Board task management system.

## Features

### Admin Panel
- **Board Management**: Create, edit, and delete boards
- **Team Management**: Create teams and assign members to boards
- **Task Management**: Create, edit, and delete tasks across all boards
- **User Management**: View all users in the system
- **Dashboard**: Overview of all boards, tasks, teams, and users

### User Panel
- **View Assigned Boards**: See all boards you're a member of
- **Kanban Board View**: Interactive drag-and-drop board with three columns (To Do, In Progress, Completed)
- **Task Management**: Create, edit, and update task status
- **Team Assignment**: View tasks assigned to your team

## Tech Stack

- **React 18**: UI library
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **Axios**: HTTP client
- **@dnd-kit**: Drag and drop functionality
- **React Hot Toast**: Toast notifications
- **Lucide React**: Icon library

## Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn
- Backend server running on `http://localhost:5005`

### Installation

1. Navigate to the ui directory:
```bash
cd ui
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional, defaults are set):
```bash
VITE_API_URL=http://localhost:5005/api
```

4. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

## Project Structure

```
ui/
├── src/
│   ├── components/          # Reusable components
│   │   ├── Layout.jsx       # Main layout with header/navigation
│   │   ├── ProtectedRoute.jsx
│   │   ├── TaskCard.jsx     # Draggable task card
│   │   └── TaskModal.jsx    # Task create/edit modal
│   ├── context/
│   │   └── AuthContext.jsx  # Authentication context
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Admin/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminHome.jsx
│   │   │   ├── BoardManagement.jsx
│   │   │   ├── TeamManagement.jsx
│   │   │   └── TaskManagement.jsx
│   │   ├── User/
│   │   │   └── UserDashboard.jsx
│   │   └── BoardView.jsx    # Kanban board view
│   ├── services/
│   │   └── api.js           # API service layer
│   ├── App.jsx              # Main app component with routing
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Usage

### Authentication

1. **Register**: Create a new account at `/register`
2. **Login**: Sign in at `/login`
3. **Admin Access**: Users with `role: "admin"` will be redirected to `/admin`
4. **Regular Users**: Will be redirected to `/dashboard`

### Admin Features

- Navigate to `/admin` to access the admin dashboard
- Use the navigation menu to access:
  - **Boards**: Manage all boards
  - **Teams**: Create teams and assign members
  - **Tasks**: Manage tasks across all boards

### User Features

- Navigate to `/dashboard` to see your assigned boards
- Click on a board to open the Kanban view
- Drag and drop tasks between columns to update status
- Click the "+" button to create new tasks
- Click on a task card to edit or delete

## API Integration

The frontend communicates with the backend API at `http://localhost:5005/api`. All API calls are handled through the `services/api.js` file.

### Authentication

- JWT tokens are stored in `localStorage`
- Tokens are automatically included in API requests
- On 401 errors, users are redirected to login

## Development

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

### Code Style

- ESLint is configured for React
- Follow React best practices
- Use functional components with hooks
- Keep components small and focused

## Troubleshooting

### CORS Issues

Make sure the backend has CORS enabled and allows requests from `http://localhost:3000`

### API Connection Issues

- Verify the backend is running on port 5005
- Check the `VITE_API_URL` in `.env` file
- Ensure the backend API endpoints match the frontend API calls

### Build Issues

- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`

## License

MIT

