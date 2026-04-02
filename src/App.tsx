import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  UPPERCASE_CHARS,
  LOWERCASE_CHARS,
  NUMBER_CHARS,
  SYMBOL_CHARS,
} from "./constants";

// --- Helper for secure random number generation ---
const getRandomInt = (max: number): number => {
  if (
    typeof window !== "undefined" &&
    window.crypto &&
    window.crypto.getRandomValues
  ) {
    if (max === 0) return 0;
    const randomValues = new Uint32Array(1);
    window.crypto.getRandomValues(randomValues);
    return randomValues[0] % max;
  }

  console.warn(
    "Warning: Using insecure Math.random() as a fallback for password generation.",
  );
  if (max === 0) return 0;
  return Math.floor(Math.random() * max);
};

// --- Reusable SVG Icon Components ---

const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75"
    />
  </svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.5 12.75l6 6 9-13.5"
    />
  </svg>
);

const GenerateIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.667 0l3.182-3.182m0-4.991v4.99"
    />
  </svg>
);

// --- Child Components ---

interface StrengthIndicatorProps {
  strength: number;
  label: string;
}

const StrengthIndicator: React.FC<StrengthIndicatorProps> = ({
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

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: () => void;
  name: string;
}

const CustomCheckbox: React.FC<CheckboxProps> = ({
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

// --- Password History Component ---
interface PasswordHistoryProps {
  history: string[];
  onCopy: (password: string) => void;
  onClear: () => void;
}

const PasswordHistory: React.FC<PasswordHistoryProps> = ({
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

// --- Main App Component ---

const App: React.FC = () => {
  const [length, setLength] = useState<number>(16);
  const [includeUppercase, setIncludeUppercase] = useState<boolean>(true);
  const [includeLowercase, setIncludeLowercase] = useState<boolean>(true);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(true);
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [generationTrigger, setGenerationTrigger] = useState(0);
  const [passwordHistory, setPasswordHistory] = useState<string[]>([]);
  const isInitialMount = useRef(true);

  // Load history from localStorage on initial render
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem("passwordHistory");
      if (storedHistory) {
        setPasswordHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error(
        "Failed to parse password history from localStorage",
        error,
      );
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("passwordHistory", JSON.stringify(passwordHistory));
  }, [passwordHistory]);

  const { password, strength, strengthLabel } = useMemo(() => {
    const charOptions = [
      ...(includeUppercase ? [UPPERCASE_CHARS] : []),
      ...(includeLowercase ? [LOWERCASE_CHARS] : []),
      ...(includeNumbers ? [NUMBER_CHARS] : []),
      ...(includeSymbols ? [SYMBOL_CHARS] : []),
    ];

    if (charOptions.length === 0) {
      return { password: "", strength: 0, strengthLabel: "" };
    }

    const charset = charOptions.join("");
    const guaranteedChars = charOptions.map(
      (option) => option[getRandomInt(option.length)],
    );

    const remainingLength = Math.max(0, length - guaranteedChars.length);
    const randomChars = Array.from(
      { length: remainingLength },
      () => charset[getRandomInt(charset.length)],
    );

    const combinedChars = [...guaranteedChars, ...randomChars];
    for (let i = combinedChars.length - 1; i > 0; i--) {
      const j = getRandomInt(i + 1);
      [combinedChars[i], combinedChars[j]] = [
        combinedChars[j],
        combinedChars[i],
      ];
    }

    const newPassword = combinedChars.slice(0, length).join("");

    const strengthLabels = ["", "Too Weak!", "Weak", "Medium", "Strong"];
    const pool =
      (includeUppercase ? UPPERCASE_CHARS.length : 0) +
      (includeLowercase ? LOWERCASE_CHARS.length : 0) +
      (includeNumbers ? NUMBER_CHARS.length : 0) +
      (includeSymbols ? SYMBOL_CHARS.length : 0);

    let newStrength = 0;
    if (pool > 1) {
      const entropy = length * Math.log2(pool);
      if (entropy < 35) newStrength = 1;
      else if (entropy < 60) newStrength = 2;
      else if (entropy < 80) newStrength = 3;
      else newStrength = length > 16 ? 4 : 3;
    } else if (length > 0) {
      newStrength = 1;
    }

    if (
      length >= 20 &&
      includeUppercase &&
      includeLowercase &&
      includeNumbers &&
      includeSymbols
    ) {
      newStrength = 4;
    }

    return {
      password: newPassword,
      strength: newStrength,
      strengthLabel: strengthLabels[newStrength],
    };
  }, [
    length,
    includeUppercase,
    includeLowercase,
    includeNumbers,
    includeSymbols,
    generationTrigger,
  ]);

  // Add password to history when explicitly generated
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (password && password !== passwordHistory[0]) {
      const newHistory = [password, ...passwordHistory].slice(0, 10);
      setPasswordHistory(newHistory);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generationTrigger]);

  const handleCopyToClipboard = (textToCopy: string) => {
    if (!textToCopy) return;
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy password: ", err);
      });
  };

  const handleCopyHistoryItem = (textToCopy: string) => {
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy).catch((err) => {
      console.error("Failed to copy from history: ", err);
    });
  };

  const handleGenerateClick = () => {
    setGenerationTrigger((t) => t + 1);
  };

  const handleClearHistory = () => {
    setPasswordHistory([]);
  };

  const anyOptionSelected =
    includeUppercase || includeLowercase || includeNumbers || includeSymbols;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-900 text-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-400 tracking-wider">
          PASSWORD GENERATOR
        </h1>

        <div className="bg-slate-800/50 p-4 rounded-lg shadow-2xl flex items-center justify-between mb-6">
          <span className="text-2xl font-mono break-all pr-4 text-gray-200 select-all">
            {password || <span className="text-gray-500">P4$5W0rD!</span>}
          </span>
          <button
            onClick={() => handleCopyToClipboard(password)}
            className="p-2 text-cyan-400 hover:text-cyan-300 transition-colors relative"
            aria-label="Copy password to clipboard"
          >
            {copied ? (
              <CheckIcon className="w-6 h-6" />
            ) : (
              <CopyIcon className="w-6 h-6" />
            )}
            <span
              className={`absolute -top-8 right-0 text-xs bg-slate-900 text-white px-2 py-1 rounded-md transition-opacity duration-300 pointer-events-none ${copied ? "opacity-100" : "opacity-0"}`}
            >
              Copied!
            </span>
          </button>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 p-6 rounded-lg shadow-2xl space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label htmlFor="length" className="font-medium text-gray-300">
                Password Length
              </label>
              <span className="text-2xl font-bold text-cyan-400">{length}</span>
            </div>
            <input
              type="range"
              id="length"
              min="8"
              max="32"
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              aria-label={`Password length: ${length}`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <CustomCheckbox
              name="uppercase"
              label="Include Uppercase"
              checked={includeUppercase}
              onChange={() => setIncludeUppercase((prev) => !prev)}
            />
            <CustomCheckbox
              name="lowercase"
              label="Include Lowercase"
              checked={includeLowercase}
              onChange={() => setIncludeLowercase((prev) => !prev)}
            />
            <CustomCheckbox
              name="numbers"
              label="Include Numbers"
              checked={includeNumbers}
              onChange={() => setIncludeNumbers((prev) => !prev)}
            />
            <CustomCheckbox
              name="symbols"
              label="Include Symbols"
              checked={includeSymbols}
              onChange={() => setIncludeSymbols((prev) => !prev)}
            />
          </div>

          <StrengthIndicator strength={strength} label={strengthLabel} />

          <button
            onClick={handleGenerateClick}
            disabled={!anyOptionSelected}
            className="w-full flex items-center justify-center gap-2 bg-cyan-500 text-slate-900 font-bold py-3 rounded-lg text-lg transition-all transform hover:scale-105 hover:bg-cyan-400 disabled:bg-slate-700 disabled:text-gray-500 disabled:cursor-not-allowed disabled:scale-100"
          >
            <GenerateIcon className="w-6 h-6" />
            GENERATE
          </button>
        </div>

        <PasswordHistory
          history={passwordHistory}
          onCopy={handleCopyHistoryItem}
          onClear={handleClearHistory}
        />
      </div>
    </div>
  );
};

export default App;
