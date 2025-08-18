'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs">Back to Koouk</span>
            </Link>
            <div className="h-4 w-px bg-gray-300" />
            <h1 className="text-sm font-semibold text-gray-900">Privacy Policy</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="prose prose-sm max-w-none">
          <div className="mb-6">
            <h1 className="text-lg font-bold text-gray-900 mb-2">Privacy Policy</h1>
            <p className="text-xs text-gray-600">Last Updated: January 2024</p>
          </div>

          <section className="mb-8">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">1. Purpose of Personal Information Processing</h2>
            <div className="text-xs text-gray-700 space-y-2">
              <p>Koouk (&apos;https://koouk.im&apos;) processes personal information for the following purposes and does not use it for any other purposes.</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Member registration confirmation and identification/authentication for membership services</li>
                <li>Providing personalized services</li>
                <li>Preventing unauthorized use of services</li>
                <li>Various notifications and grievance handling</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">2. Personal Information Processing and Retention Period</h2>
            <div className="text-xs text-gray-700 space-y-2">
              <p>① Koouk processes and retains personal information within the personal information retention and usage period agreed upon when collecting personal information from data subjects or within the retention period prescribed by law.</p>
              <p>② Specific personal information processing and retention periods are as follows:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>Member registration and management:</strong> Until service agreement termination or membership withdrawal</li>
                <li><strong>Service provision:</strong> From service agreement conclusion to service agreement termination</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">3. Personal Information Items Processed</h2>
            <div className="text-xs text-gray-700 space-y-2">
              <p>① Koouk processes the following personal information items:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>Required items:</strong> Email address, service usage records</li>
                <li><strong>Optional items:</strong> Profile information</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">4. Third Party Provision of Personal Information</h2>
            <div className="text-xs text-gray-700 space-y-2">
              <p>① Koouk provides personal information to third parties only in cases corresponding to Articles 17 and 18 of the Personal Information Protection Act, such as data subject consent or special provisions of law.</p>
              <p>② Koouk does not, in principle, provide users&apos; personal information to external parties.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">5. Outsourcing of Personal Information Processing</h2>
            <div className="text-xs text-gray-700 space-y-2">
              <p>① Koouk outsources personal information processing tasks as follows for smooth personal information processing:</p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p><strong>Supabase Inc.</strong></p>
                <p>Outsourced tasks: Cloud services and database management</p>
                <p>Outsourcing period: From service agreement conclusion to termination</p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">6. Rights and Obligations of Data Subjects</h2>
            <div className="text-xs text-gray-700 space-y-2">
              <p>① Data subjects may exercise the following personal information protection rights against Koouk at any time:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Request for notification of personal information processing status</li>
                <li>Request for suspension of personal information processing</li>
                <li>Request for correction and deletion of personal information</li>
                <li>Request for damages compensation</li>
              </ul>
              <p>② To exercise these rights, please contact us at support@koouk.im.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">7. Personal Information Security Measures</h2>
            <div className="text-xs text-gray-700 space-y-2">
              <p>Koouk implements the following technical, administrative, and physical measures necessary for security in accordance with Article 29 of the Personal Information Protection Act:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Minimization and education of personal information handling staff</li>
                <li>Access restrictions to personal information</li>
                <li>Encryption of personal information</li>
                <li>Technical measures against hacking and other threats</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">8. Personal Information Protection Officer</h2>
            <div className="text-xs text-gray-700 space-y-2">
              <p>① Koouk designates a personal information protection officer as follows to oversee personal information processing and handle data subject complaints and damage relief:</p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p><strong>Personal Information Protection Officer</strong></p>
                <p>Email: support@koouk.im</p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">9. Changes to Privacy Policy</h2>
            <div className="text-xs text-gray-700 space-y-2">
              <p>① This privacy policy applies from the effective date, and if there are additions, deletions, or corrections to changes according to laws and policies, we will notify you through announcements 7 days before the implementation of the changes.</p>
            </div>
          </section>

          <div className="mt-12 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              If you have any questions, please contact us at <a href="mailto:support@koouk.im" className="text-blue-600 hover:underline">support@koouk.im</a>.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}