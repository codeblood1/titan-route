import { Routes, Route } from "react-router";
import Track from "./pages/Track";
import TrackingResult from "./pages/TrackingResult";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Track />} />
      <Route path="/track/:trackingCode" element={<TrackingResult />} />
      <Route path="/admin/*" element={<AdminDashboard />} />
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
