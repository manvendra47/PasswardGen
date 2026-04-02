import React from "react";
import { CheckIcon } from "./icons";

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: () => void;
  name: string;
}

export const CustomCheckbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onChange,
  name,
}) => (
  <label
    htmlFor={name}
    className="flex items-center space-x-3 cursor-pointer select-none"
  >
    <div className="relative">
      <input
        type="checkbox"
        id={name}
        name={name}
        checked={checked}
        onChange={onChange}
        className="sr-only"
        aria-checked={checked}
      />
      <div
        className={`w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200 ${checked ? "bg-cyan-400" : "border border-slate-500"}`}
      >
        {checked && <CheckIcon className="w-4 h-4 text-slate-900" />}
      </div>
    </div>
    <span className="text-gray-300">{label}</span>
  </label>
);
