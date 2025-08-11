import { redirect } from 'next/navigation'

// Root page - redirects to locale-specific page
export default function RootPage() {
  redirect('/ko')
}