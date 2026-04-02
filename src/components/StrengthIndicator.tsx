import React from "react";

interface StrengthIndicatorProps {
  strength: number;
  label: string;
}

export const StrengthIndicator: React.FC<StrengthIndicatorProps> = ({
  strength,
  label,
}) => {
  const strengthConfig = [
    { color: "bg-transparent", width: "w-0" }, // strength 0
    { color: "bg-red-500", width: "w-1/4" }, // strength 1
    { color: "bg-orange-500", width: "w-1/4" }, // strength 2
    { color: "bg-yellow-500", width: "w-3/4" }, // strength 3
    { color: "bg-green-500", width: "w-full" }, // strength 4
  ];

  const currentStrength = strengthConfig[strength] || strengthConfig[0];

  return (
    <div className="bg-slate-900/70 p-4 rounded-lg flex items-center justify-between gap-4">
      <span className="text-sm text-gray-400 uppercase font-medium">
        Strength
      </span>
      <div className="flex-grow flex items-center gap-3">
        <div className="w-full bg-slate-700 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full transition-all duration-300 ${currentStrength.color} ${currentStrength.width}`}
          ></div>
        </div>
        {strength > 0 && (
          <span className="text-sm text-gray-200 font-bold w-20 text-right">
            {label}
          </span>
        )}
      </div>
    </div>
  );
};
