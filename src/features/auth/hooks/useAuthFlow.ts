import { useEffect, useState } from 'react';
import { SERVED_PINCODES } from '../data/serviceArea';
import { AuthError, authService } from '../services/authService';

export type AuthStep = 'welcome' | 'phone' | 'otp' | 'profile' | 'done';

const RESEND_SECONDS = 30;
const STEP_ORDER: AuthStep[] = ['welcome', 'phone', 'otp', 'profile', 'done'];

export const useAuthFlow = () => {
  const [step, setStep] = useState<AuthStep>('welcome');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [name, setName] = useState('');
  const [pincode, setPincode] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [showReferral, setShowReferral] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn(resendIn - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  const phoneValid = phone.length === 10;
  const profileValid = name.trim().length > 0 && pincode.length === 6;
  const pincodeInfo =
    pincode.length === 6 ? SERVED_PINCODES[pincode] : undefined;
  const stepNumber =
    { phone: 1, otp: 2, profile: 3 }[step as 'phone' | 'otp' | 'profile'] ?? 0;

  const goBack = () => {
    setOtpError(null);
    setSubmitError(null);
    setOtp('');
    setStep(prev => {
      const map: Partial<Record<AuthStep, AuthStep>> = {
        phone: 'welcome',
        otp: 'phone',
        profile: 'phone',
      };
      return map[prev] ?? prev;
    });
  };

  const sendCode = async () => {
    if (!phoneValid || busy) return;
    setBusy(true);
    try {
      await authService.sendOtp(phone);
      setOtp('');
      setOtpError(null);
      setResendIn(RESEND_SECONDS);
      setStep('otp');
    } finally {
      setBusy(false);
    }
  };

  const resendCode = async () => {
    if (resendIn > 0 || busy) return;
    await sendCode();
  };

  const submitOtp = async (code: string) => {
    setOtp(code);
    setOtpError(null);
    if (code.length !== 6 || busy) return;
    setBusy(true);
    try {
      await authService.verifyOtp(phone, code);
      setStep('profile');
    } catch (error) {
      setOtpError(
        error instanceof AuthError
          ? error.message
          : 'Something went wrong. Try again.',
      );
    } finally {
      setBusy(false);
    }
  };

  const finishProfile = async () => {
    if (!profileValid || busy) return;
    setBusy(true);
    setSubmitError(null);
    try {
      await authService.completeProfile({
        name: name.trim(),
        pincode,
        referralCode: referralCode || undefined,
      });
      setStep('done');
    } catch {
      setSubmitError(
        'Could not save your details. Check your connection and try again.',
      );
    } finally {
      setBusy(false);
    }
  };

  return {
    step,
    stepNumber,
    stepIndex: STEP_ORDER.indexOf(step),
    goBack,
    busy,
    phone,
    setPhone: (value: string) =>
      setPhone(value.replace(/\D/g, '').slice(0, 10)),
    phoneValid,
    sendCode,
    otp,
    otpError,
    submitOtp,
    resendIn,
    resendCode,
    name,
    setName,
    pincode,
    setPincode: (value: string) =>
      setPincode(value.replace(/\D/g, '').slice(0, 6)),
    pincodeInfo,
    referralCode,
    setReferralCode: (value: string) =>
      setReferralCode(value.toUpperCase().replace(/\s/g, '').slice(0, 12)),
    showReferral,
    openReferral: () => setShowReferral(true),
    profileValid,
    finishProfile,
    submitError,
    setStep,
  };
};
