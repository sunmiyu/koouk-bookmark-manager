import Link from 'next/link'

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto responsive-p-md py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="responsive-text-3xl font-bold mb-8">Terms of Service</h1>
          <div className="text-gray-400 text-sm mb-6">Last updated: January 28, 2025</div>
          
          <div className="space-y-8 responsive-text-base leading-relaxed">
            <section>
              <h2 className="responsive-text-xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-300">
                By accessing and using Koouk (&quot;the Service&quot;), you accept and agree to be bound by 
                the terms and provision of this agreement. If you do not agree to abide by the 
                above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="responsive-text-xl font-semibold text-white mb-4">2. Description of Service</h2>
              <p className="text-gray-300 mb-4">
                Koouk is a personal life hub that provides:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>Bookmark management for videos, links, images, and notes</li>
                <li>Todo and task management</li>
                <li>Mini Functions for daily life assistance</li>
                <li>Real-time weather and personal dashboard</li>
                <li>Cross-device synchronization</li>
              </ul>
            </section>

            <section>
              <h2 className="responsive-text-xl font-semibold text-white mb-4">3. User Accounts</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-200 mb-2">Account Creation</h3>
                  <p className="text-gray-300">
                    You must create an account using Google OAuth to use Koouk. 
                    You are responsible for maintaining the security of your account.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-200 mb-2">Account Responsibility</h3>
                  <p className="text-gray-300">
                    You are responsible for all activities that occur under your account. 
                    You must immediately notify us of any unauthorized use of your account.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="responsive-text-xl font-semibold text-white mb-4">4. Acceptable Use</h2>
              <p className="text-gray-300 mb-4">You agree not to:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>Use the service for any illegal or unauthorized purpose</li>
                <li>Store or share harmful, offensive, or inappropriate content</li>
                <li>Attempt to gain unauthorized access to the service or other users&apos; accounts</li>
                <li>Interfere with or disrupt the service or servers</li>
                <li>Use automated tools to access the service without permission</li>
                <li>Violate any laws in your jurisdiction</li>
              </ul>
            </section>

            <section>
              <h2 className="responsive-text-xl font-semibold text-white mb-4">5. Subscription Plans</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-200 mb-2">Plan Types</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-300">
                    <li><strong>Free Plan:</strong> Limited storage (50 items per type)</li>
                    <li><strong>Pro Plan:</strong> Enhanced storage (500 items) + 2 Mini Functions</li>
                    <li><strong>Premium Plan:</strong> Unlimited storage + 4 Mini Functions</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-200 mb-2">Billing</h3>
                  <p className="text-gray-300">
                    Subscription fees are billed monthly. You can cancel your subscription 
                    at any time. Refunds are provided according to our refund policy.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="responsive-text-xl font-semibold text-white mb-4">6. Content and Data</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-200 mb-2">Your Content</h3>
                  <p className="text-gray-300">
                    You retain ownership of all content you create and store in Koouk. 
                    You are responsible for ensuring you have the right to store and share any content.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-200 mb-2">Data Backup</h3>
                  <p className="text-gray-300">
                    While we implement backup procedures, you are responsible for maintaining 
                    your own backups of important data.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="responsive-text-xl font-semibold text-white mb-4">7. Service Availability</h2>
              <p className="text-gray-300">
                We strive to maintain high service availability, but we do not guarantee 
                uninterrupted service. We may temporarily suspend service for maintenance, 
                updates, or other operational reasons.
              </p>
            </section>

            <section>
              <h2 className="responsive-text-xl font-semibold text-white mb-4">8. Limitation of Liability</h2>
              <p className="text-gray-300">
                Koouk and its developers shall not be liable for any indirect, incidental, 
                special, consequential, or punitive damages, including but not limited to 
                loss of data, loss of profits, or business interruption.
              </p>
            </section>

            <section>
              <h2 className="responsive-text-xl font-semibold text-white mb-4">9. Termination</h2>
              <p className="text-gray-300">
                You may terminate your account at any time. We may terminate or suspend 
                your account if you violate these terms. Upon termination, your data 
                will be deleted according to our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="responsive-text-xl font-semibold text-white mb-4">10. Changes to Terms</h2>
              <p className="text-gray-300">
                We reserve the right to modify these terms at any time. 
                We will notify users of significant changes via email or service notification. 
                Continued use of the service constitutes acceptance of modified terms.
              </p>
            </section>

            <section>
              <h2 className="responsive-text-xl font-semibold text-white mb-4">11. Governing Law</h2>
              <p className="text-gray-300">
                These terms shall be governed by and construed in accordance with the laws 
                of the Republic of Korea, without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="responsive-text-xl font-semibold text-white mb-4">12. Contact Information</h2>
              <p className="text-gray-300">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="mt-4 p-4 bg-gray-900 rounded-lg">
                <p className="text-blue-400">Email: support@koouk.com</p>
                <p className="text-gray-400">Koouk Development Team</p>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800">
            <div className="flex gap-4 text-sm">
              <a href="/en/privacy" className="text-blue-400 hover:text-blue-300">Privacy Policy</a>
              <a href="/en/cookies" className="text-blue-400 hover:text-blue-300">Cookie Policy</a>
              <Link href="/" className="text-blue-400 hover:text-blue-300">Back to Koouk</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}