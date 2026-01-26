import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, LayoutDashboard, Lock, User } from 'lucide-react';

const Login: React.FC = () => {
    const { customLogin } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const userKey = username.toLowerCase().trim();

        try {
            // Direct Database Check (Manually implemented auth as requested)
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('user', userKey)
                .eq('password', password) // Checking plain text password as user stored it this way
                .maybeSingle(); // Use maybeSingle to avoid 406 error if not found immediately

            if (error) {
                throw error;
            }

            if (data) {
                // Valid credentials found in the manual table
                customLogin(data);
            } else {
                throw new Error('Usuario o contraseña incorrectos');
            }

        } catch (err: any) {
            console.error("Login Check Error:", err);
            setError(err.message || 'Error de acceso. Verifica tus credenciales.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="mb-8 flex flex-col items-center">
                <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-white mb-4 shadow-xl">
                    <LayoutDashboard size={32} />
                </div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tighter text-center">Revolución Pineal CRM</h1>
                <p className="text-gray-500 font-medium mt-2">Acceso Restringido</p>
            </div>

            <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl border border-gray-100">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 text-sm font-bold rounded-xl flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500" /> {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Usuario</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-4 text-sm font-bold text-gray-800 outline-none focus:bg-white focus:border-black transition-all placeholder:text-gray-300"
                                placeholder=""
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoCapitalize="none"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="password"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-4 text-sm font-bold text-gray-800 outline-none focus:bg-white focus:border-black transition-all placeholder:text-gray-300"
                                placeholder=""
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : null}
                        {loading ? 'Verificando...' : 'Iniciar Sesión'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
