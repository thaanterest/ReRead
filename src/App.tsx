import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import RootLayout from './components/layout/RootLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import BrowsePage from './pages/BrowsePage';
import MarketplacePage from './pages/MarketplacePage';
import BookDetailPage from './pages/BookDetailPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import RequestsPage from './pages/RequestsPage';
import AddBookPage from './pages/AddBookPage';
import MyBooksPage from './pages/MyBooksPage';
import WishlistPage from './pages/WishlistPage';
import ChatPage from './pages/ChatPage';
import SettingsPage from './pages/SettingsPage';
import AboutPage from './pages/AboutPage';

// Admin Guards & Layout
import AdminRoute from './components/guards/AdminRoute';
import AdminLayout from './components/admin/AdminLayout';
import { Loader2 } from 'lucide-react';

// Admin Pages (Lazy-loaded to keep User bundle small)
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminBooksPage = lazy(() => import('./pages/admin/AdminBooksPage'));
const AdminSwapsPage = lazy(() => import('./pages/admin/AdminSwapsPage'));
const AdminRequestsPage = lazy(() => import('./pages/admin/AdminRequestsPage'));
const AdminReportsPage = lazy(() => import('./pages/admin/AdminReportsPage'));
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage'));

const AdminLoadingFallback = (
  <div className="min-h-screen flex items-center justify-center bg-bg-main">
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-accent" />
      <p className="text-xs text-text-main/60 font-sans">กำลังโหลดข้อมูลแอดมิน...</p>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Admin Login (Full-screen, no layout) */}
          <Route
            path="/admin/login"
            element={
              <Suspense fallback={AdminLoadingFallback}>
                <AdminLoginPage />
              </Suspense>
            }
          />

          {/* Admin Protected Panel */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route
              index
              element={
                <Suspense fallback={AdminLoadingFallback}>
                  <AdminDashboardPage />
                </Suspense>
              }
            />
            <Route
              path="users"
              element={
                <Suspense fallback={AdminLoadingFallback}>
                  <AdminUsersPage />
                </Suspense>
              }
            />
            <Route
              path="books"
              element={
                <Suspense fallback={AdminLoadingFallback}>
                  <AdminBooksPage />
                </Suspense>
              }
            />
            <Route
              path="swaps"
              element={
                <Suspense fallback={AdminLoadingFallback}>
                  <AdminSwapsPage />
                </Suspense>
              }
            />
            <Route
              path="requests"
              element={
                <Suspense fallback={AdminLoadingFallback}>
                  <AdminRequestsPage />
                </Suspense>
              }
            />
            <Route
              path="reports"
              element={
                <Suspense fallback={AdminLoadingFallback}>
                  <AdminReportsPage />
                </Suspense>
              }
            />
            <Route
              path="categories"
              element={
                <Suspense fallback={AdminLoadingFallback}>
                  <AdminCategoriesPage />
                </Suspense>
              }
            />
          </Route>

          {/* Full-screen user routes (no Navbar/Footer) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* User Routes with Navbar/Footer */}
          <Route path="/" element={<RootLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="browse" element={<BrowsePage />} />
            <Route path="marketplace" element={<MarketplacePage />} />
            <Route path="shop" element={<MarketplacePage />} />
            <Route path="used-books" element={<MarketplacePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="book/:id" element={<BookDetailPage />} />
            <Route path="requests" element={<RequestsPage />} />
            {/* Member routes */}
            <Route path="add-book" element={<AddBookPage />} />
            <Route path="my-books" element={<MyBooksPage />} />
            <Route path="wishlist" element={<WishlistPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
