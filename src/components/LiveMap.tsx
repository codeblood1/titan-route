import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface LiveMapProps {
  status: string;
}

export default function LiveMap({ status }: LiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    // Default coordinates based on status (simulated)
    const coords: Record<string, [number, number]> = {
      sent: [25.7617, -80.1918], // Miami
      held_by_customs: [40.7128, -74.006], // New York
      received: [47.6062, -122.3321], // Seattle
      delivered: [34.0522, -118.2437], // Los Angeles
      canceled: [25.7617, -80.1918], // Miami
    };

    const [lat, lng] = coords[status] || [39.8283, -98.5795]; // Center of US

    const map = L.map(mapRef.current, {
      center: [lat, lng],
      zoom: status === "delivered" ? 12 : 5,
      zoomControl: false,
      attributionControl: false,
    });

    leafletMap.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
    }).addTo(map);

    // Custom fish icon
    const fishIcon = L.divIcon({
      html: `<div style="font-size: 24px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">${status === "delivered" ? "🏠" : "🐟"}</div>`,
      className: "custom-fish-marker",
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });

    L.marker([lat, lng], { icon: fishIcon }).addTo(map);

    // Add a circle to show area
    L.circle([lat, lng], {
      color: status === "delivered" ? "#22c55e" : "#3b82f6",
      fillColor: status === "delivered" ? "#22c55e" : "#3b82f6",
      fillOpacity: 0.1,
      radius: status === "delivered" ? 5000 : 200000,
    }).addTo(map);

    return () => {
      map.remove();
      leafletMap.current = null;
    };
  }, [status]);

  return <div ref={mapRef} className="w-full h-full rounded-lg" />;
}
