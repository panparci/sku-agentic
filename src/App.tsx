/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect, useState } from "react";
import { ProcurementProvider } from "./context/ProcurementContext";
import { DocsPage } from "./components/docs/DocsPage";
import { Footer } from "./components/layout/Footer";
import { Header } from "./components/layout/Header";
import { Sidebar } from "./components/layout/Sidebar";
import type { ActiveTab } from "./components/layout/Navigation";
import { PrPage } from "./components/pr/PrPage";
import { SkuPage } from "./components/sku/SkuPage";
import { VendorPage } from "./components/vendor/VendorPage";
import { authApi } from "./services/api";

const TAB_STORAGE_KEY = "cgp_active_tab";
const TOKEN_KEY = "cgp_token";

function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export default function App() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState("admin@rs-medika.com");
  const [loginPassword, setLoginPassword] = useState("admin123");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (token) setIsLoggedIn(true);
    setCheckingAuth(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoggingIn(true);
    try {
      const data = await authApi.login(loginEmail, loginPassword);
      setToken(data.access_token);
      setIsLoggedIn(true);
    } catch (err: unknown) {
      setLoginError((err as Error).message || "Login gagal");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    clearToken();
    setIsLoggedIn(false);
    setLoginPassword("");
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-slate-500">Memuat...</div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-teal-600 text-white p-3 rounded-xl inline-block mb-4">
              <span className="text-2xl">🏥</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">RS Medika Utama</h1>
            <p className="text-sm text-slate-500">Sistem Procurement — Login</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">
                {loginError}
              </div>
            )}
            <button
              type="submit"
              disabled={loggingIn}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors"
            >
              {loggingIn ? "Masuk..." : "Login"}
            </button>
          </form>
          <p className="text-xs text-slate-400 text-center mt-4">
            Default: admin@rs-medika.com / admin123
          </p>
        </div>
      </div>
    );
  }

  return (
    <ProcurementProvider>
      <ProcurementShell onLogout={handleLogout} />
    </ProcurementProvider>
  );
}

function ProcurementShell({ onLogout }: { onLogout: () => void }) {
  const savedTab = (typeof window !== "undefined" ? localStorage.getItem(TAB_STORAGE_KEY) : null) as ActiveTab | null;
  const [activeTab, setActiveTab] = useState<ActiveTab>(savedTab || "skus");

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    localStorage.setItem(TAB_STORAGE_KEY, tab);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      <Header onLogout={onLogout} />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Sidebar activeTab={activeTab} onChangeTab={handleTabChange} />
        <section className="lg:col-span-3 flex flex-col gap-6">
          {activeTab === "skus" && <SkuPage />}
          {activeTab === "prs" && <PrPage />}
          {activeTab === "vendors" && <VendorPage />}
          {activeTab === "docs" && <DocsPage />}
        </section>
      </main>
      <Footer />
    </div>
  );
}
