import { Routes, Route } from "react-router";
import "leaflet/dist/leaflet.css";
import Track from "./pages/Track";
import TrackingResult from "./pages/TrackingResult";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Track />} />
      <Route path="/track/:trackingCode" element={<TrackingResult />} />
      <Route path="/about" element={<About />} />
      <Route path="/services" element={<Services />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/admin/*" element={<AdminDashboard />} />
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
