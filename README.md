## Project Overview

This Proof of Concept (POC) demonstrates the integration of Python backends with a Next.js frontend in an Electron desktop app. The POC is a simple calculator that performs operations (+, -, ×, ÷) using three methods: IPC (with child_process.spawn), FastAPI (REST), and JSON-RPC (pure implementation).

Key Features  

- 3 Integration Methods: Toggle between IPC, FastAPI, and JSON-RPC in code.  
- Data Input: Two numbers and operation buttons.  
- Automatic Calculation: Calls Python backend on button click.  
- Reset Functionality: Clears inputs and result.  
- Error Handling: Displays errors like division by zero.  

## Architecture

Technology Stack  

- UI Framework: Next.js.  
- Desktop Wrapper: Electron.  
- Backend: Python (integrated via IPC, FastAPI, or JSON-RPC).  
- Dependencies: concurrently (parallel runs).  

The app uses Electron's main process to launch backends and renderer (Next.js) for UI.

## Application Flow

1. User inputs two numbers.  
2. Clicks an operation button (+, -, ×, ÷).  
3. Frontend calls Python backend via selected method.  
4. Python computes result and returns it.  
5. Frontend displays result or error.  
6. Reset button clears everything.  

## Special Features

- **Multi-Method Toggle**: Comment/uncomment in page.tsx to switch methods.    
- **CORS & Security**: Built-in for FastAPI/JSON-RPC.    

## File Structure

my-calculator/
├── backend/
│   ├── fastapi_server.py        # FastAPI source 
│   ├── jsonrpc_server.py        # JSON-RPC source 
│   └── script.py                # IPC source 
├── app/
|   └── page.tsx                 # Frontend UI + method toggle
│   └── src/
│       └── types/            
│         └── electron.d.ts      # TypeScript for IPC
├── main.js                      # Electron main process
├── preload.js                   # IPC exposure             
├── next.config.js               # Next.js static export
├── package.json                 # Scripts & build config
├── tsconfig.json                # TypeScript config
└── README.md                    

## Key Components

- **main.js**: Launches backends, creates window, handles IPC.  
- **preload.js**: Securely exposes IPC to renderer.  
- **page.tsx**: UI + toggle for 3 methods.  
- **backend/**: Python sources.  

## Data Flow

1. Frontend (page.tsx) → User input → Button click.  
2. Calls backend via IPC/FastAPI/JSON-RPC.  
3. Backend (Python) → Computes result → Returns JSON/string.  
4. Frontend → Displays result.  


## Getting Started

### Prerequisites

- Node.js 20+ (npm)
- Python 3.12+ 

### Installation

1. Clone or copy the project folder.  
2. Run `npm install` to install dependencies.   

### Switch Methods

In `app/page.tsx`, comment/uncomment the `handleCalculate` blocks:  

```tsx
// IPC
const handleCalculate = async (operation: string) => { /* IPC code */ };

// FastAPI
// const handleCalculate = async (operation: string) => { /* FastAPI code */ };

// JSON-RPC
// const handleCalculate = async (operation: string) => { /* JSON-RPC code */ };
```
### Run 

- IPC: `npm run dev:ipc`  
- FastAPI: `npm run dev:fastapi`  
- JSON-RPC: `npm run dev:jsonrpc` 

