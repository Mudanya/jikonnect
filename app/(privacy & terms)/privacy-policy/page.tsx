// app/privacy-policy/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | JiKonnect',
  description: 'JiKonnect Privacy Policy - Learn how we collect, use, and protect your personal data in compliance with Kenya Data Protection Act 2019.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg">
        <div className="bg-blue-600 text-white px-8 py-6 rounded-t-lg">
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
          <p className="mt-2 text-blue-100">
            Powered by Linkora Digital Ltd
          </p>
          <p className="text-sm text-blue-200">
            Last Updated: 12.01.2025
          </p>
        </div>

        <div className="px-8 py-6 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              1. Introduction
            </h2>
            <p className="text-gray-700 leading-relaxed">
              JiKonnect respects your privacy and handles data per the Kenya Data Protection Act (2019) and ODPC guidelines.
            </p>
          </section>

          {/* Data We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              2. Data We Collect
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  2.1 Clients
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Full name</li>
                  <li>Phone number</li>
                  <li>Email address</li>
                  <li>Service location</li>
                  <li>Booking details</li>
                  <li>Payment confirmation</li>
                  <li>Reviews & ratings</li>
                  <li>Profile image/photo uploaded at signup</li>
                  <li>Any optional data voluntarily provided</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  2.2 Service Providers
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Full name</li>
                  <li>National ID number (KYC)</li>
                  <li>Phone & email</li>
                  <li>Physical location</li>
                  <li>Skills & qualifications</li>
                  <li>Certificates or licenses</li>
                  <li>Background-check data</li>
                  <li>Profile photo/headshot</li>
                  <li>Next-of-kin details (optional)</li>
                  <li>Portfolio photos</li>
                  <li>Payment details (M-Pesa/bank)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  2.3 Sensitive Personal Data
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  JiKonnect does not collect sensitive data unless absolutely required. However, for categories like caregiving, JiKonnect may process limited health-related information only when needed and with explicit consent.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  2.4 Automatically Collected Data
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>IP address</li>
                  <li>Device information</li>
                  <li>Browser type</li>
                  <li>Usage logs</li>
                  <li>Cookies</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  2.5 Media Data
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Images or videos uploaded by Providers to document work</li>
                  <li>Voice or video recordings if communication features are introduced</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Personal Data */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              3. How We Use Personal Data
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  3.1 Platform Operations
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Account creation</li>
                  <li>Identity verification</li>
                  <li>Provider vetting</li>
                  <li>Booking management</li>
                  <li>Payment processing</li>
                  <li>Notifications & receipts</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  3.2 Trust & Safety
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Fraud detection & security monitoring</li>
                  <li>Maintaining audit logs</li>
                  <li>Assessing provider eligibility</li>
                  <li>Generating a Provider Trust Score based on:
                    <ul className="list-circle list-inside ml-6 mt-2 space-y-1">
                      <li>ID verification</li>
                      <li>Background checks</li>
                      <li>Ratings</li>
                      <li>Completion rate</li>
                    </ul>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  3.3 Marketing & Communications
                </h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  JiKonnect may use data to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Send job alerts (Providers)</li>
                  <li>Send service updates (Clients)</li>
                  <li>Notify users about changes</li>
                  <li>Promote new features</li>
                  <li>Send training opportunities</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-3 italic">
                  Users may opt out of marketing but not safety or operational messages.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  3.4 Anonymized Data Use
                </h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  JiKonnect may anonymize and aggregate data for:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Market analysis</li>
                  <li>Product improvement</li>
                  <li>Business insights</li>
                  <li>Reporting</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-3 italic">
                  Anonymized data is not personal data and may be shared with partners.
                </p>
              </div>
            </div>
          </section>

          {/* Lawful Basis */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              4. Lawful Basis for Processing
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Consent</li>
              <li>Contract performance</li>
              <li>Legal obligation</li>
              <li>Legitimate interest</li>
            </ul>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              5. Data Sharing
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              JiKonnect shares data with:
            </p>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">
                  5.1 Service Providers
                </h3>
                <p className="text-gray-700">
                  Clients see only necessary details.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">
                  5.2 Payment Partners (e.g., M-Pesa)
                </h3>
                <p className="text-gray-700">
                  Limited to payment processing data.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">
                  5.3 Verification Partners
                </h3>
                <p className="text-gray-700 mb-2">Example categories:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>ID verification firms</li>
                  <li>Background-check agencies</li>
                </ul>
                <p className="text-gray-700 mt-2 text-sm italic">
                  They receive only the minimum necessary data (e.g., name, ID number).
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">
                  5.4 Hosting & Analytics Partners
                </h3>
                <p className="text-gray-700">
                  For infrastructure and service improvement.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">
                  5.5 Government/ODPC
                </h3>
                <p className="text-gray-700">
                  If legally required.
                </p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
              <p className="text-gray-800 font-semibold">
                JiKonnect does not sell personal data.
              </p>
            </div>
          </section>

          {/* Security */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              6. Security
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              JiKonnect implements:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Encryption</li>
              <li>Secure cloud storage</li>
              <li>Access controls</li>
              <li>Security audits</li>
              <li>Incident response processes</li>
            </ul>

            <div className="mt-4 bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">
                Employee Data Protection Training
              </h3>
              <p className="text-gray-700">
                Access to Personal Data is restricted to authorized staff who:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-2">
                <li>Undergo mandatory data protection training</li>
                <li>Are bound by confidentiality agreements</li>
              </ul>
            </div>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              7. Data Retention
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Data is retained only as long as necessary for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Legal requirements</li>
              <li>Financial audits (minimum 5 years)</li>
              <li>Fraud prevention</li>
              <li>Operational purposes</li>
            </ul>
          </section>

          {/* User Rights */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              8. Your Rights
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Under Kenya Data Protection Act, you have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Access your data</li>
              <li>Rectify inaccuracies</li>
              <li>Restrict Processing</li>
              <li>Request deletion</li>
              <li>Object to processing</li>
              <li>Request portability</li>
              <li>Withdraw consent</li>
            </ul>

            <div className="mt-4 bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
              <h3 className="font-semibold text-gray-800 mb-2">
                Deletion Limitations
              </h3>
              <p className="text-gray-700 mb-2">
                Deletion may be restricted due to:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>Legal retention (e.g., financial audits, 5+ years)</li>
                <li>Preventing fraud</li>
                <li>Dispute resolution</li>
              </ul>
            </div>

            <div className="mt-4 bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">
                Rights Request Process
              </h3>
              <p className="text-gray-700">
                All rights requests must be sent to:{' '}
                <a href="mailto:privacy@jikonnect.co.ke" className="text-blue-600 hover:underline font-semibold">
                  privacy@jikonnect.co.ke
                </a>
              </p>
              <p className="text-gray-600 text-sm mt-2">
                Response time: within 21-30 days.
              </p>
            </div>
          </section>

          {/* Children's Data */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              9. Children's Data
            </h2>
            <p className="text-gray-700 leading-relaxed">
              No data is collected from minors under 18.
            </p>
          </section>

          {/* Cross-Border Transfers */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              10. Cross-Border Transfers
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              JiKonnect may store data outside Kenya. Example: hosting in Ireland (EU).
            </p>
            <p className="text-gray-700 leading-relaxed mb-3">
              Safeguard mechanisms include:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Standard Contractual Clauses (SCCs)</li>
              <li>Binding Corporate Rules (BCRs)</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3 italic">
              Compliant with ODPC requirements.
            </p>
          </section>

          {/* Breach Notification */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              11. Breach Notification
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              If a breach occurs, JiKonnect will notify:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>ODPC</li>
              <li>Affected users</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3 mb-3">
              Notification will include:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Nature of the breach</li>
              <li>Measures taken</li>
              <li>What users can do to protect themselves</li>
            </ul>
          </section>

          {/* Contact */}
          <section className="border-t pt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              12. Contact Us
            </h2>
            <div className="bg-gray-50 p-6 rounded-lg space-y-3">
              <p className="text-gray-700">
                <span className="font-semibold">Email:</span>{' '}
                <a href="mailto:privacy@jikonnect.co.ke" className="text-blue-600 hover:underline">
                  privacy@jikonnect.co.ke
                </a>
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Company:</span> Linkora Digital Ltd, Nairobi
              </p>
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