import Link from 'next/link'

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto responsive-p-md py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="responsive-text-3xl font-bold mb-8">Cookie Policy</h1>
          <div className="text-gray-400 text-sm mb-6">Last updated: January 28, 2025</div>
          
          <div className="space-y-8 responsive-text-base leading-relaxed">
            <section>
              <h2 className="responsive-text-xl font-semibold text-white mb-4">What Are Cookies?</h2>
              <p className="text-gray-300">
                Cookies are small text files that are placed on your computer or mobile device 
                when you visit a website. They are widely used to make websites work more 
                efficiently and provide information to website owners.
              </p>
            </section>

            <section>
              <h2 className="responsive-text-xl font-semibold text-white mb-4">How We Use Cookies</h2>
              <p className="text-gray-300 mb-4">
                Koouk uses cookies for the following purposes:
              </p>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-green-400 mb-3">🔧 Essential Cookies (Required)</h3>
                  <div className="bg-gray-900 p-4 rounded-lg">
                    <p className="text-gray-300 mb-3">
                      These cookies are necessary for the website to function properly:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-400">
                      <li><strong>NextAuth.js Session:</strong> Maintains your login status</li>
                      <li><strong>CSRF Protection:</strong> Prevents cross-site request forgery</li>
                      <li><strong>User Preferences:</strong> Stores your plan selection and settings</li>
                    </ul>
                    <p className="text-green-400 text-sm mt-3">
                      ✓ These cookies cannot be disabled as they are essential for service functionality.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-blue-400 mb-3">📊 Analytics Cookies (Optional)</h3>
                  <div className="bg-gray-900 p-4 rounded-lg">
                    <p className="text-gray-300 mb-3">
                      These cookies help us understand how visitors use our website:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-400">
                      <li><strong>Google Analytics:</strong> Tracks page views, user behavior, and demographics</li>
                      <li><strong>Vercel Analytics:</strong> Monitors website performance and loading times</li>
                    </ul>
                    <p className="text-blue-400 text-sm mt-3">
                      ⚙️ You can opt-out of these cookies through our cookie banner.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="responsive-text-xl font-semibold text-white mb-4">Cookie Details</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-700">
                  <thead>
                    <tr className="bg-gray-800">
                      <th className="border border-gray-700 p-3 text-left">Cookie Name</th>
                      <th className="border border-gray-700 p-3 text-left">Purpose</th>
                      <th className="border border-gray-700 p-3 text-left">Duration</th>
                      <th className="border border-gray-700 p-3 text-left">Type</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    <tr>
                      <td className="border border-gray-700 p-3 font-mono text-sm">next-auth.session-token</td>
                      <td className="border border-gray-700 p-3">User authentication</td>
                      <td className="border border-gray-700 p-3">30 days</td>
                      <td className="border border-gray-700 p-3"><span className="text-green-400">Essential</span></td>
                    </tr>
                    <tr>
                      <td className="border border-gray-700 p-3 font-mono text-sm">next-auth.csrf-token</td>
                      <td className="border border-gray-700 p-3">Security protection</td>
                      <td className="border border-gray-700 p-3">Session</td>
                      <td className="border border-gray-700 p-3"><span className="text-green-400">Essential</span></td>
                    </tr>
                    <tr>
                      <td className="border border-gray-700 p-3 font-mono text-sm">koouk_user_plan</td>
                      <td className="border border-gray-700 p-3">Store user plan preference</td>
                      <td className="border border-gray-700 p-3">Persistent</td>
                      <td className="border border-gray-700 p-3"><span className="text-green-400">Essential</span></td>
                    </tr>
                    <tr>
                      <td className="border border-gray-700 p-3 font-mono text-sm">_ga, _ga_*</td>
                      <td className="border border-gray-700 p-3">Google Analytics tracking</td>
                      <td className="border border-gray-700 p-3">2 years</td>
                      <td className="border border-gray-700 p-3"><span className="text-blue-400">Analytics</span></td>
                    </tr>
                    <tr>
                      <td className="border border-gray-700 p-3 font-mono text-sm">va-*</td>
                      <td className="border border-gray-700 p-3">Vercel Analytics</td>
                      <td className="border border-gray-700 p-3">1 year</td>
                      <td className="border border-gray-700 p-3"><span className="text-blue-400">Analytics</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="responsive-text-xl font-semibold text-white mb-4">Managing Your Cookie Preferences</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-200 mb-2">Cookie Banner</h3>
                  <p className="text-gray-300">
                    When you first visit Koouk, you&apos;ll see a cookie banner asking for your consent 
                    for optional analytics cookies. You can accept or decline these at any time.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-200 mb-2">Browser Settings</h3>
                  <p className="text-gray-300 mb-3">
                    You can also control cookies through your browser settings:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-400">
                    <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
                    <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
                    <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
                    <li><strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data</li>
                  </ul>
                </div>
                <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-4">
                  <h3 className="font-medium text-yellow-400 mb-2">⚠️ Important Note</h3>
                  <p className="text-yellow-200 text-sm">
                    Disabling essential cookies may prevent Koouk from functioning properly. 
                    You may not be able to log in or save your preferences if essential cookies are blocked.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="responsive-text-xl font-semibold text-white mb-4">Third-Party Cookies</h2>
              <p className="text-gray-300 mb-4">
                Some cookies on Koouk are set by third-party services:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li><strong>Google:</strong> For authentication (OAuth) and analytics</li>
                <li><strong>Vercel:</strong> For performance monitoring and analytics</li>
              </ul>
              <p className="text-gray-300 mt-4">
                These third parties have their own privacy policies and cookie policies, 
                which you can review on their respective websites.
              </p>
            </section>

            <section>
              <h2 className="responsive-text-xl font-semibold text-white mb-4">Updates to This Policy</h2>
              <p className="text-gray-300">
                We may update this Cookie Policy from time to time to reflect changes in our 
                practices or for other operational, legal, or regulatory reasons. 
                Please revisit this page regularly to stay informed about our use of cookies.
              </p>
            </section>

            <section>
              <h2 className="responsive-text-xl font-semibold text-white mb-4">Contact Us</h2>
              <p className="text-gray-300">
                If you have any questions about our use of cookies, please contact us:
              </p>
              <div className="mt-4 p-4 bg-gray-900 rounded-lg">
                <p className="text-blue-400">Email: support@koouk.com</p>
                <p className="text-gray-400">Koouk Development Team</p>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800">
            <div className="flex gap-4 text-sm">
              <a href="/privacy" className="text-blue-400 hover:text-blue-300">Privacy Policy</a>
              <a href="/terms" className="text-blue-400 hover:text-blue-300">Terms of Service</a>
              <Link href="/" className="text-blue-400 hover:text-blue-300">Back to Koouk</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}