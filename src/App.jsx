import { createBrowserRouter, RouterProvider } from "react-router-dom";
import DirectoryView from "./DirectoryView";
import Register from "./Register";
import "./App.css";
import Login from "./Login";
import UsersPage from "./UsersPage";
import Sidebar from "./components/Sidebar";

// Layout component for pages with sidebar
const LayoutWithSidebar = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
};

// Layout for auth pages (no sidebar)
const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      {children}
    </div>
  );
};

// Wrap components with layouts
const DirectoryViewWithSidebar = () => (
  <LayoutWithSidebar>
    <DirectoryView />
  </LayoutWithSidebar>
);

const UsersPageWithSidebar = () => (
  <LayoutWithSidebar>
    <UsersPage />
  </LayoutWithSidebar>
);

const LoginWithAuthLayout = () => (
  <AuthLayout>
    <Login />
  </AuthLayout>
);

const RegisterWithAuthLayout = () => (
  <AuthLayout>
    <Register />
  </AuthLayout>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <DirectoryViewWithSidebar />,
  },
  {
    path: "/register",
    element: <RegisterWithAuthLayout />,
  },
  {
    path: "/login",
    element: <LoginWithAuthLayout />,
  },
  {
    path: "/users",
    element: <UsersPageWithSidebar />,
  },
  {
    path: "/directory/:dirId",
    element: <DirectoryViewWithSidebar />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
