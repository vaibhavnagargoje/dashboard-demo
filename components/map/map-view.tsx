"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import "maplibre-gl/dist/maplibre-gl.css";

interface MapViewProps {
  className?: string;
  center?: [number, number];
  zoom?: number;
  markers?: Array<{
    lng: number;
    lat: number;
    label: string;
    value?: string;
    color?: string;
  }>;
  onMarkerClick?: (marker: { label: string; value?: string }) => void;
}

export function MapView({
  className,
  center = [74.7, 19.1], // Ahilyanagar district center
  zoom = 9,
  markers = [],
  onMarkerClick,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    let cancelled = false;

    (async () => {
      const maplibregl = (await import("maplibre-gl")).default;

      if (cancelled || !mapContainer.current) return;

      const map = new maplibregl.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {
            osm: {
              type: "raster",
              tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
              tileSize: 256,
              attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            },
          },
          layers: [
            {
              id: "osm",
              type: "raster",
              source: "osm",
            },
          ],
        },
        center: center,
        zoom: zoom,
      });

      map.addControl(new maplibregl.NavigationControl(), "top-right");
      map.addControl(
        new maplibregl.ScaleControl({ maxWidth: 200 }),
        "bottom-left"
      );

      map.on("load", () => {
        if (!cancelled) {
          setLoaded(true);
          mapRef.current = map;

          // Add markers
          markers.forEach((m) => {
            const el = document.createElement("div");
            el.className = "map-marker";
            el.style.width = "32px";
            el.style.height = "32px";
            el.style.borderRadius = "50%";
            el.style.backgroundColor = m.color || "#3c4e6a";
            el.style.border = "3px solid white";
            el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
            el.style.cursor = "pointer";
            el.style.display = "flex";
            el.style.alignItems = "center";
            el.style.justifyContent = "center";

            const inner = document.createElement("span");
            inner.style.color = "white";
            inner.style.fontSize = "10px";
            inner.style.fontWeight = "700";
            inner.textContent = m.label.charAt(0);
            el.appendChild(inner);

            const popup = new maplibregl.Popup({
              offset: 20,
              closeButton: false,
            }).setHTML(
              `<div style="font-family:Inter,sans-serif;padding:4px 0;">
                <strong style="font-size:13px;color:#1e293b;">${m.label}</strong>
                ${m.value ? `<div style="font-size:11px;color:#64748b;margin-top:2px;">${m.value}</div>` : ""}
              </div>`
            );

            const marker = new maplibregl.Marker({ element: el })
              .setLngLat([m.lng, m.lat])
              .setPopup(popup)
              .addTo(map);

            el.addEventListener("click", () => {
              onMarkerClick?.({ label: m.label, value: m.value });
            });
          });
        }
      });
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={cn("relative rounded-lg overflow-hidden", className)}>
      <div ref={mapContainer} className="w-full h-full" />
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-subtext-light">Loading map...</span>
          </div>
        </div>
      )}
    </div>
  );
}
