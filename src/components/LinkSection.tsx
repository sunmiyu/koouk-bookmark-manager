import { useContent } from '@/contexts/ContentContext'
import { useUserPlan } from '@/contexts/UserPlanContext'
import { trackEvents } from '@/lib/analytics'

export default function LinkSection() {
  const { links, deleteItem } = useContent()
  const { getStorageLimit } = useUserPlan()

  const limit = getStorageLimit()
  const isAtLimit = links.length >= limit
  
  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="responsive-text-lg font-semibold text-blue-400">Links</h3>
        <div className="text-xs text-gray-400">
          <span className={links.length >= limit ? 'text-yellow-400' : ''}>{links.length}</span>
          <span className="text-gray-500">/{limit === Infinity ? '∞' : limit}</span>
        </div>
      </div>
      <div className="space-y-3 max-h-[800px] overflow-y-auto">
        {/* Render actual links */}
        {links.map((link) => (
          <div 
            key={link.id} 
            className="bg-gray-800 hover:bg-gray-700 transition-colors cursor-pointer rounded-lg responsive-p-sm border border-gray-700 group relative"
            onClick={() => {
              if (link.url) {
                trackEvents.clickExternalLink(link.url)
                window.open(link.url, '_blank')
              }
            }}
          >
            {/* Delete button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (confirm('이 링크를 삭제하시겠습니까?')) {
                  deleteItem(link.id, 'link')
                }
              }}
              className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center text-red-400 hover:text-red-300 border border-red-400 rounded hover:border-red-300 transition-colors opacity-0 group-hover:opacity-100 text-xs z-10"
              title="Delete link"
            >
              ✕
            </button>
            <div className="flex items-start responsive-gap-sm">
              <div className="w-6 h-6 bg-blue-500 rounded-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m0 0l.708-.708M9.708 14.292l4-4m0 0l2.586-2.586M13.414 7.414l.708-.708" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-white responsive-text-sm truncate">{link.title}</h4>
                {link.description && (
                  <p className="text-xs text-gray-400 mt-1">{link.description}</p>
                )}
                <p className="text-xs text-blue-400 mt-1 truncate">{link.url}</p>
              </div>
            </div>
          </div>
        ))}
        
        {/* Add sample data if empty */}
        {links.length === 0 && (
          <div 
            className="bg-gray-800 hover:bg-gray-700 transition-colors cursor-pointer rounded-lg responsive-p-sm border border-gray-700 group relative"
            onClick={() => {
              trackEvents.clickExternalLink('https://example.com')
              window.open('https://example.com', '_blank')
            }}
          >
            {/* Delete button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                // Sample data can't be deleted, just show alert
                alert('이것은 샘플 데이터입니다. 로그인 후 실제 링크를 추가해보세요!')
              }}
              className="absolute top-2 right-2 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs z-10"
              title="Delete link"
            >
              ✕
            </button>
            <div className="flex items-start responsive-gap-sm">
              <div className="w-6 h-6 bg-blue-500 rounded-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m0 0l.708-.708M9.708 14.292l4-4m0 0l2.586-2.586M13.414 7.414l.708-.708" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-white responsive-text-sm truncate">유용한 웹사이트 예시</h4>
                <p className="text-xs text-gray-400 mt-1">로그인 후 실제 링크를 추가해보세요</p>
                <p className="text-xs text-blue-400 mt-1 truncate">https://example.com</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Show empty slots to fill 10 total */}
        {Array.from({ length: Math.max(0, 10 - Math.max(links.length, 1)) }, (_, index) => (
          <div 
            key={`empty-${index}`}
            className="bg-gray-900 border-2 border-dashed border-gray-700 rounded-lg responsive-p-sm opacity-50"
          >
            <div className="flex items-start responsive-gap-sm">
              <div className="w-6 h-6 bg-gray-700 rounded-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-600 responsive-text-sm">링크 추가하기</h4>
                <p className="text-xs text-gray-600 mt-1">새로운 링크를 저장해보세요</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      
      {isAtLimit && (
        <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-600/50 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-400 text-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>Storage limit reached ({limit === Infinity ? 'unlimited' : limit} links)</span>
          </div>
          <p className="text-xs text-yellow-300 mt-1">
            Delete existing links to add new ones, or <a href="/pricing" className="underline hover:text-yellow-200">upgrade to Pro</a>
          </p>
        </div>
      )}
    </div>
  )
}