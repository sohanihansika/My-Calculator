declare global {
    interface Window {
        ipcRenderer: {
            invoke: (channel: string, data: any) => Promise<any>;
        };
        electronAPI?: {
            onBackendReady?: (callback: () => void) => void;
        };
    }
}

export {};
