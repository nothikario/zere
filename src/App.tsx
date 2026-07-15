import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { Auth } from './components/Auth';
import { Discover } from './components/Discover';
import { Gallery } from './components/Gallery';
import { Header, Page } from './components/Header';
import { Home } from './components/Home';
import { ProfileSetup } from './components/ProfileSetup';
import { ProfileSettings } from './components/ProfileSettings';
import { ReferenceForm } from './components/ReferenceForm';
import { ArtReference, loadReferences } from './lib/references';
import { loadMyProfile, Profile } from './lib/profiles';
import { supabase } from './lib/supabase';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileChecked, setProfileChecked] = useState(false);
  const [page, setPage] = useState<Page>('home');
  const [references, setReferences] = useState<ArtReference[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); }); const { data } = supabase.auth.onAuthStateChange((_event, next) => { setSession(next); if (!next) setProfile(null); }); return () => data.subscription.unsubscribe(); }, []);
  useEffect(() => { if (!session) return; setProfileChecked(false); Promise.all([loadMyProfile(session.user.id), loadReferences()]).then(([found, items]) => { setProfile(found); setReferences(items); setProfileChecked(true); }).catch(() => setProfileChecked(true)); }, [session]);
  if (loading || (session && !profileChecked)) return <div className="splash">Refri<span>.</span></div>;
  if (!session) return <div className="auth-shell"><div className="auth-intro"><div className="brand-static">Refri<span>.</span></div><h1>Твои идеи.<br/><em>Твои персонажи.</em></h1><p>Собирай референсы, создавай визуалы и находи других художников.</p></div><Auth /></div>;
  if (!profile) return <ProfileSetup userId={session.user.id} onReady={setProfile}/>;
  const navigate = (next: Page) => setPage(next);
  return <><Header page={page} username={profile.username} onNavigate={navigate} onSignOut={() => supabase.auth.signOut()}/>{page === 'home' && <Home profile={profile} onCreate={() => navigate('create')} onGallery={() => navigate('gallery')} onDiscover={() => navigate('discover')}/>} {page === 'create' && <ReferenceForm onCreated={async () => { setReferences(await loadReferences()); navigate('gallery'); }}/>} {page === 'gallery' && <Gallery references={references} setReferences={setReferences} onCreate={() => navigate('create')}/>} {page === 'discover' && <Discover/>} {page === 'profile' && <ProfileSettings profile={profile} onUpdated={setProfile}/>}</>;
}
