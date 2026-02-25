"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface MapMarker {
  lng: number;
  lat: number;
  label: string;
  value?: string;
  color?: string;
  radius?: number; // optional proportional sizing hint
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
  center = [74.7, 19.1],
  zoom = 9,
  markers = [],
  onMarkerClick,
  selectedMarker,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);
  const markerLayerRef = useRef<any>(null);
  const [loaded, setLoaded] = useState(false);
  const onMarkerClickRef = useRef(onMarkerClick);
  onMarkerClickRef.current = onMarkerClick;

  // ── Effect 1: Initialize Leaflet map (once) ──────────────
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;

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
        await new Promise((r) => setTimeout(r, 100));
      }

      // Inject custom styles once
      if (!document.getElementById("map-marker-css")) {
        const style = document.createElement("style");
        style.id = "map-marker-css";
        style.textContent = `
          @keyframes pulse-ring {
            0% { transform: scale(1); opacity: 0.6; }
            100% { transform: scale(1.8); opacity: 0; }
          }
          .marker-pulse::after {
            content: '';
            position: absolute;
            inset: -4px;
            border-radius: 50%;
            border: 2px solid currentColor;
            animation: pulse-ring 1.5s ease-out infinite;
          }
          .map-area-circle { transition: opacity 0.3s ease, stroke-width 0.3s ease; }
          .custom-popup .leaflet-popup-content-wrapper {
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          }
          .custom-popup .leaflet-popup-tip { box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        `;
        document.head.appendChild(style);
      }

      if (cancelled || !mapContainer.current) return;

      const map = L.map(mapContainer.current, {
        center: [center[1], center[0]],
        zoom: zoom,
        zoomControl: false,
        attributionControl: true,
      });

      L.control.zoom({ position: "topright" }).addTo(map);
      L.control.scale({ maxWidth: 200, position: "bottomleft" }).addTo(map);

      // CartoDB Positron — cleaner, professional tiles
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
          maxZoom: 19,
          subdomains: "abcd",
        }
      ).addTo(map);

      const markerLayer = L.layerGroup().addTo(map);

      leafletRef.current = L;
      markerLayerRef.current = markerLayer;
      mapRef.current = map;

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
        leafletRef.current = null;
        markerLayerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Effect 2: Fly to new center/zoom when district changes ──
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.flyTo([center[1], center[0]], zoom, { duration: 0.8 });
  }, [center, zoom]);

  // ── Effect 3: Rebuild markers whenever markers or selection changes ──
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    const markerLayer = markerLayerRef.current;
    if (!L || !map || !markerLayer) return;

    // Clear previous markers
    markerLayer.clearLayers();

    // Proportional sizing
    const radii = markers.map((m) => m.radius ?? 0).filter((r) => r > 0);
    const maxR = radii.length > 0 ? Math.max(...radii) : 0;
    const minR = radii.length > 0 ? Math.min(...radii) : 0;

    markers.forEach((m) => {
      const isSelected = m.label === selectedMarker;
      const color = m.color || "#3c4e6a";

      // ── Area circle (translucent region outline) ──
      const areaRadius =
        maxR > 0 && m.radius
          ? 3000 + ((m.radius - minR) / (maxR - minR + 1)) * 5000
          : 4000;

      const circle = L.circle([m.lat, m.lng], {
        radius: areaRadius,
        color: color,
        weight: isSelected ? 2.5 : 1.5,
        opacity: isSelected ? 0.8 : 0.4,
        fillColor: color,
        fillOpacity: isSelected ? 0.2 : 0.08,
        className: "map-area-circle",
      });
      markerLayer.addLayer(circle);

      // ── Center marker (gradient bubble with letter) ──
      const dotSize = isSelected ? 40 : 32;
      const borderW = isSelected ? 3 : 2;
      const icon = L.divIcon({
        className: "custom-map-marker",
        html: `<div style="
          position:relative;
          width:${dotSize}px;height:${dotSize}px;
          border-radius:50%;
          background:radial-gradient(circle at 35% 35%, ${lightenColor(color, 30)}, ${color});
          border:${borderW}px solid ${isSelected ? "#fbbf24" : "rgba(255,255,255,0.9)"};
          box-shadow:0 3px 12px rgba(0,0,0,${isSelected ? "0.45" : "0.25"}),inset 0 1px 2px rgba(255,255,255,0.3);
          display:flex;align-items:center;justify-content:center;
          cursor:pointer;transition:all 0.25s ease;
          ${isSelected ? "transform:scale(1.15);" : ""}
          color:${color};
        " class="${isSelected ? "marker-pulse" : ""}">
          <span style="color:white;font-size:${isSelected ? "14" : "12"}px;font-weight:700;font-family:Inter,Lato,sans-serif;text-shadow:0 1px 2px rgba(0,0,0,0.3);">
            ${m.label.charAt(0).toUpperCase()}
          </span>
        </div>`,
        iconSize: [dotSize, dotSize],
        iconAnchor: [dotSize / 2, dotSize / 2],
        popupAnchor: [0, -(dotSize / 2 + 4)],
      });

      const marker = L.marker([m.lat, m.lng], { icon });
      markerLayer.addLayer(marker);

      // Popup content
      const popupContent = `
        <div style="font-family:Inter,Lato,sans-serif;padding:8px 4px;min-width:170px;">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
            <span style="width:10px;height:10px;border-radius:50%;background:${color};display:inline-block;flex-shrink:0;"></span>
            <strong style="font-size:14px;color:#1e293b;">${m.label}</strong>
          </div>
          ${
            m.value
              ? `<div style="font-size:11px;color:#64748b;line-height:1.6;border-top:1px solid #f1f5f9;padding-top:6px;">${m.value
                  .split("|")
                  .map((v: string) => {
                    const [key, val] = v.trim().split(":");
                    return `<div style="display:flex;justify-content:space-between;gap:8px;"><span style="font-weight:600;color:#475569;">${key.trim()}</span><span style="font-weight:500;color:#1e293b;">${val?.trim() || ""}</span></div>`;
                  })
                  .join("")}</div>`
              : ""
          }
        </div>
      `;

      marker.bindPopup(popupContent, {
        closeButton: true,
        maxWidth: 240,
        className: "custom-popup",
      });

      marker.on("click", () => {
        onMarkerClickRef.current?.({ label: m.label, value: m.value });
      });

      if (isSelected) {
        setTimeout(() => {
          map.flyTo([m.lat, m.lng], Math.max(zoom, 11), { duration: 0.6 });
          marker.openPopup();
        }, 100);
      }
    });
  }, [markers, selectedMarker, zoom]);

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

/** Lighten a hex color by a percentage */
function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, (num >> 16) + Math.round((255 - (num >> 16)) * (percent / 100)));
  const g = Math.min(255, ((num >> 8) & 0x00ff) + Math.round((255 - ((num >> 8) & 0x00ff)) * (percent / 100)));
  const b = Math.min(255, (num & 0x0000ff) + Math.round((255 - (num & 0x0000ff)) * (percent / 100)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
