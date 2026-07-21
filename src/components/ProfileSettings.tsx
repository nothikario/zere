import { Profile } from "../lib/profiles";
import { useLanguage } from "../lib/language";
import { AccountSecurity } from "./AccountSecurity";
import { AccountSwitcher } from "./AccountSwitcher";
import { ProfileAppearance } from "./ProfileAppearance";
import { ProfileLanguage } from "./ProfileLanguage";

type Props = {
  profile: Profile;
  email: string;
  onUpdated: (profile: Profile) => void;
  onChooseAccount: (email?: string) => void;
};

export function ProfileSettings({ profile, email, onUpdated, onChooseAccount }: Props) {
  const en = useLanguage().language === "en";
  return (
    <main className="page settings-page">
      <div className="eyebrow">{en ? "YOUR PROFILE" : "ТВОЙ ПРОФИЛЬ"}</div>
      <h1>
        {en ? (
          <>
            Account <em>settings</em>
          </>
        ) : (
          <>
            Настройки <em>аккаунта</em>
          </>
        )}
      </h1>
      <ProfileAppearance profile={profile} onUpdated={onUpdated} />
      <ProfileLanguage />
      <AccountSwitcher currentEmail={email} onChooseAccount={onChooseAccount} />
      <AccountSecurity />
    </main>
  );
}
