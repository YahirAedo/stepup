import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';
import { useRegister } from './hooks/useRegister';
import RegisterView from './views/RegisterView';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export default function RegisterMainScreen({ navigation }: Props) {
  const onAuthenticated = () => {
    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  };

  const register = useRegister(onAuthenticated);

  return (
    <RegisterView
      copy={register.copy}
      name={register.name}
      onNameChange={register.setName}
      email={register.email}
      onEmailChange={register.setEmail}
      password={register.password}
      onPasswordChange={register.setPassword}
      showPassword={register.showPassword}
      onTogglePassword={() => register.setShowPassword((v) => !v)}
      loading={register.loading}
      error={register.error}
      offline={register.offline}
      offlineTitle={register.copy.offline.title}
      offlineBody={register.copy.offline.body}
      onSubmit={register.submit}
      onLogin={() => navigation.navigate('Login')}
    />
  );
}
