import { ChatWidget } from '@/components/chat/ChatWidget';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Demo page content - in production this would be your actual website */}
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="text-center max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Welcome to SecureBank
          </h1>
          <p className="text-lg text-slate-300 mb-8">
            Your trusted partner in digital banking. Experience secure, fast, and convenient banking services.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-left max-w-xs">
              <h3 className="text-lg font-semibold text-white mb-2">24/7 Support</h3>
              <p className="text-slate-300 text-sm">
                Get instant help anytime with our AI-powered assistant.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-left max-w-xs">
              <h3 className="text-lg font-semibold text-white mb-2">Secure Banking</h3>
              <p className="text-slate-300 text-sm">
                Bank-grade security protecting your accounts and data.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-left max-w-xs">
              <h3 className="text-lg font-semibold text-white mb-2">Easy Transfers</h3>
              <p className="text-slate-300 text-sm">
                Send money instantly to anyone, anywhere.
              </p>
            </div>
          </div>
          <p className="mt-12 text-slate-400 text-sm">
            Click the chat icon in the bottom-right corner to start a conversation
          </p>
        </div>
      </div>

      {/* Floating Chat Widget */}
      <ChatWidget />
    </main>
  );
}
