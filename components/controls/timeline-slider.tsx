"use client";

import { Play, Pause } from "lucide-react";
import { useState, useCallback, useRef, useEffect } from "react";
import { Slider } from "@/components/ui/slider";

interface TimelineSliderProps {
  minYear: number;
  maxYear: number;
  value: number;
  onChange: (year: number) => void;
  interval?: number;
}

export function TimelineSlider({
  minYear,
  maxYear,
  value,
  onChange,
  interval = 700,
}: TimelineSliderProps) {
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const stop = useCallback(() => {
    setPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const play = useCallback(() => {
    setPlaying(true);
    let currentYear = value < maxYear ? value : minYear;
    onChange(currentYear);

    timerRef.current = setInterval(() => {
      currentYear += 1;
      if (currentYear > maxYear) {
        stop();
        return;
      }
      onChange(currentYear);
    }, interval);
  }, [value, minYear, maxYear, interval, onChange, stop]);

  const togglePlay = () => {
    if (playing) stop();
    else play();
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);

  return (
    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border-light">
      <button
        className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors btn-press shadow-sm"
        onClick={togglePlay}
      >
        {playing ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
      </button>

      <div className="flex-1 flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <span className="text-xs text-subtext-light w-10">{minYear}</span>
          <div className="flex-1">
            <Slider
              min={minYear}
              max={maxYear}
              step={1}
              value={[value]}
              onValueChange={([v]) => {
                if (playing) stop();
                onChange(v);
              }}
              className="w-full"
            />
          </div>
          <span className="text-xs text-subtext-light w-10 text-right">{maxYear}</span>
        </div>
        <div className="flex justify-between px-10">
          {years.map((y) => (
            <span
              key={y}
              className="text-[9px] text-subtext-light/50"
            >
              {y}
            </span>
          ))}
        </div>
      </div>

      <span className="font-display text-xl font-bold text-primary min-w-[50px] text-center">
        {value}
      </span>
    </div>
  );
}
