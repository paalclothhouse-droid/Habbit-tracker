
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { 
  performGoogleHandshake, 
  performStandardLogin, 
  performAppleHandshake,
  performGitHubHandshake,
  performPhoneLogin,
  sendPhoneOtp,
  requestPasswordReset
} from '../services/mockAuthService';

interface AuthScreenProps {
  onAuthenticated: (user: UserProfile) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated }) => {
  const [view, setView] = useState<'auth' | 'forgot-password'>('auth');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  // Handshake State
  const [handshakeStep, setHandshakeStep] = useState<string>('');
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const simulateHandshake = async (steps: string[]) => {
    for (const step of steps) {
      setHandshakeStep(step);
      await new Promise(r => setTimeout(r, 800));
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    await simulateHandshake(['Establishing Secure Link...', 'Verifying Cryptographic Tokens...', 'Synchronizing User Protocol...']);
    try {
      const user = await performGoogleHandshake();
      setHandshakeStep('Access Granted.');
      await new Promise(r => setTimeout(r, 500));
      onAuthenticated(user);
    } catch (e) {
      setHandshakeStep('Handshake Failed.');
      setIsLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setIsLoading(true);
    await simulateHandshake(['Contacting Secure Enclave...', 'Biometric Verification...', 'Decryption in Progress...']);
    try {
      const user = await performAppleHandshake();
      setHandshakeStep('Identity Confirmed.');
      await new Promise(r => setTimeout(r, 500));
      onAuthenticated(user);
    } catch (e) {
      setHandshakeStep('Handshake Failed.');
      setIsLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    setIsLoading(true);
    await simulateHandshake(['Contacting GitHub Hub...', 'Verifying SSH Keys...', 'Pulling User Profile...']);
    try {
      const user = await performGitHubHandshake();
      setHandshakeStep('Repository Access Granted.');
      await new Promise(r => setTimeout(r, 500));
      onAuthenticated(user);
    } catch (e) {
      setHandshakeStep('Handshake Failed.');
      setIsLoading(false);
    }
  };

  const handleStandardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    setHandshakeStep('Verifying Credentials...');
    try {
      const user = await performStandardLogin(email);
      onAuthenticated(user);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;

    if (!otpSent) {
      setIsLoading(true);
      setHandshakeStep('Targeting Mobile Device...');
      try {
        await sendPhoneOtp(phoneNumber);
        setOtpSent(true);
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
      }
    } else {
      if (!otp) return;
      setIsLoading(true);
      setHandshakeStep('Verifying One-Time Code...');
      try {
        const user = await performPhoneLogin(phoneNumber, otp);
        setHandshakeStep('Uplink Established.');
        await new Promise(r => setTimeout(r, 500));
        onAuthenticated(user);
      } catch (err) {
        setHandshakeStep('Invalid Code.');
        setIsLoading(false);
      }
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    setHandshakeStep('Locating Encrypted Record...');
    try {
      await requestPasswordReset(email);
      setResetSent(true);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
    }
  };

  const renderLoadingState = () => (
    <div className="h-[400px] flex flex-col items-center justify-center space-y-6">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <i className="fa-solid fa-satellite-dish text-xl text-white"></i>
        </div>
      </div>
      <div className="text-center space-y-2">
        <p className="text-indigo-400 font-black text-xs uppercase tracking-widest animate-pulse">
          {handshakeStep}
        </p>
        <div className="h-1 w-32 bg-slate-800 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-indigo-500 animate-progress"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#05070a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.3)] mb-4 ring-1 ring-white/20">
            <i className="fa-solid fa-cube text-2xl text-white"></i>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tighter uppercase">HabitQuest AI</h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em]">
            {view === 'forgot-password' ? 'Credentials Recovery' : 'System Access Portal'}
          </p>
        </div>

        <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group min-h-[500px]">
          <div className="absolute inset-0 rounded-[2.5rem] border border-white/5 pointer-events-none"></div>
          
          {isLoading ? renderLoadingState() : (
            <>
              {view === 'auth' ? (
                <>
                  {/* Access / Join Switch */}
                  <div className="flex p-1 bg-black/40 rounded-xl mb-6 border border-white/5">
                    <button
                      onClick={() => setIsLogin(true)}
                      className={`flex-1 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${isLogin ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      Access
                    </button>
                    <button
                      onClick={() => setIsLogin(false)}
                      className={`flex-1 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${!isLogin ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      Join
                    </button>
                  </div>

                  {/* Method Switch: Email / Phone */}
                  <div className="flex justify-center mb-6 space-x-6">
                    <button 
                      onClick={() => setAuthMethod('email')}
                      className={`pb-2 text-[10px] font-bold uppercase tracking-widest transition-colors border-b-2 ${authMethod === 'email' ? 'text-white border-indigo-500' : 'text-slate-600 border-transparent hover:text-slate-400'}`}
                    >
                      Email Identity
                    </button>
                    <button 
                      onClick={() => setAuthMethod('phone')}
                      className={`pb-2 text-[10px] font-bold uppercase tracking-widest transition-colors border-b-2 ${authMethod === 'phone' ? 'text-white border-indigo-500' : 'text-slate-600 border-transparent hover:text-slate-400'}`}
                    >
                      Mobile
                    </button>
                  </div>

                  {authMethod === 'email' ? (
                    <form onSubmit={handleStandardSubmit} className="space-y-5 animate-[fadeIn_0.3s_ease-out]">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Identity</label>
                        <div className="relative group">
                          <i className="fa-solid fa-envelope absolute left-4 top-4 text-slate-600 group-focus-within:text-indigo-500 transition-colors"></i>
                          <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="operative@habitquest.ai"
                            className="w-full bg-black/40 border border-slate-800 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                          {isLogin && (
                            <button 
                              type="button" 
                              onClick={() => { setView('forgot-password'); setResetSent(false); }}
                              className="text-[9px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-widest"
                            >
                              Forgot Password?
                            </button>
                          )}
                        </div>
                        <div className="relative group">
                          <i className="fa-solid fa-key absolute left-4 top-4 text-slate-600 group-focus-within:text-indigo-500 transition-colors"></i>
                          <input 
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="••••••••••••"
                            className="w-full bg-black/40 border border-slate-800 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <button 
                        type="submit"
                        className="w-full bg-white text-black py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-[0.98]"
                      >
                        {isLogin ? 'Initiate Protocol' : 'Create Identity'}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handlePhoneSubmit} className="space-y-5 animate-[fadeIn_0.3s_ease-out]">
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                         <div className="relative group">
                            <i className="fa-solid fa-mobile-screen absolute left-4 top-4 text-slate-600 group-focus-within:text-indigo-500 transition-colors"></i>
                            <input 
                              type="tel"
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              placeholder="+1 555-0199"
                              disabled={otpSent}
                              className="w-full bg-black/40 border border-slate-800 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all disabled:opacity-50"
                            />
                         </div>
                      </div>

                      {otpSent && (
                        <div className="space-y-2 animate-[slideDown_0.3s_ease-out]">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Access Code</label>
                            <button 
                              type="button" 
                              onClick={() => setOtpSent(false)} 
                              className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest"
                            >
                              Resend Signal
                            </button>
                          </div>
                          <div className="relative group">
                             <i className="fa-solid fa-shield-halved absolute left-4 top-4 text-slate-600 group-focus-within:text-indigo-500 transition-colors"></i>
                             <input 
                               type="text"
                               value={otp}
                               onChange={(e) => setOtp(e.target.value)}
                               placeholder="X-X-X-X-X-X"
                               className="w-full bg-black/40 border border-slate-800 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all tracking-[0.2em]"
                             />
                          </div>
                        </div>
                      )}

                      <button 
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] active:scale-[0.98]"
                      >
                        {otpSent ? 'Verify & Connect' : 'Request OTP'}
                      </button>
                    </form>
                  )}

                  <div className="my-8 flex items-center justify-between">
                    <div className="h-px bg-slate-800 flex-1"></div>
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-4">Social Uplink</span>
                    <div className="h-px bg-slate-800 flex-1"></div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      className="bg-[#181a20] hover:bg-[#202229] border border-slate-700 hover:border-slate-600 text-white py-3 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all active:scale-[0.98] group"
                    >
                      <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span className="text-xs">Google</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleAppleLogin}
                      className="bg-white hover:bg-slate-200 text-black border border-slate-300 py-3 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all active:scale-[0.98] group"
                    >
                      <i className="fa-brands fa-apple text-lg group-hover:scale-110 transition-transform"></i>
                      <span className="text-xs">Apple</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleGitHubLogin}
                      className="bg-[#24292e] hover:bg-[#2f363d] border border-slate-700 text-white py-3 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all active:scale-[0.98] group"
                    >
                      <i className="fa-brands fa-github text-lg group-hover:scale-110 transition-transform"></i>
                      <span className="text-xs">GitHub</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="animate-[fadeIn_0.3s_ease-out]">
                  {resetSent ? (
                     <div className="text-center py-8 space-y-6">
                        <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/50">
                           <i className="fa-solid fa-check text-2xl"></i>
                        </div>
                        <div>
                          <h3 className="text-white font-black uppercase tracking-widest mb-2">Signal Transmitted</h3>
                          <p className="text-xs text-slate-400 leading-relaxed px-4">
                            Encryption recovery protocols have been sent to your comms channel. Check your inbox to re-establish access.
                          </p>
                        </div>
                        <button 
                          onClick={() => setView('auth')}
                          className="text-indigo-400 text-xs font-bold uppercase tracking-widest hover:text-indigo-300"
                        >
                          Return to Portal
                        </button>
                     </div>
                  ) : (
                    <form onSubmit={handleForgotPassword} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email linked to account</label>
                        <div className="relative group">
                          <i className="fa-solid fa-user-shield absolute left-4 top-4 text-slate-600 group-focus-within:text-indigo-500 transition-colors"></i>
                          <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="user@habitquest.ai"
                            className="w-full bg-black/40 border border-slate-800 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all"
                          />
                        </div>
                        <p className="text-[10px] text-slate-600 px-1">
                          We will transmit a secure recovery token to this address.
                        </p>
                      </div>

                      <button 
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] active:scale-[0.98]"
                      >
                        Send Password Reset Link
                      </button>

                      <div className="text-center">
                        <button 
                          type="button"
                          onClick={() => setView('auth')}
                          className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
                        >
                          <i className="fa-solid fa-arrow-left mr-2"></i>
                          Abort Sequence
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
