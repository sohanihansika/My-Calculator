# Project Structural Analysis — my-calculator

> Date: 2025-11-29

This document contains a complete structural analysis of the repository and suggested fixes or improvements.

---

## 🔎 Summary (what I examined)

- Codebase contains Next.js frontend in `app/` (app router), an Electron main process (`main.js` & `preload.js`), and Python backends (`backend/fastapi_server.py`, `backend/jsonrpc_server.py`, `backend/script.py`).
- Packaging uses `electron-builder` in `package.json`. Next.js is configured for static export via `next.config.js` `output: 'export'`.
- Dev workflow relies on `concurrently` scripts (`dev:ipc`, `dev:fastapi`, `dev:jsonrpc`) that run Next development server, Electron, and Python servers concurrently.

---

## ❗ High–Severity Structural Issues (blockers)

1. **Missing production load of front-end assets in `main.js`**
   - File: `main.js`
   - Problem: When `isDev` is false, `BrowserWindow` never loads any page (no `win.loadFile()` or `win.loadURL()` for static files).
   - Impact: Packaged Electron application will show a blank window; production build won't work.
   - Fix example:
     ```js
     if (isDev) {
       win.loadURL('http://localhost:3000');
     } else {
       win.loadFile(path.join(__dirname, 'out', 'index.html'));
     }
     ```

2. **Packaging mismatches / missing Python bundling for production**
   - Files: `package.json`, `main.js`, `backend/`
   - Problem:
     - `electron:build` runs `npm run build && electron-builder`. `build.files` includes `out/**/*` but `npm run build` only runs `next build` (no `next export`).
     - `extraResources` point to `backend/*.exe`, but repo only contains `.py` files.
     - `main.js` doesn't spawn backends in production; dev scripts rely on `concurrently`.
   - Impact: Packaged app will not include server backends, causing runtime errors.
   - Fix:
     - Update `build` script: `next build && next export` if you want exported static files included.
     - Bundle Python scripts or compiled executables properly: e.g., use `pyinstaller` to compile `.py` to `.exe` for Windows and include them in `extraResources`.
     - Store backend processes in `main.js` to control them in production as well.

3. **Path mapping and TypeScript include errors**
   - Files: `tsconfig.json`, `app/src/types/electron.d.ts`
   - Problem:
     - `tsconfig.json` includes `paths` but omits `baseUrl` => alias resolution fails.
     - `include` includes `src/types/**/*.d.ts` but the types are at `app/src/types` and may not be included.
   - Impact: TypeScript might miss type definitions for the Electron API.
   - Fix:
     - Add `baseUrl: '.'` to `compilerOptions`.
     - Update `include` to include `app/src/types/**/*.d.ts`.

4. **`fastapi_server.py` CORS misconfiguration**
   - File: `backend/fastapi_server.py`
   - Problem: `allow_origins` includes both a specific URL and `"*"` with `allow_credentials=True`, which is invalid and insecure in some contexts.
   - Impact: CORS may throw runtime runtime errors and is overly permissive.
   - Fix: Replace `*` with a specific list. For dev: `['http://localhost:3000']`. For production, more careful whitelisting.

5. **No Python dependency manifest**
   - Files: root
   - Problem: Missing `requirements.txt` or `pyproject.toml` explaining Python dependencies (FastAPI, uvicorn, pydantic).
   - Impact: Environment not reproducible; new developers can't install easily.
   - Fix: Add `requirements.txt` with pinned versions or `pyproject.toml`.

---

## ⚠️ Medium-Severity Structural Issues (warnings / quality)

6. **`preload.js` exposes unrestricted IPC API**
   - File: `preload.js`
   - Problem: `contextBridge.exposeInMainWorld('ipcRenderer', { invoke: ... })` provides a raw `invoke` surface that can be used to call any IPC channel.
   - Impact: Increased attack surface and risk in the renderer.
   - Fix: Expose a limited API:
     ```js
     contextBridge.exposeInMainWorld('api', {
       runPython: (data) => ipcRenderer.invoke('run-python', data)
     });
     ```

7. **`main.js` backend lifecycle & process handling**
   - File: `main.js`
   - Problem: `backendProcess` defined but unused; per-request spawn (`spawn('python', ['backend/script.py', JSON.stringify(args)])`) used for all calls.
   - Impact: Inefficient; long running backend (e.g., FastAPI) should be spawned on start and terminated properly during shutdown.
   - Fix: Spawn long lived backend processes at `app.whenReady()`, store the process, and kill in `app.on('window-all-closed')`.

8. **`main.js`: misc typos and lack of validation**
   - File: `main.js`
   - Problem: Minor typos such as `Unkonwn Error`. Also, lack of argument validation before spawning.
   - Impact: Minor but worth fixing.

9. **`page.tsx` toggle method is manual and fragile**
   - File: `app/page.tsx`
   - Problem: Toggle is made by commenting/uncommenting blocks—error-prone.
   - Fix: Add a UI select or runtime environment variable to choose the method.

10. **`package.json` build step incomplete for export**
    - File: `package.json`
    - Problem: `build` runs `next build` but not `next export` even though `files` expects `out`.
    - Fix: Change `build` to: `next build && next export`.

11. **`package.json` `build.extraResources` points to non-existent `.exe`**
    - File: `package.json`
    - Problem: `backend/fastapi_server.exe` etc. are used but do not exist.
    - Fix: Update to actual paths or compiled backends.

12. **`tsconfig` `moduleResolution` setting**
    - File: `tsconfig.json`
    - Problem: Using `moduleResolution: 'bundler'` is fine for modern setups but can cause inconsistencies with some tools.
    - Fix: Only change if compatibility issues arise—otherwise document reason.

13. **`main.js` does not validate user input before passing to Python**
    - Files: `main.js`, `app/page.tsx`
    - Problem: Input is passed through `JSON.stringify` directly.
    - Fix: Validate `num1`, `num2` and operation in the main process before spawning Python.

14. **`README` lacks packaging instructions & backend packaging guidance**
    - File: `README.md`
    - Problem: Only dev usage; not how to package or handle Python executable bundling.
    - Fix: Add build & packaging steps and backend packaging details.

15. **`fastapi_server.py` uses default IP and port without configuration**
    - File: `backend/fastapi_server.py`
    - Fix: Use environment variables for host and port and add logging and graceful shutdown.

---

## ✅ Minor / optional improvements

- Add a `requirements.txt` and include instructions to set up a Python virtual environment.
- Add `README` packaging instructions (e.g., `pyinstaller` instructions to create `.exe` files for distribution).
- Add a small test harness for Python and Node—unit tests and integration tests.
- Improve security by narrowing the exposed IPC surface.
- Add CI/CD instructions for packaging Electron and Python artifacts.

---

## Example code snippets: fixes to address critical issues

1) Add `win` production load in `main.js`:
```js
if (isDev) {
  win.loadURL('http://localhost:3000');
} else {
  const filePath = path.join(__dirname, 'out', 'index.html');
  win.loadFile(filePath);
}
```

2) Use safer `preload.js` exposure:
```js
contextBridge.exposeInMainWorld('api', {
  runPython: (data) => ipcRenderer.invoke('run-python', data)
});
```

3) Change `package.json` `build` script to include `next export`:
```json
"build": "next build && next export"
```

4) Add a `requirements.txt`:
```
fastapi==0.101.0
uvicorn==0.23.0
pydantic==2.2.0
```

5) Fix `tsconfig.json` baseUrl and include:
```jsonc
"compilerOptions": {
  ...
  "baseUrl": ".",
  ...
},
"include": [
  "next-env.d.ts",
  "**/*.ts",
  "**/*.tsx",
  ".next/types/**/*.ts",
  ".next/dev/types/**/*.ts",
  "**/*.mts",
  "app/src/types/**/*.d.ts",
  "next.config.js"
],
```

6) Remove wildcard `*` in CORS rules:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # For dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🧭 Recommended next steps (priority-based)

1. Update `package.json` `build` to use `next export`. Add `requirements.txt`.
2. Add production `win.loadFile` for Electron and ensure `out/index.html` is present after export.
3. Decide how to bundle Python backends (bundle `.py` files or use `pyinstaller` to compile `.exe` — update `extraResources` accordingly).
4. Harden `preload.js` and implement safe channel checks, update `app/src/types/electron.d.ts` as needed.
5. Fix `tsconfig` `baseUrl` and include `app/src/types`.
6. Fix `fastapi_server.py` CORS policy and add `requirements.txt`.
7. Update README with packaging instructions.

---

## 📋 Quick checklist you can apply now
- [ ] Add `baseUrl` to `tsconfig.json` and fix `include` to `app/src/types`.
- [ ] Update `build` script to call `next export`.
- [ ] Add production fallback in `main.js` to load `out/index.html`.
- [ ] Decide backend packaging flow and implement it; add `requirements.txt` or compiled executables.
- [ ] Harden `preload.js`.
- [ ] Update `package.json` `build.extraResources` to include actual files.
- [ ] Improve README with production packaging details.
