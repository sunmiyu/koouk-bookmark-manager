'use client'

import React from 'react'
import { ArrowRight, Search, Folder, Share2, Zap } from 'lucide-react'
import { useAuth } from './auth/AuthContext'

export default function LandingPage() {
  const { signIn, loading } = useAuth()

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="page-header">
        <div className="container">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-accent text-accent-foreground rounded flex items-center justify-center font-bold">
                K
              </div>
              <span className="text-xl font-semibold">Koouk</span>
            </div>
            
            <button 
              onClick={signIn}
              disabled={loading}
              className="btn-primary flex items-center space-x-2"
            >
              {loading ? (
                <div className="spinner" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-primary">
            Personal Knowledge
            <br />
            <span className="text-secondary">Management</span>
          </h1>
          
          <p className="text-xl text-secondary mb-12 max-w-2xl mx-auto">
            Store, organize, and find your information effortlessly. 
            From notes to links, everything in one place.
          </p>
          
          <button 
            onClick={signIn}
            disabled={loading}
            className="btn-primary text-lg px-8 py-3 flex items-center space-x-3 mx-auto"
          >
            {loading ? (
              <>
                <div className="spinner" />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <span>Get Started Free</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
          
          <p className="text-sm text-muted mt-4">
            No credit card required • Free forever plan
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-surface">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-16 text-primary">
            Everything you need to stay organized
          </h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            <FeatureCard
              icon={<Folder className="w-8 h-8" />}
              title="Smart Organization"
              description="Organize content in folders and subfolders. Automatic categorization keeps everything structured."
            />
            
            <FeatureCard
              icon={<Search className="w-8 h-8" />}
              title="Powerful Search"
              description="Find anything instantly with intelligent search across all your content, notes, and links."
            />
            
            <FeatureCard
              icon={<Share2 className="w-8 h-8" />}
              title="Share & Discover"
              description="Share your knowledge with others and discover curated collections from the community."
            />
            
            <FeatureCard
              icon={<Zap className="w-8 h-8" />}
              title="Quick Capture"
              description="Save anything instantly with our universal input bar. Links, notes, images - all supported."
            />
            
            <FeatureCard
              icon={<div className="w-8 h-8 rounded bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold">∞</div>}
              title="Cross-Platform"
              description="Access your knowledge anywhere. Works on desktop, tablet, and mobile devices."
            />
            
            <FeatureCard
              icon={<div className="w-8 h-8 rounded bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold">⚡</div>}
              title="Lightning Fast"
              description="Built for speed. No lag, no waiting. Your information is always just a click away."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-6 text-primary">
            Ready to organize your knowledge?
          </h2>
          
          <p className="text-lg text-secondary mb-8 max-w-xl mx-auto">
            Join thousands of people who have transformed how they manage information.
          </p>
          
          <button 
            onClick={signIn}
            disabled={loading}
            className="btn-primary text-lg px-8 py-3 flex items-center space-x-3 mx-auto"
          >
            {loading ? (
              <>
                <div className="spinner" />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <span>Start Organizing Today</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-default">
        <div className="container">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-accent text-accent-foreground rounded flex items-center justify-center font-bold text-sm">
                K
              </div>
              <span className="font-semibold">Koouk</span>
            </div>
            
            <p className="text-sm text-muted">
              © 2024 Personal Knowledge Management
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode
  title: string
  description: string 
}) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center mb-4 text-accent">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3 text-primary">{title}</h3>
      <p className="text-secondary leading-relaxed">{description}</p>
    </div>
  )
}