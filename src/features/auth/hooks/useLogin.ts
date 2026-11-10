import { useCallback, useState } from 'react';
import { AuthService } from '../../../services/AuthService';
import { markOnboardingSeen } from '../logic/onboardingStorage';
import { validateLogin } from '../logic/validateLogin';
import { mapAuthError } from '../logic/mapAuthError';
import { loginCopy, authCopy } from '../logic/authCopy';

export function useLogin(onAuthenticated: () => void, onGuest: () => void) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);

  const submit = useCallback(async () => {
    setError(null);
    setOffline(false);
    if (validateLogin(email, password) === 'empty') {
      setError(authCopy.emptyLogin);
      return;
    }
    setLoading(true);
    try {
      await AuthService.login(email.trim(), password);
      await markOnboardingSeen();
      onAuthenticated();
    } catch (err) {
      const mapped = mapAuthError(err);
      if (mapped.kind === 'offline') {
        setOffline(true);
      } else {
        setError(mapped.message);
      }
    } finally {
      setLoading(false);
    }
  }, [email, password, onAuthenticated]);

  const guest = useCallback(async () => {
    await markOnboardingSeen();
    onGuest();
  }, [onGuest]);

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    loading,
    error,
    offline,
    submit,
    guest,
    copy: loginCopy,
  };
}
