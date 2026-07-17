import { Profile } from '../lib/profiles';
import { useLanguage } from '../lib/language';
import { AccountSecurity } from './AccountSecurity';
import { ProfileAppearance } from './ProfileAppearance';

export function ProfileSettings({ profile, onUpdated }: { profile: Profile; onUpdated: (profile: Profile) => void }) {
  const en = useLanguage().language === 'en';
  return <main className="page settings-page"><div className="eyebrow">{en ? 'YOUR PROFILE' : 'ТВОЙ ПРОФИЛЬ'}</div><h1>{en ? <>Account <em>settings</em></> : <>Настройки <em>аккаунта</em></>}</h1><ProfileAppearance profile={profile} onUpdated={onUpdated}/><AccountSecurity/></main>;
}
