import React, { useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../../types/navigation';
import { AuthService } from '../../services/AuthService';
import { useProfile } from './hooks/useProfile';
import ProfileView from './views/ProfileView';
import { getAppVersion } from '../../utils/appVersion';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ProfileMain'>;

export default function ProfileMainScreen({ navigation }: Props) {
  const profile = useProfile();
  const [privacyVisible, setPrivacyVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);

  const handleGuestCta = () => {
    navigation.getParent()?.getParent()?.navigate('Register');
  };

  const handleConfirmLogout = async () => {
    setLogoutVisible(false);
    await AuthService.logout();
    navigation.getParent()?.getParent()?.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  return (
    <ProfileView
      view={profile.view}
      metrics={profile.metrics}
      user={profile.user}
      loading={profile.loading}
      error={profile.error}
      syncing={profile.syncing}
      onSync={profile.onSync}
      onRetry={() => void profile.reload()}
      onGuestCta={handleGuestCta}
      onPressConflicts={() => navigation.navigate('SyncConflict')}
      onPressBadges={() => navigation.navigate('Badges')}
      onPressPrivacy={() => setPrivacyVisible(true)}
      onPressLogout={() => setLogoutVisible(true)}
      appVersion={getAppVersion()}
      privacyVisible={privacyVisible}
      logoutVisible={logoutVisible}
      onClosePrivacy={() => setPrivacyVisible(false)}
      onCloseLogout={() => setLogoutVisible(false)}
      onConfirmLogout={handleConfirmLogout}
    />
  );
}
