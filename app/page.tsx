'use client';

import { useState } from "react";

type Method = 'ipc' | 'fastapi' | 'jsonrpc';

export default function Home() {
  const [num1, setNum1] = useState<number>(0);
  const [num2, setNum2] = useState<number>(0);
  const [result, setResult] = useState<number | string>(0);
  const [method, setMethod] = useState<Method>('ipc');

  const handleCalculate = async (operation: string) => {
    try {
      if (method === 'ipc') {
        const response = await window.ipcRenderer.invoke('run-python', { 
          num1: Number(num1), 
          num2: Number(num2),
          operation,
        });
        setResult(response);
        console.log("ipc");
      }
      else if (method === 'fastapi') {
        const res = await fetch('http://127.0.0.1:8000/calculate', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({num1: Number(num1), num2: Number(num2), operation})
        });
        const data = await res.json();
        setResult(data.result);
        console.log("fastapi");
      }
      else if (method === 'jsonrpc') {
        const payload = {
          jsonrpc: "2.0",
          method: operation,
          params: [Number(num1), Number(num2)],
          id: 1
        };
        const res = await fetch('http://localhost:4000', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        setResult(data.result ?? data.error?.message ?? "Error");
        console.log("jsonrpc");
      }
    } catch (error: any) {
      setResult(`Error: ${error.message}`);
    }
  };

  const handleReset = () => {
    setNum1(0);
    setNum2(0);
    setResult(0);
  };

  const resultColor = typeof result === 'string' && result.toLowerCase().includes('error') ? '#e53e3e' : '#2b6cb0';

  return (
    <div style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 500, background: 'rgb(0 0 0 / 0.1)', borderRadius: 12, boxShadow: '0 6px 18px rgba(0,0,0,0.08)', padding: 30, boxSizing: 'border-box' }}>
        
        {/* TOGGLE BUTTON - ONLY CHANGE */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <select 
            value={method} 
            onChange={(e) => setMethod(e.target.value as Method)}
            style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #ccc', fontSize: 16, background: 'white' }}
          >
            <option value="ipc">IPC Mode</option>
            <option value="fastapi">FastAPI Mode</option>
            <option value="jsonrpc">JSON-RPC Mode</option>
          </select>
        </div>

        <h1 style={{ margin: 0, marginBottom: 14, textAlign: 'center' }}>Calculator</h1>

        <input type="number" value={num1} onChange={(e) => setNum1(parseFloat(e.target.value) || 0)} placeholder="Enter first number" style={{ display: 'block', width: '100%', margin: '8px 0', padding: '10px', borderRadius: 6, border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
        <input type="number" value={num2} onChange={(e) => setNum2(parseFloat(e.target.value) || 0)} placeholder="Enter second number" style={{ display: 'block', width: '100%', margin: '8px 0 16px 0', padding: '10px', borderRadius: 6, border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />

        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button onClick={() => handleCalculate('add')} style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: '#38a169', color: '#fff', cursor: 'pointer' }}>Add</button>
          <button onClick={() => handleCalculate('subtract')} style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: '#dd6b20', color: '#fff', cursor: 'pointer' }}>Subtract</button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button onClick={() => handleCalculate('multiply')} style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: '#805ad5', color: '#fff', cursor: 'pointer' }}>Multiply</button>
          <button onClick={() => handleCalculate('divide')} style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: '#319795', color: '#fff', cursor: 'pointer' }}>Divide</button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 18 }}>
            Result : <span style={{ color: resultColor, fontWeight: 600 }}>{result}</span>
          </div>
          <button onClick={handleReset} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e0', background: '#f7fafc', cursor: 'pointer' }}>Reset</button>
        </div>
      </div>
    </div>
  );
}