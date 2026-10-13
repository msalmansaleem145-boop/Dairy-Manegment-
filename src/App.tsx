import React, { useState, useEffect } from 'react';
import { UserRole, Sale } from './types';
import { DairyDatabaseService, AppDatabase } from './services/storage';
import { Language } from './i18n/translations';
import { Header } from './components/Header';
import { WorkspaceToolbar } from './components/WorkspaceToolbar';
import { Sidebar } from './components/Sidebar';
import { ReceiptModal } from './components/ReceiptModal';
import { NotificationCenter } from './components/NotificationCenter';
import { QuickActionModal } from './components/QuickActionModal';
import { BrandedStartupScreen } from './components/BrandedStartupScreen';
import { Footer } from './components/Footer';

// Views
import { DashboardView } from './views/DashboardView';
import { AnimalsView } from './views/AnimalsView';
import { MilkProductionView } from './views/MilkProductionView';
import { MilkReconciliationView } from './views/MilkReconciliationView';
import { PosView } from './views/PosView';
import { CustomersView } from './views/CustomersView';
import { ProcessingView } from './views/ProcessingView';
import { InventoryFeedView } from './views/InventoryFeedView';
import { VeterinaryBreedingView } from './views/VeterinaryBreedingView';
import { AccountingView } from './views/AccountingView';
import { EmployeesView } from './views/EmployeesView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';

export default function App() {
  const [db, setDb] = useState<AppDatabase>(() => DairyDatabaseService.getDatabase());
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('branch-1');
  const [currentRole, setCurrentRole] = useState<UserRole>('super_admin');
  const [lang, setLang] = useState<Language>('en');
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [pendingQueueCount, setPendingQueueCount] = useState<number>(0);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [isStartupLoading, setIsStartupLoading] = useState<boolean>(true);
  
  // Modals
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showQuickAction, setShowQuickAction] = useState<boolean>(false);
  const [receiptSale, setReceiptSale] = useState<Sale | null>(null);

  const refreshDb = () => {
    const updated = DairyDatabaseService.getDatabase();
    setDb({ ...updated });
    setPendingQueueCount(DairyDatabaseService.getOfflineQueue().length);
  };

  useEffect(() => {
    refreshDb();
  }, []);

  const handleSyncOfflineQueue = () => {
    const res = DairyDatabaseService.syncOfflineQueue();
    refreshDb();
    alert(`Synchronization complete: ${res.successCount} synced, ${res.failedCount} failed.`);
  };

  const handleMarkAllNotificationsRead = () => {
    const currentDb = DairyDatabaseService.getDatabase();
    currentDb.notifications.forEach(n => { n.read = true; });
    DairyDatabaseService.saveDatabase(currentDb);
    refreshDb();
  };

  const unreadNotificationsCount = db.notifications.filter(n => !n.read).length;

  return (
    <div className={`min-h-screen flex flex-col bg-neutral-100 text-neutral-900 ${lang === 'ur' ? 'rtl' : 'ltr'}`} dir={lang === 'ur' ? 'rtl' : 'ltr'}>
      {/* 1. Header (Adhering strictly to Top Bar 3-Zone Contract) */}
      <Header
        currentTab={currentTab}
        onNavigate={(tab) => setCurrentTab(tab)}
        onOpenQuickAction={() => setShowQuickAction(true)}
      />

      {/* 2. Workspace Control Toolbar */}
      <WorkspaceToolbar
        branches={db.branches}
        selectedBranchId={selectedBranchId}
        onSelectBranch={(id) => setSelectedBranchId(id)}
        currentRole={currentRole}
        onChangeRole={(role) => setCurrentRole(role)}
        lang={lang}
        onToggleLang={(newLang) => setLang(newLang)}
        isOffline={isOffline}
        onToggleOffline={() => setIsOffline(!isOffline)}
        pendingSyncCount={pendingQueueCount}
        onSync={handleSyncOfflineQueue}
        unreadNotificationsCount={unreadNotificationsCount}
        onOpenNotifications={() => setShowNotifications(true)}
        onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      />

      {/* 3. Main Workspace Area: Sidebar + Active View */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          userRole={currentRole}
          lang={lang}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* View Container & Footer Column */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {currentTab === 'dashboard' && (
            <DashboardView
              db={db}
              onNavigate={(tab) => setCurrentTab(tab)}
              lang={lang}
              selectedBranchId={selectedBranchId}
            />
          )}

          {currentTab === 'animals' && (
            <AnimalsView
              db={db}
              onRefreshDb={refreshDb}
              lang={lang}
              selectedBranchId={selectedBranchId}
            />
          )}

          {currentTab === 'milkProduction' && (
            <MilkProductionView
              db={db}
              onRefreshDb={refreshDb}
              lang={lang}
              selectedBranchId={selectedBranchId}
            />
          )}

          {currentTab === 'reconciliation' && (
            <MilkReconciliationView
              db={db}
              onRefreshDb={refreshDb}
              lang={lang}
              selectedBranchId={selectedBranchId}
            />
          )}

          {currentTab === 'posBilling' && (
            <PosView
              db={db}
              onRefreshDb={refreshDb}
              lang={lang}
              selectedBranchId={selectedBranchId}
              onPrintSale={(sale) => setReceiptSale(sale)}
            />
          )}

          {currentTab === 'customers' && (
            <CustomersView
              db={db}
              onRefreshDb={refreshDb}
              lang={lang}
            />
          )}

          {currentTab === 'processing' && (
            <ProcessingView
              db={db}
              onRefreshDb={refreshDb}
              lang={lang}
              selectedBranchId={selectedBranchId}
            />
          )}

          {currentTab === 'inventoryFeed' && (
            <InventoryFeedView
              db={db}
              onRefreshDb={refreshDb}
              lang={lang}
              selectedBranchId={selectedBranchId}
            />
          )}

          {currentTab === 'vetBreeding' && (
            <VeterinaryBreedingView
              db={db}
              onRefreshDb={refreshDb}
              lang={lang}
              selectedBranchId={selectedBranchId}
            />
          )}

          {currentTab === 'accounting' && (
            <AccountingView
              db={db}
              onRefreshDb={refreshDb}
              lang={lang}
              selectedBranchId={selectedBranchId}
            />
          )}

          {currentTab === 'employees' && (
            <EmployeesView
              db={db}
              onRefreshDb={refreshDb}
              lang={lang}
              selectedBranchId={selectedBranchId}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView
              db={db}
              lang={lang}
              selectedBranchId={selectedBranchId}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              db={db}
              onRefreshDb={refreshDb}
              lang={lang}
            />
          )}
          </main>

          {/* Vibrant Colorful Footer with Powered by M Salman Saleem */}
          <Footer lang={lang} />
        </div>
      </div>

      {/* Thermal Receipt Print Modal */}
      <ReceiptModal
        sale={receiptSale}
        onClose={() => setReceiptSale(null)}
      />

      {/* In-App Notifications Drawer */}
      <NotificationCenter
        notifications={db.notifications}
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onSelectAction={(tab) => {
          setCurrentTab(tab);
          setShowNotifications(false);
        }}
      />

      {/* Quick Action Modal */}
      <QuickActionModal
        isOpen={showQuickAction}
        onClose={() => setShowQuickAction(false)}
        onSelectAction={(tab) => {
          setCurrentTab(tab);
          setShowQuickAction(false);
        }}
      />

      {/* Branded Startup Loading Screen (Appears only on initial application startup) */}
      {isStartupLoading && (
        <BrandedStartupScreen
          onComplete={() => setIsStartupLoading(false)}
          minDurationMs={1500}
        />
      )}
    </div>
  );
}
