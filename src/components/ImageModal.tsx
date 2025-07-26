'use client'

interface ImageModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  imageTitle: string
}

export default function ImageModal({ isOpen, onClose, imageUrl, imageTitle }: ImageModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
      {/* Dialog Box */}
      <div className="relative bg-white rounded-lg shadow-2xl border border-gray-300 max-w-lg w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800 truncate">
            {imageTitle || 'Image Preview'}
          </h3>
          <button
            onClick={onClose}
            className="w-6 h-6 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Image Content */}
        <div className="p-4 bg-white overflow-auto max-h-[calc(80vh-80px)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={imageTitle}
            className="w-full h-auto rounded border border-gray-200"
            onError={(e) => {
              e.currentTarget.parentElement!.innerHTML = `
                <div class="flex items-center justify-center h-48 text-gray-400 border border-gray-200 rounded">
                  <div class="text-center">
                    <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p class="text-sm">Image could not be loaded</p>
                  </div>
                </div>
              `
            }}
          />
        </div>
      </div>
      
      {/* Click outside to close */}
      <div
        className="absolute inset-0 -z-10"
        onClick={onClose}
      />
    </div>
  )
}