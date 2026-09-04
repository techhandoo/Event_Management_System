import { createContext, useContext, useState, ReactNode } from 'react';

interface SidebarContextType {
 collapsed: boolean;
 setCollapsed: (v: boolean) => void;
 toggle: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
 const [collapsed, setCollapsed] = useState(false);
 const toggle = () => setCollapsed(c => !c);

 return (
  <SidebarContext.Provider value={{ collapsed, setCollapsed, toggle }}>
   {children}
  </SidebarContext.Provider>
 );
}

export function useSidebar() {
 const ctx = useContext(SidebarContext);
 if (!ctx) throw new Error('useSidebar must be used within SidebarProvider');
 return ctx;
}
