"use client"

import { useEffect } from "react"

export default function CartFlyAnimation() {
  useEffect(() => {
    const handler = (ev: any) => {
      try {
        const productId = ev?.detail?.productId;
        const productImage = document.querySelector(`[data-product-id='${productId}'] img[data-product-image], [data-product-id='${productId}'] [data-product-image]`) as HTMLImageElement | null;
        const cartBtn = document.querySelector('[data-site-cart]') as HTMLElement | null;
        if (!productImage || !cartBtn) return;

        const clone = productImage.cloneNode(true) as HTMLImageElement;
        clone.style.position = 'fixed';
        clone.style.pointerEvents = 'none';
        clone.style.zIndex = '9999';
        clone.style.width = productImage.clientWidth + 'px';
        clone.style.height = productImage.clientHeight + 'px';

        const productRect = productImage.getBoundingClientRect();
        const cartRect = cartBtn.getBoundingClientRect();

        clone.style.left = productRect.left + 'px';
        clone.style.top = productRect.top + 'px';

        document.body.appendChild(clone);

        const startX = productRect.left + productRect.width / 2;
        const startY = productRect.top + productRect.height / 2;
        const endX = cartRect.left + cartRect.width / 2;
        const endY = cartRect.top + cartRect.height / 2;

        const duration = 900;
        const startTime = Date.now();

        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);

          const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;

          const control1X = startX - 200;
          const control1Y = startY - 300;
          const control2X = endX + 100;
          const control2Y = endY - 200;

          const x = Math.pow(1 - ease, 3) * startX + 3 * Math.pow(1 - ease, 2) * ease * control1X + 3 * (1 - ease) * Math.pow(ease, 2) * control2X + Math.pow(ease, 3) * endX;
          const y = Math.pow(1 - ease, 3) * startY + 3 * Math.pow(1 - ease, 2) * ease * control1Y + 3 * (1 - ease) * Math.pow(ease, 2) * control2Y + Math.pow(ease, 3) * endY;

          clone.style.left = x - productRect.width / 2 + 'px';
          clone.style.top = y - productRect.height / 2 + 'px';
          const scale = 1 - ease * 0.7;
          clone.style.transform = `scale(${scale})`;
          clone.style.opacity = String(1 - ease * 0.6);

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            if (clone.parentNode) clone.parentNode.removeChild(clone);
            // briefly pulse cart button
            cartBtn.animate([
              { transform: 'scale(1)' },
              { transform: 'scale(1.25)' },
              { transform: 'scale(1)' }
            ], { duration: 400 });
          }
        };

        animate();
      } catch (err) {
        // ignore
      }
    };

    window.addEventListener('cart:add', handler as EventListener);
    return () => window.removeEventListener('cart:add', handler as EventListener);
  }, []);

  return null;
}
