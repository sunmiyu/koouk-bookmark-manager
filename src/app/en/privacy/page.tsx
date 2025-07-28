import Link from 'next/link'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto responsive-p-md py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="responsive-text-3xl font-bold mb-8">Privacy Policy</h1>
          <div className="text-gray-400 text-sm mb-6">Last updated: January 28, 2025</div>
          
          <div className="space-y-8 responsive-text-base leading-relaxed">
            <section>
              <h2 className="responsive-text-xl font-semibold text-white mb-4">1. Information We Collect</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-200 mb-2">Google Account Information</h3>
                  <p className="text-gray-300">
                    When you sign in with Google, we collect:
                  </p>
                  <ul className="list-disc list-inside mt-2 text-gray-400 space-y-1">
                    <li>Email address</li>
                    <li>Name</li>
                    <li>Profile picture</li>
                    <li>Google user ID</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-200 mb-2">Service Usage Data</h3>
                  <p className="text-gray-300">
                    Content you create and store in Koouk:
                  </p>
                  <ul className="list-disc list-inside mt-2 text-gray-400 space-y-1">
                    <li>Bookmarks (videos, links, images, notes)</li>
                    <li>Todo items and schedules</li>
                    <li>Personal preferences and settings</li>
                    <li>Mini Functions selections and data</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="responsive-text-xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>Provide and maintain the Koouk service</li>
                <li>Authenticate and identify users</li>
                <li>Store and sync your personal data across devices</li>
                <li>Improve our service through analytics</li>
                <li>Send important service updates (with your consent)</li>
              </ul>
            </section>

            <section>
              <h2 className="responsive-text-xl font-semibold text-white mb-4">3. Data Storage and Security</h2>
              <p className="text-gray-300 mb-4">
                Your data is stored securely and protected by:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>Google OAuth authentication</li>
                <li>Encrypted data transmission (HTTPS)</li>
                <li>Regular security updates and monitoring</li>
                <li>Limited access to authorized personnel only</li>
              </ul>
            </section>

            <section>
              <h2 className="responsive-text-xl font-semibold text-white mb-4">4. Data Retention</h2>
              <p className="text-gray-300">
                We retain your personal information for as long as your account is active. 
                When you delete your account, we immediately delete all associated data 
                except where required by law to retain certain information.
              </p>
            </section>

            <section>
              <h2 className="responsive-text-xl font-semibold text-white mb-4">5. Your Rights</h2>
              <p className="text-gray-300 mb-4">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Delete your account and all data</li>
                <li>Export your data</li>
                <li>Withdraw consent for data processing</li>
              </ul>
            </section>

            <section>
              <h2 className="responsive-text-xl font-semibold text-white mb-4">6. Cookies and Analytics</h2>
              <p className="text-gray-300 mb-4">
                We use cookies for:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>Essential: Maintaining your login session</li>
                <li>Analytics: Google Analytics (with your consent)</li>
                <li>Performance: Vercel Analytics for service improvement</li>
              </ul>
              <p className="text-gray-300 mt-4">
                You can control cookie preferences in your browser settings.
              </p>
            </section>

            <section>
              <h2 className="responsive-text-xl font-semibold text-white mb-4">7. International Data Transfers</h2>
              <p className="text-gray-300">
                Your data may be processed in countries other than your own. 
                We ensure adequate protection through appropriate safeguards and 
                compliance with applicable data protection laws.
              </p>
            </section>

            <section>
              <h2 className="responsive-text-xl font-semibold text-white mb-4">8. Changes to This Policy</h2>
              <p className="text-gray-300">
                We may update this Privacy Policy from time to time. 
                We will notify you of any changes by posting the new policy on this page 
                and updating the &quot;Last updated&quot; date.
              </p>
            </section>

            <section>
              <h2 className="responsive-text-xl font-semibold text-white mb-4">9. Contact Us</h2>
              <p className="text-gray-300">
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <div className="mt-4 p-4 bg-gray-900 rounded-lg">
                <p className="text-blue-400">Email: support@koouk.com</p>
                <p className="text-gray-400">Koouk Development Team</p>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800">
            <div className="flex gap-4 text-sm">
              <a href="/en/terms" className="text-blue-400 hover:text-blue-300">Terms of Service</a>
              <a href="/en/cookies" className="text-blue-400 hover:text-blue-300">Cookie Policy</a>
              <Link href="/" className="text-blue-400 hover:text-blue-300">Back to Koouk</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}