import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';
import HomePage from './pages/HomePage';
import RoutePlannerPage from './pages/RoutePlannerPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import GalleryPage from './pages/GalleryPage';
import BlogPage from './pages/BlogPage';
import BlogDetail from './pages/BlogDetail';
import AdminGallery from './pages/admin/AdminGallery';

import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import SettingsPage from './pages/SettingsPage';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBlogForm from './pages/admin/AdminBlogForm';
import AdminBlogList from './pages/admin/AdminBlogList';
import AdminUsers from './pages/admin/AdminUsers';
import AdminRoutes from './pages/admin/AdminRoutes';

import AnnouncementsPage from './pages/AnnouncementsPage';

import { 
  WeekendGetawaysPage, CulturalToursPage,
  AboutPage, CareerPage, ContactPage, PrivacyPolicyPage,
  FAQPage, CancellationPage, TermsPage
} from './pages/StaticPages';

import { useEffect } from 'react';

function App() {
  useEffect(() => {
    // Fetch CSRF Token on load
    const fetchCsrfToken = async () => {
      try {
        const response = await fetch('/csrf-token');
        const data = await response.json();
        const csrfToken = data.csrfToken;
        
        // Store in a global variable or setup an interceptor if using axios.
        // For fetch, we can't set a global default easily without a wrapper.
        // Let's store it in localStorage or sessionStorage for simplicity in this migration
        // OR better: Just rely on cookie if csurf set to { cookie: true }? 
        // If cookie: true, csurf checks the cookie vs the header.
        // Usually we need to read the XSRF-TOKEN cookie and send it as X-XSRF-TOKEN header.
        // But csurf defaults might expect _csrf in body or query or header.
        // Let's assume we need to send it in 'CSRF-Token' header.
        
        sessionStorage.setItem('csrfToken', csrfToken);
        
        // Monkey patch fetch to include the token automatically? 
        // Or just advise updating API calls.
        // For now, let's just log it to verify fetching works.
        console.log('CSRF Token fetched');
      } catch (err) {
        console.error('Error fetching CSRF token', err);
      }
    };
    fetchCsrfToken();
  }, []);

  // Wrap fetch to include CSRF token
  useEffect(() => {
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
          let [resource, config] = args;
          if(config && ['POST', 'PUT', 'DELETE'].includes(config.method?.toUpperCase())) {
              const token = sessionStorage.getItem('csrfToken');
              if(token) {
                  config.headers = {
                      ...config.headers,
                      'X-CSRF-Token': token
                  };
              }
          }
          const response = await originalFetch(resource, config);
          return response;
      };
      return () => { window.fetch = originalFetch; };
  }, []);



  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="blog" element={<AdminBlogList />} />
          <Route path="blogs/new" element={<AdminBlogForm />} />
          <Route path="blogs/edit/:id" element={<AdminBlogForm />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="routes" element={<AdminRoutes />} />
          <Route path="gallery" element={<AdminGallery />} />
          <Route path="announcements" element={<AdminAnnouncements />} />

          <Route index element={<AdminDashboard />} /> {/* Default to dashboard */}
        </Route>

        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="route" element={<RoutePlannerPage />} />
          <Route path="blog" element={<BlogPage />} />
          <Route path="blog/:slug" element={<BlogDetail />} /> {/* Kept original slug for consistency */}
          <Route path="gallery" element={<GalleryPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="announcements" element={<AnnouncementsPage />} />
          
          {/* Static Pages */}

          <Route path="weekend-getaways" element={<WeekendGetawaysPage />} />
          <Route path="cultural-tours" element={<CulturalToursPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="career" element={<CareerPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="privacy" element={<PrivacyPolicyPage />} /> {/* Kept original name */}
          <Route path="faq" element={<FAQPage />} /> {/* Kept original name */}
          <Route path="cancellation" element={<CancellationPage />} />
          <Route path="terms" element={<TermsPage />} />
          {/* Assuming CookiesPage is a new static page, if not, it needs to be imported or removed */}
          {/* <Route path="cookies" element={<CookiesPage />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App;
