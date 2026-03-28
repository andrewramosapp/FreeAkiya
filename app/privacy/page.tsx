import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "CheapAkiya Privacy Policy — how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 text-gray-200">
      <h1 className="text-3xl font-black text-white mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-10">Last updated: March 28, 2026</p>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-white mb-3">Who we are</h2>
        <p className="text-gray-400 leading-relaxed">
          CheapAkiya (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) operates the website{" "}
          <a href="https://cheapakiya.com" className="text-orange-400 underline">cheapakiya.com</a>{" "}
          and the CheapAkiya mobile app. We help people discover and purchase affordable vacant
          homes (akiya) in Japan.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-white mb-3">Information we collect</h2>
        <ul className="list-disc list-inside text-gray-400 leading-relaxed space-y-2">
          <li><strong className="text-white">Email address</strong> — when you sign up for free or premium membership.</li>
          <li><strong className="text-white">Name</strong> — when you submit an inquiry about a property.</li>
          <li><strong className="text-white">Device push token</strong> — if you enable push notifications in the mobile app.</li>
          <li><strong className="text-white">Usage data</strong> — page views and interactions, collected anonymously to improve the service.</li>
          <li><strong className="text-white">Payment information</strong> — processed securely by Stripe. We do not store card numbers.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-white mb-3">How we use your information</h2>
        <ul className="list-disc list-inside text-gray-400 leading-relaxed space-y-2">
          <li>To provide and manage your membership account.</li>
          <li>To send newsletters and property alerts you subscribed to.</li>
          <li>To send push notifications about new listings (mobile app, opt-in only).</li>
          <li>To respond to property inquiries you submit.</li>
          <li>To improve the website and app based on usage patterns.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-white mb-3">Data sharing</h2>
        <p className="text-gray-400 leading-relaxed">
          We do not sell your personal data. We share data only with:
        </p>
        <ul className="list-disc list-inside text-gray-400 leading-relaxed space-y-2 mt-2">
          <li><strong className="text-white">Supabase</strong> — our database provider (data stored in the EU/US).</li>
          <li><strong className="text-white">Stripe</strong> — payment processing.</li>
          <li><strong className="text-white">Beehiiv</strong> — newsletter delivery.</li>
          <li><strong className="text-white">Expo / Apple / Google</strong> — push notification delivery for the mobile app.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-white mb-3">Push notifications</h2>
        <p className="text-gray-400 leading-relaxed">
          The CheapAkiya app may request permission to send push notifications. We only send
          notifications about new property listings and relevant updates. You can disable
          notifications at any time in your device settings. We store your push token
          associated with your email address solely for delivering notifications.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-white mb-3">Data retention</h2>
        <p className="text-gray-400 leading-relaxed">
          We retain your email and account information for as long as your account is active.
          You may request deletion at any time by emailing{" "}
          <a href="mailto:hello@cheapakiya.com" className="text-orange-400 underline">hello@cheapakiya.com</a>.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-white mb-3">Your rights</h2>
        <p className="text-gray-400 leading-relaxed">
          You have the right to access, correct, or delete your personal data. To exercise
          these rights, contact us at{" "}
          <a href="mailto:hello@cheapakiya.com" className="text-orange-400 underline">hello@cheapakiya.com</a>.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-white mb-3">Cookies</h2>
        <p className="text-gray-400 leading-relaxed">
          We use minimal cookies for session management and anonymous analytics. We do not
          use advertising cookies or third-party trackers.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-white mb-3">Contact</h2>
        <p className="text-gray-400 leading-relaxed">
          Questions about this policy? Email us at{" "}
          <a href="mailto:hello@cheapakiya.com" className="text-orange-400 underline">hello@cheapakiya.com</a>.
        </p>
      </section>
    </main>
  );
}
