import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; chunkError: boolean; }

/**
 * Catches render crashes anywhere in the app. Two failure classes:
 *  1. Stale-chunk failures — a new deploy invalidates old lazy chunks; the
 *     browser 404s on a cached route and React throws "Failed to fetch
 *     dynamically imported module". These need a full reload (cache-busted
 *     redirect), not just a re-render.
 *  2. Genuine render bugs — show an enterprise-style card with recovery
 *     actions instead of a blank screen.
 */
export default class ErrorBoundary extends Component<Props, State> {
 constructor(props: Props) {
  super(props);
  this.state = { hasError: false, error: null, chunkError: false };
 }

 static getDerivedStateFromError(error: Error): State {
  const chunkError = /dynamically imported module|Failed to fetch dynamically|Importing a module script|ChunkLoadError/i.test(
   error?.message || ''
  );
  return { hasError: true, error, chunkError };
 }

 componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  console.error('ErrorBoundary caught:', error, errorInfo);
 }

 render() {
  if (this.state.hasError) {
   // Stale chunk after a deploy: full cache-busting reload is the only fix
   if (this.state.chunkError) {
    window.location.replace('/');
    return null;
   }

   return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center p-6">
     <div className="fixed inset-0 pointer-events-none">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-red-500/5 rounded-full blur-[120px]" />
     </div>
     <div className="surface-card max-w-md w-full p-8 text-center relative z-10">
      <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
       <AlertTriangle className="w-6 h-6 text-red-400" />
      </div>
      <h2 className="text-lg font-bold text-surface-900 mb-2">Something went wrong</h2>
      <p className="text-sm text-surface-400 leading-relaxed mb-6">
       An unexpected error occurred while rendering this page. Your data is safe —
       reloading restores the app.
      </p>
      <div className="flex items-center justify-center gap-3">
       <button onClick={() => window.location.reload()} className="btn-primary">
        <RefreshCw size={16} /> Reload page
       </button>
       <button onClick={() => { window.location.href = '/'; }} className="btn-ghost">
        <Home size={16} /> Home
       </button>
      </div>
      {this.state.error && (
       <p className="text-xs text-surface-400/70 mt-4 font-mono truncate" title={this.state.error.message}>
        {this.state.error.message}
       </p>
      )}
     </div>
    </div>
   );
  }
  return this.props.children;
 }
}
