import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home, ArrowLeft, RefreshCw,
  SearchX, ShieldOff, ServerCrash,
  WifiOff, AlertTriangle,
  Ban, Wrench, Zap
} from 'lucide-react';

interface ErrorPageProps {
  code: number;
  title?: string;
  description?: string;
}

const ERROR_CONFIG: Record<number, {
  title: string;
  description: string;
  icon: React.ReactNode;
  accentColor: string;
  bgGradient: string;
  illustration: React.ReactNode;
}> = {
  400: {
    title: 'Bad Request',
    description: 'The server couldn\'t understand your request. Try refreshing or going back.',
    icon: <AlertTriangle className="w-7 h-7" />,
    accentColor: 'text-amber-600',
    bgGradient: 'from-amber-50 to-orange-50',
    illustration: <BadIllustration />,
  },
  401: {
    title: 'Unauthorized',
    description: 'You need to sign in to access this page.',
    icon: <ShieldOff className="w-7 h-7" />,
    accentColor: 'text-red-600',
    bgGradient: 'from-red-50 to-rose-50',
    illustration: <AuthIllustration />,
  },
  403: {
    title: 'Access Denied',
    description: 'You don\'t have permission to view this page. Contact an admin if you think this is a mistake.',
    icon: <Ban className="w-7 h-7" />,
    accentColor: 'text-red-600',
    bgGradient: 'from-red-50 to-pink-50',
    illustration: <ForbiddenIllustration />,
  },
  404: {
    title: 'Page Not Found',
    description: 'The page you\'re looking for doesn\'t exist or has been moved.',
    icon: <SearchX className="w-7 h-7" />,
    accentColor: 'text-brand-600',
    bgGradient: 'from-brand-50 to-blue-50',
    illustration: <NotFoundIllustration />,
  },
  500: {
    title: 'Server Error',
    description: 'Something went wrong on our end. Our team has been notified.',
    icon: <ServerCrash className="w-7 h-7" />,
    accentColor: 'text-red-600',
    bgGradient: 'from-red-50 to-orange-50',
    illustration: <ServerErrorIllustration />,
  },
  502: {
    title: 'Bad Gateway',
    description: 'The server received an invalid response. Try again in a moment.',
    icon: <WifiOff className="w-7 h-7" />,
    accentColor: 'text-purple-600',
    bgGradient: 'from-purple-50 to-violet-50',
    illustration: <GatewayIllustration />,
  },
  503: {
    title: 'Service Unavailable',
    description: 'We\'re undergoing maintenance. Please try again shortly.',
    icon: <Wrench className="w-7 h-7" />,
    accentColor: 'text-amber-600',
    bgGradient: 'from-amber-50 to-yellow-50',
    illustration: <MaintenanceIllustration />,
  },
};

const DEFAULT_CONFIG = {
  title: 'Something Went Wrong',
  description: 'An unexpected error occurred. Please try again.',
  icon: <AlertTriangle className="w-7 h-7" />,
  accentColor: 'text-surface-600',
  bgGradient: 'from-surface-50 to-gray-100',
  illustration: <GenericIllustration />,
};

export default function ErrorPage({ code, title, description }: ErrorPageProps) {
  const navigate = useNavigate();
  const config = ERROR_CONFIG[code] || DEFAULT_CONFIG;
  const displayTitle = title || config.title;
  const displayDescription = description || config.description;

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="max-w-lg w-full"
      >
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-card border border-surface-150 overflow-hidden">
          {/* Illustration area */}
          <div className={`relative bg-gradient-to-br ${config.bgGradient} px-8 pt-10 pb-8 flex items-center justify-center overflow-hidden`}>
            {/* Decorative circles */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/30 blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white/20 blur-2xl" />
            </div>

            {/* Error code + illustration */}
            <div className="relative text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                className="mb-4"
              >
                {config.illustration}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.3 }}
              >
                <span className={`text-7xl font-extrabold ${config.accentColor} opacity-20 select-none leading-none`}>
                  {code}
                </span>
              </motion.div>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-8 text-center">
            <h1 className="text-xl font-bold text-surface-800 mb-2">{displayTitle}</h1>
            <p className="text-sm text-surface-500 leading-relaxed mb-6 max-w-sm mx-auto">
              {displayDescription}
            </p>

            {/* Actions */}
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => navigate(-1)} className="btn-secondary">
                <ArrowLeft size={16} /> Go back
              </button>
              <Link to="/" className="btn-primary">
                <Home size={16} /> Home
              </Link>
              {code >= 500 && (
                <button onClick={() => window.location.reload()} className="btn-ghost">
                  <RefreshCw size={16} /> Retry
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer hint */}
        <p className="text-center text-xs text-surface-400 mt-4">
          Error {code} · {new Date().toLocaleDateString()}
        </p>
      </motion.div>
    </div>
  );
}

/* ── Illustrations ─────────────────────────────────────── */

function NotFoundIllustration() {
  return (
    <div className="relative w-28 h-28 mx-auto">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-20 h-20 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/40 flex items-center justify-center shadow-lg">
          <SearchX className="w-10 h-10 text-brand-400" />
        </div>
      </div>
      {/* Floating elements */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-0 right-0 w-8 h-8 rounded-lg bg-white/50 backdrop-blur-sm border border-white/30 flex items-center justify-center"
      >
        <Zap className="w-4 h-4 text-brand-300" />
      </motion.div>
      <motion.div
        animate={{ y: [0, 4, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className="absolute bottom-1 left-0 w-7 h-7 rounded-full bg-white/50 backdrop-blur-sm border border-white/30"
      />
    </div>
  );
}

function AuthIllustration() {
  return (
    <div className="relative w-28 h-28 mx-auto">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-20 h-20 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/40 flex items-center justify-center shadow-lg">
          <ShieldOff className="w-10 h-10 text-red-400" />
        </div>
      </div>
      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1 right-1 w-8 h-8 rounded-lg bg-white/50 backdrop-blur-sm border border-white/30 flex items-center justify-center"
      >
        <div className="w-3 h-3 rounded-full bg-red-300" />
      </motion.div>
    </div>
  );
}

function ForbiddenIllustration() {
  return (
    <div className="relative w-28 h-28 mx-auto">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-20 h-20 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/40 flex items-center justify-center shadow-lg">
          <Ban className="w-10 h-10 text-red-400" />
        </div>
      </div>
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-0 right-2 w-6 h-6 rounded-full bg-red-200/50"
      />
    </div>
  );
}

function BadIllustration() {
  return (
    <div className="relative w-28 h-28 mx-auto">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-20 h-20 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/40 flex items-center justify-center shadow-lg">
          <AlertTriangle className="w-10 h-10 text-amber-400" />
        </div>
      </div>
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-0 left-2 w-6 h-6 rounded-lg bg-amber-200/40 flex items-center justify-center"
      >
        <span className="text-xs font-bold text-amber-500">!</span>
      </motion.div>
    </div>
  );
}

function ServerErrorIllustration() {
  return (
    <div className="relative w-28 h-28 mx-auto">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-20 h-20 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/40 flex items-center justify-center shadow-lg">
          <ServerCrash className="w-10 h-10 text-red-400" />
        </div>
      </div>
      <motion.div
        animate={{ x: [-2, 2, -2] }}
        transition={{ duration: 0.3, repeat: Infinity }}
        className="absolute top-2 right-0 w-7 h-7 rounded-lg bg-white/50 backdrop-blur-sm border border-white/30 flex items-center justify-center"
      >
        <div className="w-2.5 h-2.5 rounded-full bg-red-300" />
      </motion.div>
    </div>
  );
}

function GatewayIllustration() {
  return (
    <div className="relative w-28 h-28 mx-auto">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-20 h-20 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/40 flex items-center justify-center shadow-lg">
          <WifiOff className="w-10 h-10 text-purple-400" />
        </div>
      </div>
      <motion.div
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1 left-1 w-5 h-5 rounded-full bg-purple-200/50"
      />
    </div>
  );
}

function MaintenanceIllustration() {
  return (
    <div className="relative w-28 h-28 mx-auto">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-20 h-20 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/40 flex items-center justify-center shadow-lg">
          <Wrench className="w-10 h-10 text-amber-400" />
        </div>
      </div>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        className="absolute bottom-1 right-1 w-7 h-7 rounded-full border-2 border-dashed border-amber-300/50"
      />
    </div>
  );
}

function GenericIllustration() {
  return (
    <div className="relative w-28 h-28 mx-auto">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-20 h-20 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/40 flex items-center justify-center shadow-lg">
          <AlertTriangle className="w-10 h-10 text-surface-400" />
        </div>
      </div>
    </div>
  );
}
