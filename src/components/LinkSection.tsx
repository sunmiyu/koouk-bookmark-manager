import { useContent } from '@/contexts/ContentContext'
import { useUserPlan } from '@/contexts/UserPlanContext'
import { trackEvents } from '@/lib/analytics'

export default function LinkSection() {
  const { links } = useContent()
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
        {links.map((link) => (
          <div 
            key={link.id} 
            className="bg-gray-800 hover:bg-gray-700 transition-colors cursor-pointer rounded-lg responsive-p-sm border border-gray-700"
            onClick={() => {
              if (link.url) {
                trackEvents.clickExternalLink(link.url)
                window.open(link.url, '_blank')
              }
            }}
          >
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
      </div>
      
      {links.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m0 0l.708-.708M9.708 14.292l4-4m0 0l2.586-2.586M13.414 7.414l.708-.708" />
          </svg>
          <p>No links yet</p>
        </div>
      )}
      
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