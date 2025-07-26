interface Link {
  id: number
  title: string
  url: string
  description?: string
}

export default function LinkSection() {
  const links: Link[] = [
    { id: 1, title: "GitHub", url: "https://github.com", description: "Development platform" },
    { id: 2, title: "Stack Overflow", url: "https://stackoverflow.com", description: "Programming Q&A" },
    { id: 3, title: "MDN Web Docs", url: "https://developer.mozilla.org", description: "Web development resources" },
    { id: 4, title: "Next.js Documentation", url: "https://nextjs.org/docs", description: "React framework docs" },
    { id: 5, title: "Tailwind CSS", url: "https://tailwindcss.com", description: "Utility-first CSS framework" },
    { id: 6, title: "Vercel", url: "https://vercel.com", description: "Deployment platform" },
    { id: 7, title: "TypeScript", url: "https://www.typescriptlang.org", description: "Typed JavaScript" }
  ]

  return (
    <div className="h-full">
      <h3 className="responsive-text-lg font-semibold mb-4 text-blue-400">Links ({links.length})</h3>
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {links.map((link) => (
          <div key={link.id} className="bg-gray-800 hover:bg-gray-700 transition-colors cursor-pointer rounded-lg responsive-p-sm border border-gray-700">
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
    </div>
  )
}