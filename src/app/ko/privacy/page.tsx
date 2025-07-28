import Link from 'next/link'

export default function PrivacyPolicyKo() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto responsive-p-md py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="responsive-text-3xl font-bold mb-8">개인정보처리방침</h1>
          <div className="text-gray-400 text-sm mb-6">최근 업데이트: 2025년 1월 28일</div>
          
          <div className="space-y-8 responsive-text-base leading-relaxed">
            <section>
              <h2 className="responsive-text-xl font-semibold text-white mb-4">1. 수집하는 개인정보</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-200 mb-2">Google 계정 정보</h3>
                  <p className="text-gray-300">
                    Google 로그인 시 다음 정보를 수집합니다:
                  </p>
                  <ul className="list-disc list-inside mt-2 text-gray-400 space-y-1">
                    <li>이메일 주소</li>
                    <li>이름</li>
                    <li>프로필 사진</li>
                    <li>Google 사용자 ID</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-200 mb-2">서비스 이용 데이터</h3>
                  <p className="text-gray-300">
                    Koouk에서 생성하고 저장하는 콘텐츠:
                  </p>
                  <ul className="list-disc list-inside mt-2 text-gray-400 space-y-1">
                    <li>북마크 (동영상, 링크, 이미지, 메모)</li>
                    <li>할 일 목록 및 일정</li>
                    <li>개인 설정 및 환경설정</li>
                    <li>미니 기능 선택 및 데이터</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="responsive-text-xl font-semibold text-white mb-4">2. 개인정보 이용목적</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>Koouk 서비스 제공 및 유지</li>
                <li>사용자 인증 및 식별</li>
                <li>개인 데이터의 기기 간 저장 및 동기화</li>
                <li>분석을 통한 서비스 개선</li>
                <li>중요한 서비스 업데이트 발송 (동의 시)</li>
              </ul>
            </section>

            <section>
              <h2 className="responsive-text-xl font-semibold text-white mb-4">3. 데이터 저장 및 보안</h2>
              <p className="text-gray-300 mb-4">
                귀하의 데이터는 다음과 같이 안전하게 보호됩니다:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>Google OAuth 인증</li>
                <li>암호화된 데이터 전송 (HTTPS)</li>
                <li>정기적인 보안 업데이트 및 모니터링</li>
                <li>승인된 담당자만 제한적 접근</li>
              </ul>
            </section>

            <section>
              <h2 className="responsive-text-xl font-semibold text-white mb-4">4. 데이터 보관기간</h2>
              <p className="text-gray-300">
                계정이 활성화되어 있는 동안 개인정보를 보관합니다. 
                계정을 삭제하면 관련된 모든 데이터를 즉시 삭제하며, 
                법률에 의해 특정 정보의 보관이 요구되는 경우를 제외합니다.
              </p>
            </section>

            <section>
              <h2 className="responsive-text-xl font-semibold text-white mb-4">5. 이용자의 권리</h2>
              <p className="text-gray-300 mb-4">다음과 같은 권리를 가집니다:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>개인정보 열람</li>
                <li>부정확한 데이터 수정</li>
                <li>계정 및 모든 데이터 삭제</li>
                <li>데이터 내보내기</li>
                <li>데이터 처리 동의 철회</li>
              </ul>
            </section>

            <section>
              <h2 className="responsive-text-xl font-semibold text-white mb-4">6. 쿠키 및 분석</h2>
              <p className="text-gray-300 mb-4">
                다음 목적으로 쿠키를 사용합니다:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>필수: 로그인 세션 유지</li>
                <li>분석: Google Analytics (동의 시)</li>
                <li>성능: Vercel Analytics (서비스 개선용)</li>
              </ul>
              <p className="text-gray-300 mt-4">
                브라우저 설정에서 쿠키 기본설정을 제어할 수 있습니다.
              </p>
            </section>

            <section>
              <h2 className="responsive-text-xl font-semibold text-white mb-4">7. 국제적 데이터 전송</h2>
              <p className="text-gray-300">
                귀하의 데이터는 거주 국가 이외의 국가에서 처리될 수 있습니다. 
                적절한 보호장치와 관련 데이터 보호법 준수를 통해 충분한 보호를 보장합니다.
              </p>
            </section>

            <section>
              <h2 className="responsive-text-xl font-semibold text-white mb-4">8. 방침 변경</h2>
              <p className="text-gray-300">
                개인정보처리방침을 수시로 업데이트할 수 있습니다. 
                변경사항이 있을 때 이 페이지에 새로운 방침을 게시하고 
                &quot;최근 업데이트&quot; 날짜를 갱신하여 알려드립니다.
              </p>
            </section>

            <section>
              <h2 className="responsive-text-xl font-semibold text-white mb-4">9. 문의</h2>
              <p className="text-gray-300">
                개인정보처리방침에 대한 질문이 있으시면 연락주세요:
              </p>
              <div className="mt-4 p-4 bg-gray-900 rounded-lg">
                <p className="text-blue-400">이메일: support@koouk.com</p>
                <p className="text-gray-400">Koouk 개발팀</p>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800">
            <div className="flex gap-4 text-sm">
              <a href="/ko/terms" className="text-blue-400 hover:text-blue-300">이용약관</a>
              <a href="/ko/cookies" className="text-blue-400 hover:text-blue-300">쿠키 정책</a>
              <Link href="/" className="text-blue-400 hover:text-blue-300">Koouk으로 돌아가기</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}