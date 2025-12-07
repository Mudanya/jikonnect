// app/terms/page.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | JiKonnect",
  description:
    "JiKonnect Terms & Conditions - Understand the terms of service for using our platform to connect with service providers.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className=" bg-white shadow-lg rounded-lg">
        <div className="bg-indigo-600 text-white px-8 py-6 rounded-t-lg">
          <h1 className="text-3xl font-bold">Terms & Conditions</h1>
          <p className="mt-2 text-indigo-100">Powered by Linkora Digital Ltd</p>
          <p className="text-sm text-indigo-200">Last Updated: 12.01.2025</p>
        </div>

        <div className="px-8 py-6 space-y-8">
          {/* Acceptance of Terms */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-700 leading-relaxed">
              By creating an account, accessing, or using the JiKonnect
              platform, you agree to be bound by these Terms & Conditions, our
              Privacy Policy, and any additional guidelines or policies we
              publish. If you do not agree, discontinue use immediately.
            </p>
          </section>

          {/* About JiKonnect */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              2. About JiKonnect
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              JiKonnect is a digital service marketplace operated by Linkora
              Digital Ltd. The platform connects Clients with independent
              Providers offering home, commercial, skilled, and care services.
            </p>
            <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
              <p className="text-gray-800 font-semibold">
                Important: JiKonnect is not the employer, agent, or
                representative of Providers.
              </p>
            </div>
          </section>

          {/* Eligibility */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              3. Eligibility
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Users must be 18+ years old and legally able to enter binding
              contracts. Some categories (e.g., caregiving) require additional
              screening.
            </p>
          </section>

          {/* Registration & Accounts */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              4. Registration & Accounts
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Users must provide accurate information</li>
              <li>JiKonnect may verify identity (KYC)</li>
              <li>Users are responsible for safeguarding login credentials</li>
              <li>
                JiKonnect may suspend or terminate accounts for fraud, abuse,
                misconduct, or policy violations
              </li>
            </ul>
          </section>

          {/* Nature of Services */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              5. Nature of Services
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Providers are independent contractors responsible for their work
              quality, compliance, and taxes.
            </p>
            <p className="text-gray-700 leading-relaxed">
              JiKonnect facilitates booking, payments, communication, and
              trust—but does not guarantee outcomes.
            </p>
          </section>

          {/* Verification & Safety */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              6. Verification & Safety
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>
                JiKonnect may perform ID checks, document verification, and
                safety vetting
              </li>
              <li>
                Verification improves trust but does not guarantee risk
                elimination
              </li>
              <li>
                JiKonnect may suspend Providers who fail safety or quality
                standards
              </li>
            </ul>
          </section>

          {/* Payments */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              7. Payments
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Payments are processed through M-Pesa and approved partners.
            </p>
            <p className="text-gray-700 leading-relaxed mb-3">JiKonnect may:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Hold funds until service completion</li>
              <li>Deduct commissions</li>
              <li>Process Provider payouts</li>
            </ul>
          </section>

          {/* Fees */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Fees</h2>
            <p className="text-gray-700 leading-relaxed">
              JiKonnect may charge commissions, subscription fees, or
              promotional fees. Fee changes will be communicated and continued
              use indicates acceptance.
            </p>
          </section>

          {/* Cancellation & Refunds */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              9. Cancellation & Refunds
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Governed by the Refund Policy. Disputes are handled fairly and
              case-by-case.
            </p>
            <div className="mt-3">
              <a
                href="/refund-policy"
                className="text-indigo-600 hover:text-indigo-800 font-semibold hover:underline"
              >
                View our Refund & Cancellation Policy →
              </a>
            </div>
          </section>

          {/* User Obligations */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              10. User Obligations
            </h2>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Clients must:
                </h3>
                <p className="text-gray-700">
                  Provide safe, accurate working environments
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Providers must:
                </h3>
                <p className="text-gray-700">
                  Deliver professional, timely services
                </p>
              </div>
            </div>
            <div className="mt-4 bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
              <p className="text-gray-800 font-semibold">
                ⚠️ Strictly Prohibited:
              </p>
              <p className="text-gray-700 mt-2">
                Off-platform communication, job-stealing, or fee avoidance is
                strictly prohibited.
              </p>
            </div>
          </section>

          {/* Liability Limitation */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              11. Liability Limitation
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              JiKonnect is not liable for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Damages</li>
              <li>Injuries</li>
              <li>Theft</li>
              <li>Losses</li>
              <li>Provider misconduct</li>
              <li>Client misconduct</li>
            </ul>
            <div className="mt-4 space-y-3">
              <p className="text-gray-700 leading-relaxed">
                Liability is limited to proven direct damages.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Liability for data breaches, misuse, or unauthorized access is
                governed by the Kenya Data Protection Act (2019). JiKonnect
                complies with all legal obligations regarding data protection,
                breach notification, and corrective action.
              </p>
            </div>
          </section>

          {/* Suspension & Termination */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              12. Suspension & Termination
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              JiKonnect may suspend or terminate accounts due to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Safety risks</li>
              <li>Fraud</li>
              <li>Misuse</li>
              <li>Policy violations</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3 italic">
              Suspensions may be temporary during investigations.
            </p>
          </section>

          {/* Disputes */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              13. Disputes
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Disputes are handled through internal mediation first, then
              arbitration or courts under Kenyan law. Data disputes may be
              escalated to the Office of the Data Protection Commissioner
              (ODPC).
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              14. Governing Law
            </h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms & Conditions are governed by Kenyan law.
            </p>
          </section>

          {/* Contact */}
          <section className="border-t pt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              15. Contact Us
            </h2>
            <div className="bg-gray-50 p-6 rounded-lg space-y-3">
              <p className="text-gray-700">
                <span className="font-semibold">Email:</span>{" "}
                <a
                  href="mailto:info@jikonnect.co.ke"
                  className="text-indigo-600 hover:underline"
                >
                  info@jikonnect.co.ke
                </a>
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Phone:</span>{" "}
                <a
                  href="tel:+254792480522"
                  className="text-indigo-600 hover:underline"
                >
                  +254 792 480 522
                </a>
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Company:</span> Linkora Digital
                Ltd, Nairobi
              </p>
            </div>
          </section>

          {/* Related Policies */}
          <section className="bg-indigo-50 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Related Policies
            </h3>
            <div className="space-y-2">
              <a
                href="/privacy-policy"
                className="block text-indigo-600 hover:text-indigo-800 font-semibold hover:underline"
              >
                → Privacy Policy
              </a>
              <a
                href="/refund-policy"
                className="block text-indigo-600 hover:text-indigo-800 font-semibold hover:underline"
              >
                → Refund & Cancellation Policy
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
