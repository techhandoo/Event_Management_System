import { motion } from 'framer-motion';
import { useSidebar } from '../context/SidebarContext';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { collapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-surface-50">
      <Sidebar />
      <motion.div
        animate={{ marginLeft: collapsed ? 68 : 248 }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        className="flex flex-col min-h-screen"
      >
        <TopBar />
        <main className="flex-1 p-6 lg:p-8">
          <motion.div
            key={typeof window !== 'undefined' ? window.location.pathname : ''}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {children}
          </motion.div>
        </main>
      </motion.div>
    </div>
  );
}
