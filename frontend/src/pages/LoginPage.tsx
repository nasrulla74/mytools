import { useState } from "react";
import { LogIn, UserPlus, Lock, User, Eye, EyeOff } from "lucide-react";

interface LoginProps {
    onLogin: (token: string) => void;
}

export default function LoginPage({ onLogin }: LoginProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const apiBase = import.meta.env.MODE === "production" ? "" : (import.meta.env.VITE_API_URL || "http://localhost:8000");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            if (isLogin) {
                // Login Flow
                const formData = new FormData();
                formData.append("username", username);
                formData.append("password", password);

                const res = await fetch(`${apiBase}/auth/login`, {
                    method: "POST",
                    body: formData,
                });

                if (res.ok) {
                    const data = await res.json();
                    const apiBase = import.meta.env.MODE === "production" ? "" : (import.meta.env.VITE_API_URL || "http://localhost:8000");
                    const verifyRes = await fetch(`${apiBase}/me`, {
                        headers: { "Authorization": `Bearer ${data.access_token}` }
                    });
                    if (verifyRes.ok) {
                        onLogin(data.access_token);
                    } else {
                        setError("Login succeeded but verification failed. Try again.");
                    }
                } else {
                    const data = await res.json();
                    setError(data.detail || "Invalid credentials");
                }
            } else {
                // Register Flow
                const res = await fetch(`${apiBase}/auth/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password }),
                });

                if (res.ok) {
                    setIsLogin(true);
                    setError("Success! Now log in.");
                } else {
                    const data = await res.json();
                    setError(data.detail || "Registration failed");
                }
            }
        } catch (err) {
            setError("Connection error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-600/10 blur-[100px] rounded-full"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/5 blur-[100px] rounded-full"></div>
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-3 bg-emerald-600/10 rounded-2xl mb-4 border border-emerald-500/20">
                        <Lock className="text-emerald-500" size={32} />
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight mb-2">⚡ PyTool</h1>
                    <p className="text-zinc-500 font-medium">Your universal developer workspace</p>
                </div>

                <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 p-8 rounded-3xl shadow-2xl">
                    <div className="flex bg-zinc-950 p-1 rounded-xl mb-8 border border-zinc-900">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${isLogin ? 'bg-emerald-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <LogIn size={16} /> Login
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${!isLogin ? 'bg-emerald-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <UserPlus size={16} /> Sign Up
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className={`p-4 rounded-xl text-xs font-bold border ${error.includes("Success") ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Username</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-emerald-500/50 transition-all font-medium"
                                    placeholder="Enter username"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-12 pr-12 py-4 text-white outline-none focus:border-emerald-500/50 transition-all font-medium"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-600/20 active:scale-[0.98] transition-all"
                        >
                            {loading ? "Processing..." : (isLogin ? "Welcome Back" : "Create Account")}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
