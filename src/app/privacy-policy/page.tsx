'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import Link from 'next/link'

export default function PrivacyPolicy() {
  const { language } = useLanguage()

  const content = {
    ko: {
      title: "개인정보처리방침",
      lastUpdated: "최종 업데이트: 2025년 1월 29일",
      backToHome: "홈으로 돌아가기",
      sections: {
        intro: {
          title: "1. 개인정보 수집 및 이용 목적",
          content: `Koouk는 사용자의 개인 라이프 허브 서비스를 제공하기 위해 최소한의 개인정보만을 수집합니다.

• Gmail 계정을 통한 로그인 및 사용자 인증
• 개인화된 서비스 제공 (북마크, 할일, 가계부 등)
• 서비스 개선 및 사용자 경험 향상`
        },
        collection: {
          title: "2. 수집하는 개인정보 항목",
          content: `Gmail 로그인을 통해 다음 정보를 수집합니다:
• 이메일 주소
• 프로필 이름
• 프로필 사진 (선택사항)

서비스 이용 과정에서 생성되는 정보:
• 북마크, 할일, 가계부 등 사용자가 입력한 콘텐츠
• 서비스 이용 기록`
        },
        location: {
          title: "3. 위치정보 수집 및 이용",
          content: `날씨 정보 제공을 위해 위치정보를 사용할 수 있습니다:
• 현재 위치 기반 날씨 정보 제공
• 위치정보는 로컬 브라우저에서만 처리되며 서버에 저장되지 않습니다
• 사용자는 언제든지 위치정보 제공을 거부할 수 있습니다`
        },
        storage: {
          title: "4. 개인정보 보관 및 파기",
          content: `• 개인정보는 목적 달성 시까지 보관됩니다
• 사용자가 계정을 삭제하면 즉시 개인정보가 파기됩니다
• 법적 의무가 있는 경우를 제외하고는 불필요한 개인정보를 보관하지 않습니다`
        },
        thirdParty: {
          title: "5. 제3자 제공",
          content: `수집된 개인정보는 다음의 경우를 제외하고는 제3자에게 제공되지 않습니다:
• 사용자의 명시적 동의가 있는 경우
• 법령에 의한 요구가 있는 경우
• Gmail 인증을 위한 Google과의 정보 공유 (OAuth 2.0 표준 준수)`
        },
        rights: {
          title: "6. 사용자 권리",
          content: `사용자는 다음의 권리를 가집니다:
• 개인정보 열람, 수정, 삭제 요구권
• 개인정보 처리 정지 요구권
• 손해 발생 시 손해배상 요구권

권리 행사를 원하시면 계정 설정에서 직접 수행하거나 고객지원팀에 연락해주세요.`
        },
        security: {
          title: "7. 개인정보 보호 조치",
          content: `• SSL/TLS 암호화를 통한 안전한 데이터 전송
• 정기적인 보안 점검 및 업데이트
• 접근 권한 제한 및 관리
• Supabase의 업계 표준 보안 시스템 사용`
        },
        contact: {
          title: "8. 문의처",
          content: `개인정보처리방침에 관한 문의사항이 있으시면 언제든지 연락해주세요.
피드백 버튼을 통해 문의사항을 남겨주시면 빠른 시일 내에 답변드리겠습니다.`
        }
      }
    },
    en: {
      title: "Privacy Policy",
      lastUpdated: "Last Updated: January 29, 2025",
      backToHome: "Back to Home",
      sections: {
        intro: {
          title: "1. Purpose of Personal Information Collection and Use",
          content: `Koouk collects minimal personal information to provide personal life hub services.

• Login and user authentication through Gmail account
• Personalized service provision (bookmarks, todos, expense tracking, etc.)
• Service improvement and user experience enhancement`
        },
        collection: {
          title: "2. Personal Information Items Collected",
          content: `The following information is collected through Gmail login:
• Email address
• Profile name
• Profile picture (optional)

Information generated during service use:
• User-entered content such as bookmarks, todos, expense records
• Service usage records`
        },
        location: {
          title: "3. Location Information Collection and Use",
          content: `Location information may be used to provide weather information:
• Current location-based weather information provision
• Location information is processed only in the local browser and not stored on servers
• Users can refuse to provide location information at any time`
        },
        storage: {
          title: "4. Personal Information Storage and Destruction",
          content: `• Personal information is stored until the purpose is achieved
• Personal information is immediately destroyed when users delete their accounts
• Unnecessary personal information is not retained except when legally required`
        },
        thirdParty: {
          title: "5. Third Party Provision",
          content: `Collected personal information is not provided to third parties except in the following cases:
• When explicit user consent is given
• When required by law
• Information sharing with Google for Gmail authentication (OAuth 2.0 standard compliance)`
        },
        rights: {
          title: "6. User Rights",
          content: `Users have the following rights:
• Right to request access, correction, and deletion of personal information
• Right to request suspension of personal information processing
• Right to claim damages in case of harm

To exercise these rights, please do so directly in account settings or contact our support team.`
        },
        security: {
          title: "7. Personal Information Protection Measures",
          content: `• Secure data transmission through SSL/TLS encryption
• Regular security checks and updates
• Access permission restrictions and management
• Use of Supabase's industry-standard security systems`
        },
        contact: {
          title: "8. Contact Information",
          content: `If you have any questions about this privacy policy, please contact us at any time.
Please leave your inquiries through the feedback button and we will respond as soon as possible.`
        }
      }
    }
  }

  const currentContent = content[language as keyof typeof content] || content.ko

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-blue-400 hover:text-blue-300 text-sm mb-4"
          >
            ← {currentContent.backToHome}
          </Link>
          <h1 className="text-3xl font-bold mb-2">{currentContent.title}</h1>
          <p className="text-gray-400 text-sm">{currentContent.lastUpdated}</p>
        </div>

        <div className="space-y-8">
          {Object.entries(currentContent.sections).map(([key, section]) => (
            <section key={key} className="border-b border-gray-800 pb-6 last:border-b-0">
              <h2 className="text-xl font-semibold mb-4 text-gray-100">
                {section.title}
              </h2>
              <div className="text-gray-300 leading-relaxed whitespace-pre-line">
                {section.content}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-gray-800 text-center">
          <p className="text-gray-400 text-sm">
            {language === 'ko' 
              ? '이 개인정보처리방침은 Gmail 기반 인증 서비스에 특화되어 작성되었습니다.' 
              : 'This privacy policy is specifically written for Gmail-based authentication services.'
            }
          </p>
        </div>
      </div>
    </div>
  )
}