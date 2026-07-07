'use client';

import { MessageCircle } from 'lucide-react';

export function WhatsAppButton() {
  const whatsappNumber = '923187055975'; // Updated to user's WhatsApp number
  const message = 'Hello! I\'m interested in learning more about ToyShop Pro. Can you help me?';

  const handleWhatsAppClick = () => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <button
      onClick={handleWhatsAppClick}
      className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-r from-green-400 to-green-600 hover:from-green-300 hover:to-green-500 text-white rounded-full shadow-lg shadow-green-500/40 hover:shadow-xl hover:shadow-green-500/60 transition-all duration-300 flex items-center justify-center z-40 group hover:scale-110"
      title="Chat with us on WhatsApp"
    >
      <svg
        className="w-7 h-7 group-hover:scale-110 transition-transform"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.946 1.347l-.355.202-3.582.654.666 2.433.386-.221a9.75 9.75 0 014.591-1.242h.005c2.487 0 4.829.731 6.822 2.11.529.394 1.03.854 1.49 1.365l.074-1.236c0-2.718-1.121-5.276-3.157-7.201-2.036-1.926-4.738-2.988-7.601-2.988-.567 0-1.128.039-1.683.117l.248.916c.502-.086 1.019-.13 1.54-.13z"/>
      </svg>
    </button>
  );
}
