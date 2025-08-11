import { redirect } from 'next/navigation'

export default function RootPage() {
  // 루트 경로 접근 시 기본 로케일(한국어)로 리다이렉트
  redirect('/ko')
}