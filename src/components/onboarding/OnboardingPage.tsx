'use client'

import { useAuth } from '@/components/auth/AuthContext'
import { Folder, Bookmark, Store } from 'lucide-react'

export default function OnboardingPage() {
  const { signIn } = useAuth()

  const features = [
    {
      icon: <Folder className="w-12 h-12 text-blue-500" />,
      title: "My Folder",
      description: "Organize and save everything you find on the internet in one beautiful place",
      subtitle: "Your digital collection hub"
    },
    {
      icon: <Bookmark className="w-12 h-12 text-green-500" />,
      title: "Bookmarks",
      description: "Save your favorite websites and frequently visited places for quick access",
      subtitle: "Never lose a great find again"
    },
    {
      icon: <Store className="w-12 h-12 text-purple-500" />,
      title: "Market Place",
      description: "Discover curated collections from the community and share your own",
      subtitle: "Connect through shared interests"
    }
  ]

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4 py-12 bg-gray-50">
      <div className="max-w-4xl w-full text-center">
        {/* Hero Section */}
        <div className="mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-blue-600">KOOUK</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your personal lifestyle management platform. Organize, bookmark, and discover amazing content with ease.
          </p>
          
          <button
            onClick={signIn}
            className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Get Started with Google
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white rounded-lg p-8 shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              <div className="mb-6 flex justify-center">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-500 mb-4 font-medium">
                {feature.subtitle}
              </p>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="bg-white rounded-lg p-8 shadow-md">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to get organized?
          </h2>
          <p className="text-gray-600 mb-6 text-lg">
            Join thousands of users who are already managing their digital life with KOOUK
          </p>
          <button
            onClick={signIn}
            className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Sign up with Google
          </button>
        </div>
      </div>
    </div>
  )
}