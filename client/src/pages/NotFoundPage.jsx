import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="container-custom text-center py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-8xl mb-6">🗺️</div>
          <h1 className="text-6xl font-bold gradient-text mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-white mb-3">Page Not Found</h2>
          <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto">
            Looks like this destination doesn't exist on our map. Let's get you back on track.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/" className="btn-primary flex items-center justify-center gap-2">
              <Home size={16} /> Back to Home
            </Link>
            <Link to="/hotels" className="btn-secondary flex items-center justify-center gap-2">
              <Search size={16} /> Browse Hotels
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}