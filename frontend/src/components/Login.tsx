import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { User } from '../types';

interface LoginProps {
    onLogin: (user: User) => void;
}

declare global {
    interface Window {
        google: any;
        handleGoogleCredentialResponse: (response: any) => void;
    }
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Define callback function
        const handleCredentialResponse = async (response: any) => {
            console.log("Google Credential Response:", response);
            setLoading(true);
            setError('');
            try {
                const result = await api.googleLogin(response.credential);
                if (result.success && result.user) {
                    onLogin(result.user);
                } else {
                    setError(result.message || 'Google 登入失敗');
                }
            } catch (err) {
                setError('Google 登入發生錯誤');
            } finally {
                setLoading(false);
            }
        };

        // Initialize Google Sign-In
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        if (window.google && clientId) {
            window.google.accounts.id.initialize({
                client_id: clientId,
                callback: handleCredentialResponse
            });
            window.google.accounts.id.renderButton(
                document.getElementById("googleSignInDiv"),
                { theme: "outline", size: "large", width: "100%", text: "sign_in_with", locale: "zh_TW" }
            );
        }
    }, [onLogin]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.authenticateUser(identifier, password);
            if (response.success && response.user) {
                onLogin(response.user);
            } else {
                setError(response.message || '登入失敗');
            }
        } catch (err) {
            setError('發生錯誤，請稍後再試');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-md w-96 border border-gray-200">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 font-sans">工程日誌系統登入</h2>
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                {/* Google Login Section */}
                <div className="mb-6">
                    <div id="googleSignInDiv" className="w-full h-10 flex justify-center"></div>
                    {!import.meta.env.VITE_GOOGLE_CLIENT_ID && (
                        <p className="text-xs text-center text-gray-500 mt-2">
                            (需設定 VITE_GOOGLE_CLIENT_ID 以啟用 Google 登入)
                        </p>
                    )}
                </div>

                <div className="relative flex py-5 items-center">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">或使用帳號密碼</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="identifier">
                            帳號或 Email
                        </label>
                        <input
                            id="identifier"
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            密碼
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200 ease-in-out transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? '登入中...' : '登入'}
                    </button>
                </form>
            </div>
        </div>
    );
};
