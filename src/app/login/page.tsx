"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await login(email, password);
    
    if (!result.success) {
      setError(result.error || "Login failed");
    }
    
    setIsLoading(false);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ 
        backgroundColor: '#1a1a1a',
        backgroundImage: 'url(/login-bg.jpg)',
        backgroundBlendMode: 'overlay'
      }}
    >
      <div 
        className="p-8 rounded-2xl shadow-2xl w-full max-w-md"
        style={{ backgroundColor: '#292929' }}
      >
        <div className="text-center mb-8">
          <img 
            src="/logo.png" 
            alt="Racegarage Logo" 
            className="max-w-[200px] h-auto mx-auto mb-2"
          />
          <p className="text-slate-300 mt-2">Simulator Management System</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div 
              className="px-4 py-3 rounded-lg text-sm text-white"
              style={{ backgroundColor: '#1a1a1a' }}
            >
              {error}
            </div>
          )}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-white mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none text-white"
              style={{ backgroundColor: '#3a3a3a', border: 'none' }}
              placeholder="Zadajte email"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-white mb-2"
            >
              Heslo
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none text-white"
              style={{ backgroundColor: '#3a3a3a', border: 'none' }}
              placeholder="Zadajte heslo"
              required
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full text-white py-3 px-4 rounded-lg hover:brightness-110 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#c20003' }}
          >
            {isLoading ? "Prihlasovanie..." : "Prihlásiť sa"}
          </button>
        </form>
        <p className="text-center text-sm text-slate-400 mt-6">
          Len pre zamestnancov
        </p>
      </div>
    </div>
  );
}
