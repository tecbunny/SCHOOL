"use client";

import React, { useState } from 'react';

export function SharedDeviceLogin() {
  const [studentId, setStudentId] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // In reality, this would hit the Class Station local auth proxy endpoint
      // const res = await fetch(`http://${process.env.NEXT_PUBLIC_CLASS_STATION_IP}:4102/api/auth/local`, { ... })
      
      console.log('Logging in student locally on shared hub:', studentId);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate local validation
      
      alert(`Student ${studentId} logged in successfully on this shared hub.`);
      // Redirect or load student profile context
    } catch (error) {
      alert('Login failed. Please verify your Student ID and PIN.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 bg-slate-900 rounded-lg text-white">
      <h2 className="text-2xl font-bold mb-2">Student Hub Login</h2>
      <p className="text-slate-400 mb-6 text-center text-sm">
        Enter your assigned Student ID and PIN to access your profile on this shared device.
      </p>

      <form onSubmit={handleLogin} className="w-full max-w-sm flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Student ID</label>
          <input 
            type="text" 
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. STU-2026-101"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">PIN</label>
          <input 
            type="password" 
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="****"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            required
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium transition-colors disabled:opacity-50"
        >
          {loading ? 'Verifying...' : 'Access My Profile'}
        </button>
      </form>
    </div>
  );
}
