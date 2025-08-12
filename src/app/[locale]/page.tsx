import AuthWrapper from '@/components/auth/AuthWrapper'

export async function generateStaticParams() {
  return [{ locale: 'ko' }, { locale: 'en' }]
}

export default function HomePage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  return <AuthWrapper />
}