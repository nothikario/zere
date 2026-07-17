import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { Auth } from './components/Auth';
import { Discover } from './components/Discover';
import { Gallery } from './components/Gallery';
import { Header, Page } from './components/Header';
import { Home } from './components/Home';
import { LanguageSelect } from './components/LanguageSelect';
import { ProfileSetup } from './components/ProfileSetup';
import { ProfileSettings } from './components/ProfileSettings';
import { ReferenceForm } from './components/ReferenceForm';
import { Shop } from './components/Shop';
import { Training } from './components/Training';
import { useLanguage } from './lib/language';
import { loadMyProfile, Profile } from './lib/profiles';
import { ArtReference, loadReferences } from './lib/references';
import { supabase } from './lib/supabase';
import { applyTheme } from './lib/themes';
import { usePageTranslation } from './lib/translatePage';
import { loadGuestReference, Usage, visitAndGetUsage } from './lib/usage';

export default function App() {
  const { language } = useLanguage();
  const [languageChosen, setLanguageChosen] = useState(false); usePageTranslation(languageChosen);
  const [session, setSession] = useState<Session | null>(null); const [profile, setProfile] = useState<Profile | null>(null);
  const [profileChecked, setProfileChecked] = useState(false); const [page, setPage] = useState<Page>('home');
  const [references, setReferences] = useState<ArtReference[]>([]); const [loading, setLoading] = useState(true);
  const [guest, setGuest] = useState(false); const [usage, setUsage] = useState<Usage>();
  const [guestReferences, setGuestReferences] = useState<ArtReference[]>(() => { const item = loadGuestReference(); return item ? [item] : []; });
  useEffect(() => { supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); }); const { data } = supabase.auth.onAuthStateChange((_event, next) => { setSession(next); if (!next) setProfile(null); }); return () => data.subscription.unsubscribe(); }, []);
  useEffect(() => { if (!session) return; setGuest(false); setProfileChecked(false); Promise.all([loadMyProfile(session.user.id), loadReferences(), visitAndGetUsage()]).then(([found, items, currentUsage]) => { setProfile(found); setReferences(items); setUsage(currentUsage); setProfileChecked(true); }).catch(() => setProfileChecked(true)); }, [session]);
  useEffect(() => { applyTheme(profile?.theme_key ?? 'sage'); }, [profile?.theme_key]);
  if (!languageChosen) return <LanguageSelect onContinue={() => setLanguageChosen(true)}/>;
  if (loading || (session && !profileChecked)) return <div className="splash">Refri<span>.</span></div>;
  if (!session && !guest) return <div className="auth-shell"><div className="auth-intro"><div className="brand-static">Refri<span>.</span></div><h1>{language === 'en' ? <>Your ideas.<br/><em>Your characters.</em></> : <>Твои идеи.<br/><em>Твои персонажи.</em></>}</h1><p>{language === 'en' ? 'Collect references, create visuals, and discover other artists.' : 'Собирай референсы, создавай визуалы и находи других художников.'}</p></div><Auth onGuest={() => setGuest(true)}/></div>;
  if (guest) return <GuestApp page={page} setPage={setPage} references={guestReferences} setReferences={setGuestReferences} onExit={() => { setGuest(false); setLanguageChosen(false); setPage('home'); }}/>;
  if (!session) return null;
  if (!profile) return <ProfileSetup userId={session.user.id} onReady={setProfile}/>;
  const refreshUsage = async () => setUsage(await visitAndGetUsage());
  return <><Header page={page} username={profile.username} avatarUrl={profile.avatar_url} onNavigate={setPage} onSignOut={async () => { await supabase.auth.signOut(); setLanguageChosen(false); setPage('home'); }}/>{page === 'home' && <Home profile={profile} usage={usage} onUsageChange={refreshUsage} onCreate={() => setPage('create')} onGallery={() => setPage('gallery')} onDiscover={() => setPage('discover')}/>} {page === 'create' && <ReferenceForm onCreated={async () => { setReferences(await loadReferences()); await refreshUsage(); setPage('gallery'); }}/>} {page === 'gallery' && <Gallery references={references} setReferences={setReferences} onCreate={() => setPage('create')} onReward={refreshUsage}/>} {page === 'training' && <Training/>}{page === 'shop' && usage && <Shop usage={usage} onUpdated={refreshUsage}/>} {page === 'discover' && <Discover/>}{page === 'profile' && <ProfileSettings profile={profile} onUpdated={setProfile}/>}</>;
}

type GuestProps = { page: Page; setPage: (page: Page) => void; references: ArtReference[]; setReferences: React.Dispatch<React.SetStateAction<ArtReference[]>>; onExit: () => void };
function GuestApp({ page, setPage, references, setReferences, onExit }: GuestProps) {
  return <><Header page={page} isGuest onNavigate={setPage} onSignOut={onExit}/>{page === 'create' ? <ReferenceForm isGuest onCreated={(reference) => { if (reference) setReferences([reference]); setPage('gallery'); }}/> : page === 'gallery' ? <Gallery isGuest references={references} setReferences={setReferences} onCreate={() => setPage('create')} onReward={() => undefined}/> : page === 'training' ? <Training/> : <Home onCreate={() => setPage('create')} onGallery={() => setPage('gallery')} onDiscover={() => undefined}/>}</>;
}
