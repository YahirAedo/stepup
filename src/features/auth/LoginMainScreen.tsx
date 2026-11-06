import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';
import { useLogin } from './hooks/useLogin';
import LoginView from './views/LoginView';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginMainScreen({ navigation }: Props) {
  const onAuthenticated = () => {
    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  };
  const onGuest = () => {
    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  };

  const login = useLogin(onAuthenticated, onGuest);

  return (
    <LoginView
      copy={login.copy}
      email={login.email}
      onEmailChange={login.setEmail}
      password={login.password}
      onPasswordChange={login.setPassword}
      showPassword={login.showPassword}
      onTogglePassword={() => login.setShowPassword((v) => !v)}
      loading={login.loading}
      error={login.error}
      offline={login.offline}
      offlineTitle={login.copy.offline.title}
      offlineBody={login.copy.offline.body}
      onSubmit={login.submit}
      onGuest={login.guest}
      onRegister={() => navigation.navigate('Register')}
    />
  );
}
