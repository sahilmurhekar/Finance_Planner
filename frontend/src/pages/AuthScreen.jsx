//frontend/src/pages/AuthScreen.jsx
import { useState } from "react";
import api from "../lib/axios";
import { useNavigate } from "react-router-dom";

const AuthScreen = () => {
    const [pin, setPin] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!pin || pin.length !== 6) {
            setError("PIN must be 6 digits");
            return;
        }

        setLoading(true);

        try {
            const res = await api.post("/auth/validate-pin", { pin });
            localStorage.setItem("token", res.data.token);
            setPin("");
            navigate("/dashboard");
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Login failed";
            setError(errorMsg);
            setPin("");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen flex justify-center items-center bg-gray-900">
            <form onSubmit={handleSubmit} className="p-8 bg-gray-800 rounded-lg shadow-lg w-full max-w-sm">
                <h1 className="text-2xl font-bold text-white mb-6 text-center">
                    Authentication
                </h1>

                <input
                    type="password"
                    inputMode="numeric"
                    maxLength="6"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                    disabled={loading}
                    className="p-3 w-full mb-4 rounded border border-gray-600 bg-gray-700 text-white text-center text-2xl tracking-widest placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    placeholder="••••••"
                />

                {error && (
                    <p className="text-red-400 text-sm mb-4 text-center">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading || pin.length !== 6}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 text-white w-full rounded font-medium transition"
                >
                    {loading ? "Signing in..." : "Sign In"}
                </button>
            </form>
        </div>
    );
};

export default AuthScreen;