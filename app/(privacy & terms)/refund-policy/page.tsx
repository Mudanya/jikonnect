
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy | JiKonnect',
  description: 'JiKonnect Refund & Cancellation Policy - Learn about our fair and transparent cancellation and refund process.',
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg">
        <div className="bg-green-600 text-white px-8 py-6 rounded-t-lg">
          <h1 className="text-3xl font-bold">Refund & Cancellation Policy</h1>
          <p className="mt-2 text-green-100">
            Powered by Linkora Digital Ltd
          </p>
          <p className="text-sm text-green-200">
            Last Updated: 12.01.2025
          </p>
        </div>

        <div className="px-8 py-6 space-y-8">
          {/* Overview */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              1. Overview
            </h2>
            <p className="text-gray-700 leading-relaxed">
              This policy ensures fair and transparent handling of cancellations and refunds on the JiKonnect platform.
            </p>
          </section>

          {/* Client Cancellations */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              2. Client Cancellations
            </h2>
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                <h3 className="font-semibold text-gray-800 mb-2">
                  ✅ More than 2 hours before booking
                </h3>
                <p className="text-gray-700">
                  <span className="font-bold">Full refund</span> (minus M-Pesa processing fees)
                </p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                <h3 className="font-semibold text-gray-800 mb-2">
                  ⚠️ Less than 2 hours before booking
                </h3>
                <p className="text-gray-700">
                  <span className="font-bold">50% refund</span>
                </p>
              </div>

              <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                <h3 className="font-semibold text-gray-800 mb-2">
                  ❌ After provider arrival or service start
                </h3>
                <p className="text-gray-700">
                  <span className="font-bold">No refund</span>
                </p>
              </div>
            </div>
          </section>

          {/* Provider Cancellations */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              3. Provider Cancellations
            </h2>
            <div className="bg-blue-50 p-6 rounded-lg">
              <p className="text-gray-700 leading-relaxed mb-3">
                If a Provider cancels a confirmed booking, the Client receives a <span className="font-bold">full refund</span>.
              </p>
              <div className="bg-white p-4 rounded border-l-4 border-blue-500 mt-3">
                <p className="text-gray-700 font-semibold">
                  ⚠️ Important for Providers:
                </p>
                <p className="text-gray-700 mt-2">
                  Frequent cancellations may result in account suspension or termination.
                </p>
              </div>
            </div>
          </section>

          {/* Service Dissatisfaction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              4. Service Dissatisfaction
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                If you're not satisfied with the service provided, you must submit evidence (photos, videos, or detailed description) within <span className="font-bold">48 hours</span> of service completion.
              </p>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-3">
                  Possible Resolutions:
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Partial refund</li>
                  <li>Service credit/voucher for future bookings</li>
                  <li>Assignment of another provider to rework the service</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                <p className="text-gray-700">
                  <span className="font-semibold">Note:</span> JiKonnect will review each case individually and make fair determinations based on the evidence provided.
                </p>
              </div>
            </div>
          </section>

          {/* Overpayments */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              5. Overpayments
            </h2>
            <p className="text-gray-700 leading-relaxed">
              If you've been charged more than the agreed amount, the overpayment will be refunded within <span className="font-bold">48-72 hours</span> after verification.
            </p>
          </section>

          {/* Non-Refundable Items */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              6. Non-Refundable Items
            </h2>
            <div className="bg-red-50 p-6 rounded-lg border-l-4 border-red-500">
              <p className="text-gray-700 font-semibold mb-3">
                The following are non-refundable:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Completed services (where no dissatisfaction was reported within 48 hours)</li>
                <li>Tips paid to providers</li>
                <li>Subscription fees</li>
                <li>Promotional or discounted bookings (unless otherwise stated)</li>
              </ul>
            </div>
          </section>

          {/* Fraud & Abuse */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              7. Fraud & Abuse Prevention
            </h2>
            <div className="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-500">
              <p className="text-gray-700 leading-relaxed">
                JiKonnect reserves the right to decline refund claims that show evidence of fraud, abuse, or attempts to exploit the refund system. This includes but is not limited to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-3">
                <li>False claims of service non-delivery</li>
                <li>Manipulated evidence</li>
                <li>Repeated fraudulent refund requests</li>
                <li>Off-platform payments to avoid fees</li>
              </ul>
            </div>
          </section>

          {/* Refund Processing */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              8. Refund Processing
            </h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Payment Method:
                  </h3>
                  <p className="text-gray-700">
                    Refunds are issued via the original payment method (M-Pesa).
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Processing Time:
                  </h3>
                  <p className="text-gray-700">
                    Refunds are processed within <span className="font-bold">48-72 hours</span> of approval.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Transaction Fees:
                  </h3>
                  <p className="text-gray-700">
                    M-Pesa transaction fees are non-refundable and will be deducted from the refund amount where applicable.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Disputes */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              9. Dispute Resolution
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                If you disagree with a refund decision, you may escalate the matter through the following process:
              </p>

              <div className="bg-gray-50 p-4 rounded-lg">
                <ol className="list-decimal list-inside space-y-3 text-gray-700 ml-4">
                  <li>
                    <span className="font-semibold">Internal Support:</span> Contact our support team at{' '}
                    <a href="mailto:support@jikonnect.co.ke" className="text-green-600 hover:underline">
                      support@jikonnect.co.ke
                    </a>
                  </li>
                  <li>
                    <span className="font-semibold">Mediation:</span> If unresolved, the dispute will be handled through internal mediation
                  </li>
                  <li>
                    <span className="font-semibold">Arbitration/Court:</span> As a last resort, disputes may be resolved through arbitration or courts under Kenyan law
                  </li>
                </ol>
              </div>
            </div>
          </section>

          {/* How to Request a Refund */}
          <section className="bg-blue-50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              10. How to Request a Refund
            </h2>
            <div className="space-y-3">
              <p className="text-gray-700 leading-relaxed">
                To request a refund, follow these steps:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>Log in to your JiKonnect account</li>
                <li>Navigate to "My Bookings" or "Order History"</li>
                <li>Select the booking you wish to request a refund for</li>
                <li>Click "Request Refund" and provide the required details</li>
                <li>Submit supporting evidence if applicable</li>
              </ol>
              <p className="text-gray-700 leading-relaxed mt-4">
                Alternatively, contact our support team directly at:{' '}
                <a href="mailto:support@jikonnect.co.ke" className="text-green-600 hover:underline font-semibold">
                  support@jikonnect.co.ke
                </a>
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="border-t pt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              11. Contact Us
            </h2>
            <div className="bg-gray-50 p-6 rounded-lg space-y-3">
              <p className="text-gray-700">
                For questions or concerns about refunds and cancellations:
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Email:</span>{' '}
                <a href="mailto:support@jikonnect.co.ke" className="text-green-600 hover:underline">
                  support@jikonnect.co.ke
                </a>
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Phone:</span>{' '}
                <a href="tel:+254792480522" className="text-green-600 hover:underline">
                  +254 792 480 522
                </a>
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Company:</span> Linkora Digital Ltd, Nairobi
              </p>
            </div>
          </section>

          {/* Related Policies */}
          <section className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Related Policies
            </h3>
            <div className="space-y-2">
              <a 
                href="/terms" 
                className="block text-green-600 hover:text-green-800 font-semibold hover:underline"
              >
                → Terms & Conditions
              </a>
              <a 
                href="/privacy-policy" 
                className="block text-green-600 hover:text-green-800 font-semibold hover:underline"
              >
                → Privacy Policy
              </a>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 px-8 py-4 rounded-b-lg">
          <p className="text-sm text-gray-600 text-center">
            Last Updated: 12.01.2025 | Powered by Linkora Digital Ltd
          </p>
        </div>
      </div>
    </div>
  );
}