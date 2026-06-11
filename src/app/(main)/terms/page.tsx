import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Terms of Service | TravelStore Turkey',
    description: 'Our terms and conditions for using our website and services.',
};

export default function TermsPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12 lg:py-20">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-8">
                Terms of Service
            </h1>
            <div className="prose dark:prose-invert max-w-none space-y-8">
                <section>
                    <h2 className="text-xl font-bold mb-4">1. Agreement to Terms</h2>
                    <p>
                        These Terms of Service constitute a legally binding agreement made between you, whether
                        personally or on behalf of an entity ("you") and TravelStore Turkey ("we", "us", or "our"),
                        concerning your access to and use of our website and services.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-4">2. Services</h2>
                    <p>
                        TravelStore Turkey provides transportation services, including airport transfers, city transfers,
                        and private tours in Turkey. By booking a service with us, you agree to comply with
                        these terms and any specific conditions related to the service booked.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-4">3. Booking and Payments</h2>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                        <li>
                            <strong>Booking Confirmation:</strong> All bookings are subject to availability and confirmation.
                            A booking is considered confirmed only when you receive a confirmation email from us.
                        </li>
                        <li>
                            <strong>Payment:</strong> Payment must be made in full at the time of booking unless
                            otherwise agreed. We accept major credit cards and other payment methods as indicated on our website.
                        </li>
                        <li>
                            <strong>Cancellation Policy:</strong> Cancellations made more than 24 hours before the
                            scheduled pickup time are eligible for a full refund. Cancellations made within 24 hours
                            may be subject to a cancellation fee.
                        </li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-4">4. User Responsibilities</h2>
                    <p>
                        You agree to provide accurate and complete information when making a booking. You are responsible
                        for ensuring that you are ready at the designated pickup time and location.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-4">5. Limitation of Liability</h2>
                    <p>
                        In no event will we be liable for any direct, indirect, consequential, exemplary, incidental,
                        special, or punitive damages, including lost profit, lost revenue, loss of data, or other
                        damages arising from your use of the site or our services, even if we have been advised
                        of the possibility of such damages.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-4">6. Contact Us</h2>
                    <p>
                        If you have questions or comments about these Terms of Service, please contact us at:
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
