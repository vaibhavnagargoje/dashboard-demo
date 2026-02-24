"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface MapMarker {
  lng: number;
  lat: number;
  label: string;
  value?: string;
  color?: string;
}

interface MapViewProps {
  className?: string;
  center?: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  onMarkerClick?: (marker: { label: string; value?: string }) => void;
  selectedMarker?: string | null;
}

export function MapView({
  className,
  center = [74.7, 19.1], // Ahilyanagar district center
  zoom = 9,
  markers = [],
  onMarkerClick,
  selectedMarker,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [loaded, setLoaded] = useState(false);
  const onMarkerClickRef = useRef(onMarkerClick);
  onMarkerClickRef.current = onMarkerClick;

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;

      // Fix default icon paths (Leaflet issue with bundlers)
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (cancelled || !mapContainer.current) return;

      // Inject Leaflet CSS once
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
        // Wait briefly for CSS to load
        await new Promise((r) => setTimeout(r, 100));
      }

      if (cancelled || !mapContainer.current) return;

      const map = L.map(mapContainer.current, {
        center: [center[1], center[0]], // Leaflet uses [lat, lng]
        zoom: zoom,
        zoomControl: false,
        attributionControl: true,
      });

      // Add zoom control to top-right
      L.control.zoom({ position: "topright" }).addTo(map);

      // Add scale control
      L.control.scale({ maxWidth: 200, position: "bottomleft" }).addTo(map);

      // OpenStreetMap tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      // Custom circle marker icon factory
      const createMarkerIcon = (
        color: string,
        letter: string,
        isSelected: boolean
      ) => {
        const size = isSelected ? 38 : 30;
        const borderWidth = isSelected ? 4 : 3;
        return L.divIcon({
          className: "custom-map-marker",
          html: `<div style="
            width:${size}px;height:${size}px;
            border-radius:50%;
            background:${color};
            border:${borderWidth}px solid ${isSelected ? "#fbbf24" : "white"};
            box-shadow:0 2px 8px rgba(0,0,0,${isSelected ? "0.5" : "0.3"});
            display:flex;align-items:center;justify-content:center;
            cursor:pointer;transition:all 0.2s ease;
            ${isSelected ? "transform:scale(1.15);" : ""}
          "><span style="color:white;font-size:${isSelected ? "13" : "11"}px;font-weight:700;font-family:Lato,sans-serif;">${letter}</span></div>`,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
          popupAnchor: [0, -(size / 2 + 4)],
        });
      };

      // Add markers
      const leafletMarkers: any[] = [];
      markers.forEach((m) => {
        const icon = createMarkerIcon(
          m.color || "#3c4e6a",
          m.label.charAt(0),
          false
        );

        const marker = L.marker([m.lat, m.lng], { icon }).addTo(map);

        // Popup with taluka info
        const popupContent = `
          <div style="font-family:Lato,sans-serif;padding:6px 2px;min-width:160px;">
            <strong style="font-size:14px;color:#1e293b;display:block;margin-bottom:4px;">${m.label}</strong>
            ${
              m.value
                ? `<div style="font-size:11px;color:#64748b;line-height:1.5;">${m.value
                    .split("|")
                    .map((v: string) => {
                      const [key, val] = v.trim().split(":");
                      return `<div><span style="font-weight:600;color:#475569;">${key.trim()}:</span> ${val?.trim() || ""}</div>`;
                    })
                    .join("")}</div>`
                : ""
            }
          </div>
        `;

        marker.bindPopup(popupContent, {
          closeButton: true,
          maxWidth: 220,
          className: "custom-popup",
        });

        marker.on("click", () => {
          onMarkerClickRef.current?.({ label: m.label, value: m.value });
        });

        leafletMarkers.push({ marker, data: m, createMarkerIcon });
      });

      markersRef.current = leafletMarkers;
      mapRef.current = map;

      // Force resize after mount
      setTimeout(() => {
        map.invalidateSize();
        setLoaded(true);
      }, 200);
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current = [];
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update marker styles when selectedMarker changes
  useEffect(() => {
    if (!mapRef.current || markersRef.current.length === 0) return;

    markersRef.current.forEach(({ marker, data, createMarkerIcon }) => {
      const isSelected = data.label === selectedMarker;
      const icon = createMarkerIcon(
        data.color || "#3c4e6a",
        data.label.charAt(0),
        isSelected
      );
      marker.setIcon(icon);

      if (isSelected) {
        mapRef.current.flyTo([data.lat, data.lng], 11, { duration: 0.8 });
        marker.openPopup();
      }
    });
  }, [selectedMarker]);

  return (
    <div className={cn("relative rounded-lg overflow-hidden", className)}>
      <div ref={mapContainer} className="w-full h-full" />
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 z-[1000]">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-subtext-light">Loading map...</span>
          </div>
        </div>
      )}
    </div>
  );
}
