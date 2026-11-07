import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';
import OnboardingSolutionView from './views/OnboardingSolutionView';
import { onboardingCopy } from './logic/authCopy';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding2'>;

export default function OnboardingSolutionScreen({ navigation }: Props) {
  return (
    <OnboardingSolutionView
      copy={onboardingCopy.solution}
      onPrimary={() => navigation.navigate('Login')}
    />
  );
}
