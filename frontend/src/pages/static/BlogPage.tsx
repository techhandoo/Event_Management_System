import { motion } from 'framer-motion';
import StaticPageLayout from '../../components/StaticPageLayout';
import { Calendar, ArrowRight } from 'lucide-react';

const posts = [
  {
    title: 'Introducing Eventry: The Future of Event Management',
    excerpt: 'We\'re excited to launch Eventry — a modern platform that makes creating, managing, and attending events effortless.',
    date: 'Aug 2026',
    category: 'Product',
    readTime: '5 min read',
  },
  {
    title: 'How We Built Real-Time Notifications with Kafka',
    excerpt: 'A deep dive into our architecture decisions around Apache Kafka for delivering instant notifications to thousands of users.',
    date: 'Jul 2026',
    category: 'Engineering',
    readTime: '8 min read',
  },
  {
    title: 'Designing a Dark-First UI: Lessons Learned',
    excerpt: 'Why we chose dark mode as our default and how it improved user engagement by 40% in our beta testing phase.',
    date: 'Jul 2026',
    category: 'Design',
    readTime: '6 min read',
  },
  {
    title: 'Scaling Event Ticketing to 10K Concurrent Users',
    excerpt: 'Our journey from a monolith to a microservice-ready architecture that handles peak traffic during major event launches.',
    date: 'Jun 2026',
    category: 'Engineering',
    readTime: '10 min read',
  },
  {
    title: 'The Psychology of Event Discovery',
    excerpt: 'How smart categorization and personalized recommendations help attendees find events they\'ll love.',
    date: 'Jun 2026',
    category: 'Product',
    readTime: '4 min read',
  },
  {
    title: 'Eventry is Now Open Source',
    excerpt: 'We\'re open-sourcing our core event management engine. Here\'s why and what it means for the community.',
    date: 'May 2026',
    category: 'Community',
    readTime: '3 min read',
  },
];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const categoryColors: Record<string, string> = {
  Product: 'bg-brand-500/15 text-brand-400 border-brand-500/20',
  Engineering: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  Design: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
  Community: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
};

export default function BlogPage() {
  return (
    <StaticPageLayout>
      <div className="text-center mb-12">
        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="badge-brand mb-4 inline-block">
          Blog
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl sm:text-5xl font-extrabold text-white mb-4"
        >
          Insights & <span className="gradient-text">Updates</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-surface-400 max-w-xl mx-auto">
          The latest from the Eventry team — product updates, engineering deep dives, and event industry insights.
        </motion.p>
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
        {posts.map((post, i) => (
          <motion.article
            key={i}
            variants={fadeUp}
            className="glass-card p-6 group hover:border-brand-500/20 transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`badge text-[10px] ${categoryColors[post.category] || 'bg-white/10 text-surface-400'}`}>
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-surface-400">
                    <Calendar size={12} /> {post.date}
                  </span>
                  <span className="text-xs text-surface-400">{post.readTime}</span>
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-brand-400 transition-colors mb-2">
                  {post.title}
                </h3>
                <p className="text-sm text-surface-400 leading-relaxed">{post.excerpt}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-surface-400 group-hover:text-brand-400 group-hover:translate-x-1 transition-all flex-shrink-0 mt-2" />
            </div>
          </motion.article>
        ))}
      </motion.div>
    </StaticPageLayout>
  );
}
