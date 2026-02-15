import React, { useState, useRef, useEffect } from 'react';
import api from "../lib/axios";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const AuthScreen = () => {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showCode, setShowCode] = useState(false);
    const inputRefs = useRef([]);
    const navigate = useNavigate();

    // Handle individual digit input
    const handleInput = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value.slice(-1);
        setCode(newCode);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    // Handle backspace / arrow navigation
    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === 'ArrowRight' && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    // Handle paste
    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
        const newCode = pastedData.slice(0, 6).split('');

        while (newCode.length < 6) newCode.push('');

        setCode(newCode);

        if (pastedData.length >= 6) {
            inputRefs.current[5]?.focus();
        }
    };

    // Submit handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        const fullCode = code.join('');

        if (fullCode.length !== 6) {
            setError('Please enter all 6 digits');
            return;
        }

        setIsSubmitting(true);
        setError(''); // clear previous error only on new attempt

        try {
            const res = await api.post("/auth/validate-pin", { pin: fullCode });
            localStorage.setItem("token", res.data.token);
            setSuccess(true);

            setTimeout(() => {
                navigate("/dashboard");
            }, 1000);
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Invalid PIN. Please try again.";
            setError(errorMsg);
            // Do not clear code on error to allow user to edit; focus on first input only if needed
            inputRefs.current[0]?.focus();
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFilled = code.every(digit => digit !== '');

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background blobs ... (kept unchanged) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-40 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
                <div className="absolute -top-40 left-1/2 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-8 animate-blob animation-delay-4000"></div>
            </div>

            <div className="w-full max-w-md z-10">
                {/* Header – unchanged */}
                <div className="text-center mb-12 animate-fade-in">
                    <div className="mb-8 relative">
                        <div className="inline-block">
                            <div className="text-6xl font-light tracking-tighter text-gray-900 mb-2">
                                Finance<span className="pl-2 font-bold">Planner</span>
                            </div>
                            <div className="h-1 w-16 bg-gradient-to-r from-blue-600 to-blue-500 mx-auto mt-4"></div>
                        </div>
                    </div>
                    <p className="text-gray-600 text-sm font-light tracking-wide mt-6">Enter your security code to continue</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Code inputs */}
                    <div>
                        <div className="flex justify-center gap-3 md:gap-4 mb-4">
                            {code.map((digit, index) => (
                                <div key={index} className="relative animate-scale-in" style={{ animationDelay: `${index * 50}ms` }}>
                                    <input
                                        ref={(el) => (inputRefs.current[index] = el)}
                                        type={showCode ? "text" : "password"}
                                        inputMode="numeric"
                                        value={digit}
                                        onChange={(e) => handleInput(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        onPaste={handlePaste}
                                        maxLength={1}
                                        disabled={isSubmitting || success}
                                        className={`
                      w-12 h-16 md:w-14 md:h-20 text-2xl md:text-3xl font-light
                      text-center text-gray-900 rounded-lg border-2 transition-all duration-300
                      ${success ? 'border-green-500 bg-green-50'
                                                : error ? 'border-red-500 bg-red-50'
                                                    : digit ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 bg-gray-100 bg-opacity-40'}
                      focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-white
                      disabled:opacity-60 disabled:cursor-not-allowed
                      backdrop-blur-sm hover:border-gray-300
                    `}
                                        placeholder="-"
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Show / Hide toggle */}
                        <div className="flex justify-center">
                            <button
                                type="button"
                                onClick={() => setShowCode(!showCode)}
                                className="text-sm mt-6 text-gray-600 hover:text-gray-900 font-light transition-colors flex items-center gap-2"
                            >
                                {showCode ? <EyeOff /> : <Eye />} {showCode ? 'Hide' : 'Show'} code
                            </button>
                        </div>
                    </div>

                    {/* Error message – persists until manual dismiss or next successful submit */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-shake">
                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <div className="flex-1">
                                    <p className="text-red-800 text-sm font-medium">{error}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setError('')}
                                    className="text-red-600 hover:text-red-800 flex-shrink-0"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Submit button */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={!isFilled || isSubmitting || success}
                            className={`
                w-full py-4 px-6 rounded-lg font-light tracking-wider
                transition-all duration-300
                ${success
                                    ? 'bg-green-600 text-white'
                                    : isFilled && !isSubmitting
                                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:shadow-lg hover:shadow-blue-400/40 hover:scale-[1.02]'
                                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                }
              `}
                        >
                            {isSubmitting ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Verifying...</span>
                                </div>
                            ) : success ? (
                                'Verified ✓'
                            ) : (
                                'Continue'
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Keep your animations / styles – unchanged */}
            <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        input[type='text']::-webkit-outer-spin-button,
        input[type='text']::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(229, 231, 235, 0.5);
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.5);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 114, 128, 0.7);
        }
      `}</style>
        </div>
    );
};

export default AuthScreen;
