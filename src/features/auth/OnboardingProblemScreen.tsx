import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';
import OnboardingProblemView from './views/OnboardingProblemView';
import { onboardingCopy } from './logic/authCopy';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding1'>;

export default function OnboardingProblemScreen({ navigation }: Props) {
  return (
    <OnboardingProblemView
      copy={onboardingCopy.problem}
      onPrimary={() => navigation.navigate('Onboarding2')}
    />
  );
}
