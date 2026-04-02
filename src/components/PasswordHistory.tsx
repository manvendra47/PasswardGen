import React, { useState } from "react";
import { CopyIcon, CheckIcon } from "./icons";

interface PasswordHistoryProps {
  history: string[];
  onCopy: (password: string) => void;
  onClear: () => void;
}

export const PasswordHistory: React.FC<PasswordHistoryProps> = ({
  history,
  onCopy,
  onClear,
}) => {
  const [copiedPassword, setCopiedPassword] = useState<string | null>(null);

  const handleCopyClick = (password: string) => {
    onCopy(password);
    setCopiedPassword(password);
    setTimeout(() => setCopiedPassword(null), 2000);
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 p-6 rounded-lg shadow-2xl mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-400 uppercase tracking-wider">
          History
        </h2>
        {history.length > 0 && (
          <button
            onClick={onClear}
            className="text-sm text-gray-500 hover:text-cyan-400 transition-colors"
            aria-label="Clear password history"
          >
            Clear All
          </button>
        )}
      </div>
      {history.length > 0 ? (
        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
          {history.map((p, index) => (
            <div
              key={`${p}-${index}`}
              className="flex items-center justify-between bg-slate-900/70 p-3 rounded-md hover:bg-slate-800 transition-colors"
            >
              <span className="font-mono text-gray-300 break-all pr-4 select-all">
                {p}
              </span>
              <button
                onClick={() => handleCopyClick(p)}
                className="p-1 text-gray-400 hover:text-cyan-400 transition-colors flex-shrink-0"
                aria-label={`Copy password ${index + 1}`}
              >
                {copiedPassword === p ? (
                  <CheckIcon className="w-5 h-5 text-cyan-400" />
                ) : (
                  <CopyIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">
          Your generated passwords will appear here.
        </p>
      )}
    </div>
  );
};
