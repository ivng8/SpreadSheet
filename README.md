# Team711 Project

Spreadsheet application built with Typscript and Vite.

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher recommended)
- pnpm

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd team711-project
```

2. Install dependencies:
```bash
cd implementation
pnpm install
```

## 🛠️ Development

Start the development server:
```bash
cd server
pnpm install
pnpm start
start a new terminal
pnpm run dev
```

This will start the Vite development server with hot module replacement (HMR).

### Available Scripts

- `pnpm run dev` - Start development server
- `pnpm test` - Run tests
- `pnpm run test:watch` - Run tests in watch mode
- `pnpm run test:coverage` - Run tests with coverage report
- `pnpm run lint` - Run ESLint
- `pnpm run lint:fix` - Fix ESLint errors automatically
- `pnpm run format` - Format code with Prettier
- `pnpm run format:check` - Check code formatting

## 🧪 Testing

This project uses Jest for testing. Tests can be written using React Testing Library (recommended) or other testing utilities.

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm run test:watch

# Generate coverage report
pnpm run test:coverage
```

## 📝 Code Style

This project follows strict coding standards using:
- TypeScript for type safety
- ESLint for code linting with Airbnb configuration
- Prettier for code formatting

### Linting & Formatting

Before committing, make sure your code:
1. Passes all tests
2. Has no linting errors
3. Is properly formatted

```bash
# Check and fix lint issues
pnpm run lint
pnpm run lint:fix

# Check and fix formatting
pnpm run format
pnpm run format:check
```

## 🏗️ Project Structure

```
src/
├── model/                # Core business logic and data models
│   ├── builders/        # Builder pattern implementations
│   ├── components/      # Model-specific components
│   ├── conflicts/       # Conflict resolution logic
│   ├── enums/          # Enumeration types
│   ├── errors/         # Custom error definitions
│   ├── expressions/     # Expression handling
│   ├── interfaces/      # TypeScript interfaces
│   └── version/        # Version control logic
├── view/                # UI layer
│   ├── components/     # Reusable UI components
│   ├── constants/      # UI-related constants
│   ├── hooks/          # Custom React hooks
│   ├── layouts/        # Layout components
│   ├── shadcnui/       # Shadcn UI components
│   ├── styles/         # Styling utilities
│   ├── types/          # UI-specific types
│   └── utils/          # Utility functions
├── App.tsx             # Main application component
├── index.css           # Global styles
├── index.html          # HTML entry point
└── main.tsx            # Application entry point
```

## 🛠️ Tech Stack

- **Framework:** React 18
- **Build Tool:** Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Testing:** Jest
- **Code Quality:**
  - ESLint
  - Prettier
  - TypeScript
  - Airbnb Style Guide

## 🎨 UI Components and Styling

This project uses:
- `class-variance-authority` for component variants
- `clsx` and `tailwind-merge` for class name management
- `tailwindcss-animate` for animations
- Lucide React for icons

### Styling Example

```tsx
import { cva } from 'class-variance-authority';
import { cn } from '@/utils';

const buttonVariants = cva(
  'rounded-md transition-colors',
  {
    variants: {
      variant: {
        primary: 'bg-blue-500 text-white hover:bg-blue-600',
        secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
      },
      size: {
        sm: 'px-2 py-1 text-sm',
        md: 'px-4 py-2',
        lg: 'px-6 py-3 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);
```

## ✍️ Author

Nathan Huang, Brant Pan, Ivan Ng

---

For more information or questions, please open an issue in the repository.
