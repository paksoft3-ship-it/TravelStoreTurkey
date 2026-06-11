import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy | TravelStore Turkey',
    description: 'Our commitment to protecting your privacy and personal information.',
};

export default function PrivacyPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12 lg:py-20">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-8">
                Privacy Policy
            </h1>
            <div className="prose dark:prose-invert max-w-none space-y-8">
                <section>
                    <h2 className="text-xl font-bold mb-4">1. Introduction</h2>
                    <p>
                        At TravelStore Turkey ("we", "our", or "us"), we are committed to protecting your privacy.
                        This Privacy Policy explains how we collect, use, disclose, and safeguard your information
                        when you visit our website or use our services.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-4">2. Information We Collect</h2>
                    <p>
                        We may collect information about you in a variety of ways. The information we may collect
                        on the website includes:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                        <li>
                            <strong>Personal Data:</strong> Personally identifiable information, such as your name,
                            shipping address, email address, and telephone number, that you voluntarily give to us
                            when you register with the website or when you choose to participate in various activities
                            related to the website and our services.
                        </li>
                        <li>
                            <strong>Derivative Data:</strong> Information our servers automatically collect when you
                            access the website, such as your IP address, your browser type, your operating system,
                            your access times, and the pages you have viewed directly before and after accessing the website.
                        </li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-4">3. Use of Your Information</h2>
                    <p>
                        Having accurate information about you permits us to provide you with a smooth, efficient,
                        and customized experience. We may use information collected about you via the website to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                        <li>Create and manage your account.</li>
                        <li>Process payments and refunds.</li>
                        <li>Email you regarding your account or order.</li>
                        <li>Fulfill and manage purchases, orders, payments, and other transactions related to the website.</li>
                        <li>Respond to customer service requests and support needs.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-4">4. Contact Us</h2>
                    <p>
                        If you have questions or comments about this Privacy Policy, please contact us at:
                    </p>
                    <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <p className="font-bold">TravelStore Turkey</p>
                        <p>Sultanahmet, Fatih, 34122 Istanbul, Turkey</p>
                        <p>Email: booking@travelstoreturkey.com</p>
                        <p>Phone: +90 530 123 45 67</p>
                    </div>
                </section>

                <p className="text-sm text-slate-500 mt-12">
                    Last updated: {new Date().toLocaleDateString()}
                </p>
            </div>
        </div>
    );
}
