import { HashRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useEffect, type ReactNode } from 'react';
import BottomNav from './components/BottomNav';
import DesktopNav from './components/DesktopNav';
import SiteFooter from './components/SiteFooter';
import { StoreProvider } from './store/store';
import { useStore } from './store/store';
import RequireAuth from './components/RequireAuth';
import RequireAdmin from './components/RequireAdmin';

import Splash from './screens/Splash';
import Home from './screens/Home';
import Search from './screens/Search';
import Categories from './screens/Categories';
import CategoryDetail from './screens/CategoryDetail';
import BookDetails from './screens/BookDetails';
import DonateBook from './screens/DonateBook';
import DonateSuccess from './screens/DonateSuccess';
import RequestBook from './screens/RequestBook';
import RequestSuccess from './screens/RequestSuccess';
import ChatList from './screens/ChatList';
import ChatConversation from './screens/ChatConversation';
import Notifications from './screens/Notifications';
import Profile from './screens/Profile';
import UserProfile from './screens/UserProfile';
import EditProfile from './screens/EditProfile';
import Settings from './screens/Settings';
import MyBooks from './screens/MyBooks';
import MyRequests from './screens/MyRequests';
import ReceivedRequests from './screens/ReceivedRequests';
import Help from './screens/Help';
import About from './screens/About';
import NotFound from './screens/NotFound';
import Auth from './screens/Auth';
import AdminDashboard from './screens/AdminDashboard';
import Communities from './screens/Communities';
import CommunityDetail from './screens/CommunityDetail';
import CreateCommunity from './screens/CreateCommunity';
import CommunityNotes from './screens/CommunityNotes';
import CommunityDiscussion from './screens/CommunityDiscussion';
import CommunityBooks from './screens/CommunityBooks';
import CommunityManage from './screens/CommunityManage';
import CommunityMembers from './screens/CommunityMembers';

const TAB_ROUTES = ['/home', '/search', '/categories', '/chat', '/profile'];

function LiveNotification() {
  const navigate = useNavigate();
  const { liveNotification, clearLiveNotification } = useStore();
  useEffect(() => {
    if (!liveNotification) return;
    const timer = window.setTimeout(clearLiveNotification, 5000);
    return () => window.clearTimeout(timer);
  }, [liveNotification, clearLiveNotification]);
  if (!liveNotification) return null;
  return <button onClick={() => { clearLiveNotification(); navigate(liveNotification.link); }} className="fixed left-4 right-4 top-4 z-[100] mx-auto max-w-[448px] rounded-2xl border border-[var(--color-primary)]/30 bg-[var(--color-surface)] p-4 text-left shadow-2xl"><p className="text-[13.5px] font-semibold text-[var(--color-text)]">{liveNotification.title}</p><p className="mt-1 text-[12.5px] text-[var(--color-text-dim)]">{liveNotification.body}</p></button>;
}

function AppRoutes() {
  const location = useLocation();
  const showNav = TAB_ROUTES.includes(location.pathname);
  const showDesktopChrome = !['/', '/login'].includes(location.pathname);

  const protectedScreen = (screen: ReactNode) => <RequireAuth>{screen}</RequireAuth>;
  return (
    <div className="app-shell">
      {showDesktopChrome && <DesktopNav />}
      <main className={showNav ? 'pb-[96px] lg:pb-0' : ''}>
        <DataErrorBanner />
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Splash />} />
            <Route path="/home" element={protectedScreen(<Home />)} />
            <Route path="/login" element={<Auth />} />
            <Route path="/search" element={protectedScreen(<Search />)} />
            <Route path="/categories" element={protectedScreen(<Categories />)} />
            <Route path="/categories/:id" element={protectedScreen(<CategoryDetail />)} />
            <Route path="/book/:id" element={protectedScreen(<BookDetails />)} />
            <Route path="/donate" element={protectedScreen(<DonateBook />)} />
            <Route path="/donate/success" element={protectedScreen(<DonateSuccess />)} />
            <Route path="/request" element={protectedScreen(<RequestBook />)} />
            <Route path="/request/success" element={protectedScreen(<RequestSuccess />)} />
            <Route path="/chat" element={protectedScreen(<ChatList />)} />
            <Route path="/chat/:id" element={protectedScreen(<ChatConversation />)} />
            <Route path="/notifications" element={protectedScreen(<Notifications />)} />
            <Route path="/profile" element={protectedScreen(<Profile />)} />
            <Route path="/profile/edit" element={protectedScreen(<EditProfile />)} />
            <Route path="/profile/:id" element={protectedScreen(<UserProfile />)} />
            <Route path="/settings" element={protectedScreen(<Settings />)} />
            <Route path="/my-books" element={protectedScreen(<MyBooks />)} />
            <Route path="/my-requests" element={protectedScreen(<MyRequests />)} />
            <Route path="/received-requests" element={protectedScreen(<ReceivedRequests />)} />
            <Route path="/admin" element={protectedScreen(<RequireAdmin><AdminDashboard /></RequireAdmin>)} />
            <Route path="/communities" element={protectedScreen(<Communities />)} />
            <Route path="/communities/create" element={protectedScreen(<CreateCommunity />)} />
            <Route path="/communities/:id/notes" element={protectedScreen(<CommunityNotes />)} />
            <Route path="/communities/:id/discussion" element={protectedScreen(<CommunityDiscussion />)} />
            <Route path="/communities/:id/books" element={protectedScreen(<CommunityBooks />)} />
            <Route path="/communities/:id/manage" element={protectedScreen(<CommunityManage />)} />
            <Route path="/communities/:id/members" element={protectedScreen(<CommunityMembers />)} />
            <Route path="/communities/:id" element={protectedScreen(<CommunityDetail />)} />
            <Route path="/help" element={protectedScreen(<Help />)} />
            <Route path="/about" element={protectedScreen(<About />)} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </main>
      {showNav && <BottomNav />}
      {showDesktopChrome && <SiteFooter />}
    </div>
  );
}

function DataErrorBanner() {
  const { dataError, refresh } = useStore();
  if (!dataError) return null;
  return <div className="sticky top-0 z-50 border-b border-rose-400/30 bg-rose-950/95 px-4 py-3 text-center text-sm text-rose-100"><span>Could not refresh BookBridge: {dataError}</span><button onClick={() => void refresh()} className="ml-3 rounded-md bg-rose-400/20 px-2 py-1 font-semibold">Retry</button></div>;
}

function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <LiveNotification />
        <AppRoutes />
      </HashRouter>
    </StoreProvider>
  );
}

export default App;
