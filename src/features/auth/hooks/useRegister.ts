import { useCallback, useState } from 'react';
import { SyncService } from '../../../services/SyncService';
import { markOnboardingSeen } from '../logic/onboardingStorage';
import { validateRegister } from '../logic/validateRegister';
import { mapAuthError } from '../logic/mapAuthError';
import { registerCopy, authCopy } from '../logic/authCopy';

export function useRegister(onAuthenticated: () => void) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);

  const submit = useCallback(async () => {
    setError(null);
    setOffline(false);
    const validation = validateRegister(name, email, password);
    if (validation === 'empty') {
      setError(authCopy.emptyRegister);
      return;
    }
    if (validation === 'short') {
      setError(authCopy.passwordTooShort);
      return;
    }
    if (validation === 'long') {
      setError(authCopy.passwordTooLong);
      return;
    }
    setLoading(true);
    try {
      await SyncService.migrate(name.trim(), email.trim(), password);
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
  }, [name, email, password, onAuthenticated]);

  return {
    name,
    setName,
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
    copy: registerCopy,
  };
}
