import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; 
import { Mail, AlertCircle, ChevronLeft, ShieldCheck, KeyRound, CheckCircle2, X, Timer } from 'lucide-react';
import sidePhoto from '../assets/mekdelaambauniversity.jpg';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [forgotStep, setForgotStep] = useState(1); 
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes = 180 seconds

  useEffect(() => {
    let interval;
    if (forgotStep === 2 && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && forgotStep === 2) {
      setForgotError('የቬሪፊኬሽን ኮዱ ጊዜ አልፎበታል። እባክዎ እንደገና ይሞክሩ።');
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [forgotStep, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleRequestOTP = async (e) => {
    if (e) e.preventDefault();
    // 🚀 እገዳው ተነስቷል፡ ተጠቃሚው በፈለገው ሰዓት ድጋሚ ኮድ መጠየቅ ይችላል
    setForgotError('');
    try {
      await api.post(`/Auth/forgot-password?email=${forgotEmail}`);
      setForgotStep(2);
      setTimeLeft(180); // ታይመሩን ወደ 3 ደቂቃ ይመልሰዋል
    } catch (err) { 
      setForgotError('ይህ ኢሜይል አልተገኘም!'); 
    }
  };

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    if (timeLeft === 0) return setForgotError('የጊዜ ገደቡ አልፏል!');
    if (otpCode.length === 6) { setForgotStep(3); setForgotError(''); } 
    else { setForgotError('እባክዎ ባለ 6 አሃዝ ኮድ ያስገቡ!'); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotError('');
    if (newPassword !== confirmPassword) return setForgotError('ፓስዎርዶቹ አይመሳሰሉም!');
    try {
      const resetData = { email: forgotEmail, code: otpCode, newPassword: newPassword };
      await api.post(`/Auth/reset-password`, resetData);
      setSuccessMsg('ፓስዎርድዎ ተቀይሯል! አሁን መግባት ይችላሉ።');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) { setForgotError(err.response?.data?.message || 'ስህተት ተፈጥሯል!'); }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans italic font-bold overflow-hidden leading-none">
      <div className="hidden lg:block lg:w-1/2 relative h-screen">
        <img src={sidePhoto} className="absolute inset-0 w-full h-full object-cover" alt="MAU" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        <div className="absolute bottom-16 left-12 text-white z-10 leading-none">
          <h1 className="text-6xl font-black italic">Mekdela Amba <br/> <span className="text-ma-gold">University</span></h1>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50 relative">
        <div className="bg-white w-full max-w-md rounded-[50px] shadow-[0_25px_70px_rgba(0,32,78,0.15)] p-12 z-10 border-t-[14px] border-ma-gold animate-in zoom-in duration-500">
          {successMsg ? (
            <div className="flex flex-col items-center py-10 space-y-6 text-center leading-none">
              <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center shadow-inner"><CheckCircle2 size={60} /></div>
              <h3 className="text-2xl font-black text-ma-blue uppercase italic">{successMsg}</h3>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center mb-8 leading-none">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-ma-gold mb-4 shadow-inner">
                  {forgotStep === 1 ? <Mail size={32} /> : forgotStep === 2 ? <ShieldCheck size={32} /> : <KeyRound size={32} />}
                </div>
                <h3 className="text-2xl font-black text-ma-blue uppercase italic tracking-tighter">
                  {forgotStep === 1 ? 'Reset Access' : forgotStep === 2 ? 'Verify Identity' : 'Change Key'}
                </h3>
              </div>

              {forgotError && <div className="bg-red-50 text-red-500 p-4 rounded-2xl mb-6 text-[10px] font-black border border-red-100 flex items-center gap-2 uppercase italic leading-none"><AlertCircle size={14} /> {forgotError}</div>}

              {forgotStep === 1 && (
                <form onSubmit={handleRequestOTP} className="space-y-6"><input type="email" required value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} className="w-full px-8 py-5 bg-gray-50 border-none rounded-3xl font-bold text-ma-blue italic shadow-inner outline-none" placeholder="name@gmail.com" /><button type="submit" className="w-full bg-ma-blue text-white py-5 rounded-[25px] font-black text-lg hover:bg-black transition-all shadow-xl tracking-widest uppercase italic">Send Code</button></form>
              )}

              {forgotStep === 2 && (
                <form onSubmit={handleVerifyOTP} className="space-y-6">
                  <div className="flex justify-between items-center px-4">
                    <label className="text-[9px] font-black text-gray-400 uppercase">6-Digit Code</label>
                    <span className={`text-[10px] font-black flex items-center gap-1 ${timeLeft < 30 ? 'text-red-500 animate-pulse' : 'text-ma-gold'}`}><Timer size={12}/> {formatTime(timeLeft)}</span>
                  </div>
                  <input type="text" maxLength="6" required value={otpCode} onChange={(e) => setOtpCode(e.target.value)} className="w-full px-8 py-4 bg-gray-50 border-none rounded-3xl text-center tracking-[10px] font-black text-2xl text-ma-blue shadow-inner outline-none" placeholder="000000" />
                  <button type="submit" className="w-full bg-ma-blue text-white py-5 rounded-[25px] font-black text-lg hover:bg-black transition-all shadow-xl uppercase italic">Verify Code</button>
                  
                  {/* 🚀 አዲስ፡ በደረጃ 2 ላይም ሆኖ ኮድ ደጋግሞ እንዲጠይቅ የሚያስችል በተን */}
                  <div className="text-center mt-2">
                    <button type="button" onClick={handleRequestOTP} className="text-[9px] text-ma-gold hover:text-ma-blue uppercase tracking-widest">Resend Code</button>
                  </div>
                </form>
              )}

              {forgotStep === 3 && (
                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div className="space-y-2"><label className="text-[9px] font-black text-gray-400 uppercase ml-4">New Key</label><input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-8 py-4 bg-gray-50 border-none rounded-3xl font-bold text-ma-blue italic shadow-inner outline-none" placeholder="••••••••" /></div>
                  <div className="space-y-2"><label className="text-[9px] font-black text-gray-400 uppercase ml-4">Confirm New Key</label><input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-8 py-4 bg-gray-50 border-none rounded-3xl font-bold text-ma-blue italic shadow-inner outline-none" placeholder="••••••••" /></div>
                  <button type="submit" className="w-full bg-[#00204E] text-ma-gold py-5 rounded-[25px] font-black text-lg hover:bg-black transition-all shadow-xl tracking-widest uppercase italic mt-4">Confirm Reset</button>
                </form>
              )}
              <button onClick={() => navigate('/login')} className="w-full mt-6 text-gray-400 hover:text-ma-gold text-[10px] font-black uppercase tracking-widest italic">Back to Login</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
export default ForgotPassword;