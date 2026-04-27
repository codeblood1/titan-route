import { useEffect, useRef, useState } from "react";
import L from "leaflet";

interface LiveMapProps {
  status: string;
  senderLat?: number | null;
  senderLng?: number | null;
  receiverLat?: number | null;
  receiverLng?: number | null;
  editable?: boolean;
  onSenderChange?: (lat: number, lng: number) => void;
  onReceiverChange?: (lat: number, lng: number) => void;
}

// SVG icons as strings for Leaflet divIcon
const SENDER_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l8-4 8 4v14"/><path d="M9 21v-6h6v6"/></svg>`;

const RECEIVER_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;

const TRUCK_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.42-4.28A1 1 0 0 0 17.24 8H15"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>`;

const DELIVERED_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;

function createDivIcon(svg: string, className = "") {
  return L.divIcon({
    html: `<div class="flex items-center justify-center w-8 h-8 bg-white rounded-full shadow-lg border-2 border-white ${className}">${svg}</div>`,
    className: "custom-marker",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

function interpolatePoint(
  from: [number, number],
  to: [number, number],
  fraction: number
): [number, number] {
  return [
    from[0] + (to[0] - from[0]) * fraction,
    from[1] + (to[1] - from[1]) * fraction,
  ];
}

function getStatusFraction(status: string): number {
  switch (status) {
    case "sent": return 0.15;
    case "held_by_customs": return 0.35;
    case "received": return 0.65;
    case "delivered": return 1;
    case "canceled": return 0.1;
    default: return 0.15;
  }
}

export default function LiveMap({
  status,
  senderLat,
  senderLng,
  receiverLat,
  receiverLng,
  editable = false,
  onSenderChange,
  onReceiverChange,
}: LiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const [editMode, setEditMode] = useState<"sender" | "receiver">("sender");
  const [isReady, setIsReady] = useState(false);

  const hasSender = senderLat != null && senderLng != null;
  const hasReceiver = receiverLat != null && receiverLng != null;

  // Default fallback coordinates
  const defaultSender: [number, number] = [39.8283, -98.5795];
  const defaultReceiver: [number, number] = [40.7128, -74.006];

  const sender: [number, number] = hasSender ? [senderLat!, senderLng!] : defaultSender;
  const receiver: [number, number] = hasReceiver ? [receiverLat!, receiverLng!] : defaultReceiver;

  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    // Delay map creation to ensure container has dimensions
    const timer = setTimeout(() => {
      if (!mapRef.current) return;

      const midLat = (sender[0] + receiver[0]) / 2;
      const midLng = (sender[1] + receiver[1]) / 2;

      const map = L.map(mapRef.current, {
        center: [midLat, midLng],
        zoom: 4,
        zoomControl: false,
        attributionControl: false,
      });

      leafletMap.current = map;
      markersRef.current = L.layerGroup().addTo(map);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: '',
      }).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      if (editable) {
        map.on("click", (e) => {
          const { lat, lng } = e.latlng;
          if (editMode === "sender" && onSenderChange) {
            onSenderChange(lat, lng);
          } else if (editMode === "receiver" && onReceiverChange) {
            onReceiverChange(lat, lng);
          }
        });
      }

      setIsReady(true);
    }, 100);

    return () => {
      clearTimeout(timer);
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update markers whenever coords or status changes
  useEffect(() => {
    if (!isReady || !leafletMap.current || !markersRef.current) return;

    const map = leafletMap.current;
    map.invalidateSize();

    markersRef.current.clearLayers();

    // Route polyline
    const routeLine = L.polyline([sender, receiver], {
      color: "#3b82f6",
      weight: 3,
      opacity: 0.7,
      dashArray: "8, 8",
    }).addTo(markersRef.current);

    // Sender marker
    const senderMarker = L.marker(sender, {
      icon: createDivIcon(SENDER_ICON_SVG),
    }).addTo(markersRef.current);
    senderMarker.bindPopup("<b>Sender Location</b><br/>Package origin");

    // Receiver marker
    const receiverMarker = L.marker(receiver, {
      icon: createDivIcon(RECEIVER_ICON_SVG),
    }).addTo(markersRef.current);
    receiverMarker.bindPopup("<b>Receiver Location</b><br/>Delivery destination");

    // Current position marker (truck along route)
    const fraction = getStatusFraction(status);
    const currentPos = status === "delivered" ? receiver : interpolatePoint(sender, receiver, fraction);

    const currentIcon = status === "delivered"
      ? createDivIcon(DELIVERED_ICON_SVG)
      : createDivIcon(TRUCK_ICON_SVG, "animate-pulse");

    const currentMarker = L.marker(currentPos, { icon: currentIcon }).addTo(markersRef.current);
    currentMarker.bindPopup(
      `<b>${status === "delivered" ? "Delivered" : "Current Location"}</b><br/>Status: ${status}`
    );

    // Fit bounds with padding
    const bounds = L.latLngBounds([sender, receiver]);
    map.fitBounds(bounds, { padding: [40, 40] });

  }, [senderLat, senderLng, receiverLat, receiverLng, status, isReady]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      {editable && (
        <div className="absolute top-2 left-2 z-[400] bg-white rounded-lg shadow-lg border border-slate-200 p-2 space-y-1.5">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Map Edit Mode</p>
          <div className="flex gap-1">
            <button
              onClick={() => setEditMode("sender")}
              className={`px-2 py-1 text-xs rounded font-medium transition-colors ${
                editMode === "sender"
                  ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                  : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              Set Sender
            </button>
            <button
              onClick={() => setEditMode("receiver")}
              className={`px-2 py-1 text-xs rounded font-medium transition-colors ${
                editMode === "receiver"
                  ? "bg-red-100 text-red-700 border border-red-200"
                  : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              Set Receiver
            </button>
          </div>
          <p className="text-[10px] text-slate-400">
            Click anywhere on the map to set the {editMode} location.
          </p>
        </div>
      )}
    </div>
  );
}
