import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Scrolls the window to the top on every route change.
 * Without this, navigating from a tall page (e.g. the landing page) to a
 * short one (e.g. /login) keeps the old scrollY — the login form appears
 * "scrolled up" into empty space, sometimes with dead scroll area while the
 * previous page fades out.
 */
export default function ScrollToTop() {
 const { pathname } = useLocation();

 useEffect(() => {
  // 'instant' — never animate the reset; smooth-scrolling (html.scroll-smooth)
  // would visibly glide to the top on every navigation.
  window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
 }, [pathname]);

 return null;
}
