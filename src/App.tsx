import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  UPPERCASE_CHARS,
  LOWERCASE_CHARS,
  NUMBER_CHARS,
  SYMBOL_CHARS,
} from "./constants";
import { getRandomInt } from "./components/random";
import { CopyIcon, CheckIcon, GenerateIcon } from "./components/icons";
import { StrengthIndicator } from "./components/StrengthIndicator";
import { CustomCheckbox } from "./components/CustomCheckbox";
import { PasswordHistory } from "./components/PasswordHistory";

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
