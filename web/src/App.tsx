import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navigation from "./components/Navigation";
import Hero from "./components/Hero";
import Features from "./components/Features";
import About from "./components/About";
import Download from "./components/Download";
import Explore from "./components/Explore";
import Footer from "./components/Footer";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Main landing page */}
        <Route
          path="/"
          element={
            <>
              <Navigation />
              <Hero />
              <Features />
              <Explore />
              <About />
              <Download />
              <Footer />
            </>
          }
        />

        {/* Admin login (public) */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin dashboard (protected) */}
        <Route
          path="/admin/dashboard/*"
          element={
            <ProtectedAdminRoute>
              <Admin />
            </ProtectedAdminRoute>
          }
        />

        {/* Redirect /admin to /admin/login */}
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
