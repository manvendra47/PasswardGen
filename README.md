# Password Generator

A modern, secure, and highly customizable password generator built with React, Vite, and Tailwind CSS. 

## Features

- **Customizable Length**: Choose password lengths from 8 to 32 characters.
- **Character Options**: Toggle uppercase letters, lowercase letters, numbers, and symbols.
- **Visual Strength Indicator**: Real-time feedback on the strength of your generated password based on entropy.
- **One-Click Copy**: Easily copy the generated password to your clipboard.
- **Password History**: Keeps track of your 10 most recently generated passwords, persisted in your browser's local storage.
- **Secure Generation**: Uses `window.crypto.getRandomValues` for cryptographically secure random number generation.
- **Dark Mode UI**: A sleek, dark-themed interface built with Tailwind CSS.

## Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

## Getting Started

Follow these steps to set up and run the project locally:

1. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Start the development server:**
   \`\`\`bash
   npm run dev
   \`\`\`

3. **Open in browser:**
   Navigate to the URL provided in your terminal (usually \`http://localhost:5173\` or \`http://localhost:3000\`).

## Project Structure

- \`src/App.tsx\`: Main application container and logic.
- \`src/components/\`: Reusable UI components (\`StrengthIndicator\`, \`CustomCheckbox\`, \`PasswordHistory\`, \`icons\`).
- \`src/utils/\`: Utility functions (e.g., secure random number generation).
- \`src/constants.ts\`: Character pool constants.

## Technologies Used

- [React 19](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)
