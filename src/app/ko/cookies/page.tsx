import Link from 'next/link'

export default function CookiePolicyKo() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto responsive-p-md py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="responsive-text-3xl font-bold mb-8">쿠키 정책</h1>
          <div className="text-gray-400 text-sm mb-6">최근 업데이트: 2025년 1월 28일</div>
          
          <div className="space-y-8 responsive-text-base leading-relaxed">
            <section>
              <h2 className="responsive-text-xl font-semibold text-white mb-4">쿠키란 무엇인가요?</h2>
              <p className="text-gray-300">
                쿠키는 웹사이트를 방문할 때 컴퓨터나 모바일 기기에 저장되는 작은 텍스트 파일입니다. 
                웹사이트가 더 효율적으로 작동하고 웹사이트 소유자에게 정보를 제공하기 위해 널리 사용됩니다.
              </p>
            </section>

            <section>
              <h2 className="responsive-text-xl font-semibold text-white mb-4">쿠키 사용 방법</h2>
              <p className="text-gray-300 mb-4">
                Koouk은 다음 목적으로 쿠키를 사용합니다:
              </p>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-green-400 mb-3">🔧 필수 쿠키 (필수)</h3>
                  <div className="bg-gray-900 p-4 rounded-lg">
                    <p className="text-gray-300 mb-3">
                      웹사이트가 제대로 작동하는 데 필요한 쿠키:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-400">
                      <li><strong>NextAuth.js 세션:</strong> 로그인 상태 유지</li>
                      <li><strong>CSRF 보호:</strong> 사이트 간 요청 위조 방지</li>
                      <li><strong>사용자 설정:</strong> 플랜 선택 및 설정 저장</li>
                    </ul>
                    <p className="text-green-400 text-sm mt-3">
                      ✓ 이 쿠키들은 서비스 기능에 필수적이므로 비활성화할 수 없습니다.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-blue-400 mb-3">📊 분석 쿠키 (선택사항)</h3>
                  <div className="bg-gray-900 p-4 rounded-lg">
                    <p className="text-gray-300 mb-3">
                      방문자가 웹사이트를 어떻게 사용하는지 이해하는 데 도움이 되는 쿠키:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-400">
                      <li><strong>Google Analytics:</strong> 페이지 조회수, 사용자 행동, 인구통계 추적</li>
                      <li><strong>Vercel Analytics:</strong> 웹사이트 성능 및 로딩 시간 모니터링</li>
                    </ul>
                    <p className="text-blue-400 text-sm mt-3">
                      ⚙️ 쿠키 배너를 통해 이 쿠키들을 거부할 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="responsive-text-xl font-semibold text-white mb-4">쿠키 세부 정보</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-700">
                  <thead>
                    <tr className="bg-gray-800">
                      <th className="border border-gray-700 p-3 text-left">쿠키 이름</th>
                      <th className="border border-gray-700 p-3 text-left">목적</th>
                      <th className="border border-gray-700 p-3 text-left">기간</th>
                      <th className="border border-gray-700 p-3 text-left">유형</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    <tr>
                      <td className="border border-gray-700 p-3 font-mono text-sm">next-auth.session-token</td>
                      <td className="border border-gray-700 p-3">사용자 인증</td>
                      <td className="border border-gray-700 p-3">30일</td>
                      <td className="border border-gray-700 p-3"><span className="text-green-400">필수</span></td>
                    </tr>
                    <tr>
                      <td className="border border-gray-700 p-3 font-mono text-sm">next-auth.csrf-token</td>
                      <td className="border border-gray-700 p-3">보안 보호</td>
                      <td className="border border-gray-700 p-3">세션</td>
                      <td className="border border-gray-700 p-3"><span className="text-green-400">필수</span></td>
                    </tr>
                    <tr>
                      <td className="border border-gray-700 p-3 font-mono text-sm">koouk_user_plan</td>
                      <td className="border border-gray-700 p-3">사용자 플랜 설정 저장</td>
                      <td className="border border-gray-700 p-3">영구</td>
                      <td className="border border-gray-700 p-3"><span className="text-green-400">필수</span></td>
                    </tr>
                    <tr>
                      <td className="border border-gray-700 p-3 font-mono text-sm">_ga, _ga_*</td>
                      <td className="border border-gray-700 p-3">Google Analytics 추적</td>
                      <td className="border border-gray-700 p-3">2년</td>
                      <td className="border border-gray-700 p-3"><span className="text-blue-400">분석</span></td>
                    </tr>
                    <tr>
                      <td className="border border-gray-700 p-3 font-mono text-sm">va-*</td>
                      <td className="border border-gray-700 p-3">Vercel Analytics</td>
                      <td className="border border-gray-700 p-3">1년</td>
                      <td className="border border-gray-700 p-3"><span className="text-blue-400">분석</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="responsive-text-xl font-semibold text-white mb-4">쿠키 설정 관리</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-200 mb-2">쿠키 배너</h3>
                  <p className="text-gray-300">
                    Koouk을 처음 방문하면 선택적 분석 쿠키에 대한 동의를 요청하는 
                    쿠키 배너가 표시됩니다. 언제든지 이를 수락하거나 거부할 수 있습니다.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-200 mb-2">브라우저 설정</h3>
                  <p className="text-gray-300 mb-3">
                    브라우저 설정을 통해서도 쿠키를 제어할 수 있습니다:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-400">
                    <li><strong>Chrome:</strong> 설정 → 개인정보 및 보안 → 쿠키 및 기타 사이트 데이터</li>
                    <li><strong>Firefox:</strong> 설정 → 개인정보 및 보안 → 쿠키 및 사이트 데이터</li>
                    <li><strong>Safari:</strong> 환경설정 → 개인정보 → 웹사이트 데이터 관리</li>
                    <li><strong>Edge:</strong> 설정 → 쿠키 및 사이트 권한 → 쿠키 및 사이트 데이터</li>
                  </ul>
                </div>
                <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-4">
                  <h3 className="font-medium text-yellow-400 mb-2">⚠️ 중요 안내</h3>
                  <p className="text-yellow-200 text-sm">
                    필수 쿠키를 비활성화하면 Koouk이 제대로 작동하지 않을 수 있습니다. 
                    필수 쿠키가 차단되면 로그인하거나 설정을 저장할 수 없을 수 있습니다.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="responsive-text-xl font-semibold text-white mb-4">제3자 쿠키</h2>
              <p className="text-gray-300 mb-4">
                Koouk의 일부 쿠키는 제3자 서비스에서 설정됩니다:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li><strong>Google:</strong> 인증(OAuth) 및 분석용</li>
                <li><strong>Vercel:</strong> 성능 모니터링 및 분석용</li>
              </ul>
              <p className="text-gray-300 mt-4">
                이러한 제3자들은 자체적인 개인정보처리방침과 쿠키 정책을 가지고 있으며, 
                해당 웹사이트에서 검토할 수 있습니다.
              </p>
            </section>

            <section>
              <h2 className="responsive-text-xl font-semibold text-white mb-4">정책 업데이트</h2>
              <p className="text-gray-300">
                관행 변경이나 기타 운영상, 법적, 규제상의 이유로 
                쿠키 정책을 수시로 업데이트할 수 있습니다. 
                쿠키 사용에 대한 정보를 받으려면 이 페이지를 정기적으로 방문해주세요.
              </p>
            </section>

            <section>
              <h2 className="responsive-text-xl font-semibold text-white mb-4">문의</h2>
              <p className="text-gray-300">
                쿠키 사용에 대한 질문이 있으시면 연락주세요:
              </p>
              <div className="mt-4 p-4 bg-gray-900 rounded-lg">
                <p className="text-blue-400">이메일: support@koouk.com</p>
                <p className="text-gray-400">Koouk 개발팀</p>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800">
            <div className="flex gap-4 text-sm">
              <a href="/ko/privacy" className="text-blue-400 hover:text-blue-300">개인정보처리방침</a>
              <a href="/ko/terms" className="text-blue-400 hover:text-blue-300">이용약관</a>
              <Link href="/" className="text-blue-400 hover:text-blue-300">Koouk으로 돌아가기</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}