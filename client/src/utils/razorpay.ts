export function loadRazorpay(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) return resolve(true);
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function openRazorpayCheckout(options: any): Promise<void> {
  const ok = await loadRazorpay('https://checkout.razorpay.com/v1/checkout.js');
  if (!ok) throw new Error('Failed to load Razorpay');
  // @ts-ignore
  const rzp = new window.Razorpay(options);
  rzp.open();
}
