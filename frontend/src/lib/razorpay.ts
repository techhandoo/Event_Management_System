/**
 * Lazy loader for the Razorpay checkout SDK.
 *
 * Previously `checkout.js` was loaded globally in `index.html`, which:
 *  1. Slowed down EVERY page (300KB+ script on register/login/landing too)
 *  2. Triggered CSP violations (the bundle phones home to lumberjack.razorpay.com)
 *
 * Now the script is injected only when a paid booking is being made.
 */
let razorpayPromise: Promise<any> | null = null;

export function loadRazorpay(): Promise<any> {
  if (razorpayPromise) return razorpayPromise;

  razorpayPromise = new Promise((resolve, reject) => {
    // Already loaded (e.g. cached by the browser after a previous load)
    if ((window as any).Razorpay) {
      resolve((window as any).Razorpay);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve((window as any).Razorpay);
    script.onerror = () => {
      razorpayPromise = null; // allow retry
      reject(new Error('Failed to load payment system. Please try again.'));
    };
    document.body.appendChild(script);
  });

  return razorpayPromise;
}