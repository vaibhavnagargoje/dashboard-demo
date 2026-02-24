"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface CompareToggleProps {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
  color?: string;
}

export function CompareToggle({
  label,
  checked,
  onCheckedChange,
  className,
}: CompareToggleProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="data-[state=checked]:bg-primary"
      />
      <Label className="text-xs text-subtext-light font-normal cursor-pointer">
        {label}
      </Label>
    </div>
  );
}
