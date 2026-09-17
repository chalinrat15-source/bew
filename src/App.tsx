import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { User, Activity, Category, UserTab } from './types';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { UserHome } from './components/UserApp/UserHome';
import { ActivityMatch } from './components/UserApp/ActivityMatch';
import { RecommendationModal } from './components/UserApp/RecommendationModal';
import { ActivityDetailModal } from './components/UserApp/ActivityDetailModal';
import { ActiveSessionDrawer } from './components/UserApp/ActiveSessionDrawer';
import { MyActivitiesView } from './components/UserApp/MyActivitiesView';
import { UserDashboardView } from './components/UserApp/UserDashboardView';
import { UserProfileView } from './components/UserApp/UserProfileView';
import { AdminLayout } from './components/AdminApp/AdminLayout';
import { AlertTriangle, RefreshCw } from 'lucide-react';

// Error Boundary to prevent blank white screens (ขาวเกิน)
interface ErrorBoundaryProps {
  children: ReactNode;
}
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  props: ErrorBoundaryProps;
  state: ErrorBoundaryState = { hasError: false, error: null };

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App Error Caught by Boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-3xl p-8 text-center shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-500/30">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold mb-2">พบข้อผิดพลาดในการแสดงผล</h2>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              ระบบตรวจพบปัญหาและป้องกันจอขาวเรียบร้อยแล้ว กรุณากดปุ่มด้านล่างเพื่อโหลดหน้าใหม่
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg inline-flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              รีเฟรชโหลดใหม่
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(api.getCurrentUser());
  const [viewMode, setViewMode] = useState<'user' | 'admin'>('user');
  const [activeUserTab, setActiveUserTab] = useState<UserTab>('home');
  const [onlineCount, setOnlineCount] = useState<number>(1);

  // Global Data Store
  const [categories, setCategories] = useState<Category[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | undefined>(undefined);

  // Modals & Drawers
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isRecommendModalOpen, setIsRecommendModalOpen] = useState(false);

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };
  const [selectedActivityDetail, setSelectedActivityDetail] = useState<Activity | null>(null);
  const [activeSessionActivity, setActiveSessionActivity] = useState<Activity | null>(null);

  // Load initial global data
  useEffect(() => {
    // Start heartbeat tracking
    api.initHeartbeat();
    api.trackPageView('/');

    // Fetch categories and activities
    const loadAppData = async () => {
      try {
        const [cats, acts] = await Promise.all([
          api.getCategories(),
          api.getActivities(),
        ]);
        setCategories(cats);
        setActivities(acts);
      } catch (err) {
        console.error('Failed to load initial activities/categories:', err);
      }
    };
    loadAppData();

    // Poll live online users
    const pollLive = async () => {
      try {
        const live = await api.getLiveUsers();
        setOnlineCount(live.onlineCount);
      } catch (e) {
        // quiet error
      }
    };
    pollLive();
    const interval = setInterval(pollLive, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fetch saved & favorite activities when user logs in/out
  useEffect(() => {
    const loadSaved = async () => {
      if (currentUser) {
        try {
          const saved = await api.getSavedActivities();
          setSavedIds(saved.filter((s) => s.isSaved).map((s) => s.activityId));
          setFavoriteIds(saved.filter((s) => s.isFavorite).map((s) => s.activityId));
        } catch (e) {
          console.error('Failed to load saved activities:', e);
        }
      } else {
        setSavedIds([]);
        setFavoriteIds([]);
      }
    };
    loadSaved();
  }, [currentUser]);

  // Track page views on user tab change
  const handleSelectTab = (tab: UserTab) => {
    setActiveUserTab(tab);
    api.trackPageView(`/${tab}`);
  };

  const handleSelectCategoryFromHome = (categoryId: string) => {
    setSelectedCategoryFilter(categoryId);
    setActiveUserTab('match');
    api.trackPageView('/match');
  };

  const handleStartActivity = (activity: Activity) => {
    setActiveSessionActivity(activity);
    api.trackStartActivity(activity.id, activity.titleTh, activity.categoryId);
  };

  const handleOpenDetail = (activity: Activity) => {
    setSelectedActivityDetail(activity);
    api.trackViewActivity(activity.id, activity.titleTh, activity.categoryId);
  };

  const handleToggleSave = async (activityId: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    const isCurrentlySaved = savedIds.includes(activityId);
    try {
      await api.toggleSave(activityId, !isCurrentlySaved);
      if (isCurrentlySaved) {
        setSavedIds((prev) => prev.filter((id) => id !== activityId));
      } else {
        setSavedIds((prev) => [...prev, activityId]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleFavorite = async (activityId: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    const isCurrentlyFav = favoriteIds.includes(activityId);
    try {
      await api.toggleFavorite(activityId, !isCurrentlyFav);
      if (isCurrentlyFav) {
        setFavoriteIds((prev) => prev.filter((id) => id !== activityId));
      } else {
        setFavoriteIds((prev) => [...prev, activityId]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    setSavedIds([]);
    setFavoriteIds([]);
    if (viewMode === 'admin') {
      setViewMode('user');
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white">
        {/* Universal Top Navigation */}
        <Navbar
          currentUser={currentUser}
          viewMode={viewMode}
          onSwitchViewMode={(mode) => {
            setViewMode(mode);
            api.trackPageView(mode === 'admin' ? '/admin/dashboard' : `/${activeUserTab}`);
          }}
          activeUserTab={activeUserTab}
          onSelectUserTab={handleSelectTab}
          onOpenAuth={handleOpenAuth}
          onOpenRecommendation={() => setIsRecommendModalOpen(true)}
          onLogout={handleLogout}
          onlineCount={onlineCount}
        />

        {/* Main Content Area */}
        {viewMode === 'admin' ? (
          <AdminLayout
            currentUser={currentUser}
            onExitAdmin={() => setViewMode('user')}
            onOpenAuth={() => handleOpenAuth('login')}
          />
        ) : (
          <main className="flex-1">
            {activeUserTab === 'home' && (
              <UserHome
                categories={categories}
                activities={activities}
                onSelectCategory={handleSelectCategoryFromHome}
                onOpenActivityDetail={handleOpenDetail}
                onStartActivity={handleStartActivity}
                onOpenRecommend={() => setIsRecommendModalOpen(true)}
                onGoToMatch={() => handleSelectTab('match')}
                savedIds={savedIds}
                favoriteIds={favoriteIds}
                onToggleSave={handleToggleSave}
                onToggleFavorite={handleToggleFavorite}
              />
            )}

            {activeUserTab === 'match' && (
              <ActivityMatch
                categories={categories}
                initialCategory={selectedCategoryFilter}
                onOpenActivityDetail={handleOpenDetail}
                onStartActivity={handleStartActivity}
                savedIds={savedIds}
                favoriteIds={favoriteIds}
                onToggleSave={handleToggleSave}
                onToggleFavorite={handleToggleFavorite}
                onOpenRecommend={() => setIsRecommendModalOpen(true)}
              />
            )}

            {activeUserTab === 'my-activities' && (
              <MyActivitiesView
                categories={categories}
                onOpenActivityDetail={handleOpenDetail}
                onStartActivity={handleStartActivity}
                onToggleSave={handleToggleSave}
                onToggleFavorite={handleToggleFavorite}
                onOpenRecommend={() => setIsRecommendModalOpen(true)}
              />
            )}

            {activeUserTab === 'dashboard' && (
              <UserDashboardView
                user={currentUser}
                categories={categories}
                onGoToActivities={() => handleSelectTab('match')}
                onOpenRecommend={() => setIsRecommendModalOpen(true)}
                onOpenAuth={() => handleOpenAuth('login')}
              />
            )}

            {activeUserTab === 'profile' && (
              <UserProfileView
                user={currentUser}
                onUpdateUser={(updated) => setCurrentUser(updated)}
                onOpenAuth={() => handleOpenAuth('login')}
              />
            )}
          </main>
        )}

        {/* Authentication Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          initialMode={authModalMode}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={(user) => {
            setCurrentUser(user);
            setIsAuthModalOpen(false);
          }}
        />

        {/* Smart Recommendation Questionnaire Modal */}
        <RecommendationModal
          isOpen={isRecommendModalOpen}
          onClose={() => setIsRecommendModalOpen(false)}
          categories={categories}
          onStartActivity={handleStartActivity}
          onOpenActivityDetail={handleOpenDetail}
          savedIds={savedIds}
          onToggleSave={handleToggleSave}
        />

        {/* Activity Details Modal */}
        {selectedActivityDetail && (
          <ActivityDetailModal
            activity={selectedActivityDetail}
            onClose={() => setSelectedActivityDetail(null)}
            categories={categories}
            onStartActivity={handleStartActivity}
            isSaved={savedIds.includes(selectedActivityDetail.id)}
            isFavorite={favoriteIds.includes(selectedActivityDetail.id)}
            onToggleSave={handleToggleSave}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {/* Live Active Session Timer Drawer */}
        {activeSessionActivity && (
          <ActiveSessionDrawer
            activity={activeSessionActivity}
            isOpen={Boolean(activeSessionActivity)}
            onClose={() => setActiveSessionActivity(null)}
            onComplete={() => {
              setActiveSessionActivity(null);
            }}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}
