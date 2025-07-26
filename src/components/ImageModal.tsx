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
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[9999] p-4">
      <div className="relative max-w-2xl max-h-[80vh] w-full mx-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 z-10 w-8 h-8 bg-gray-900 bg-opacity-90 text-white rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all shadow-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Image */}
        <div className="bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={imageTitle}
            className="w-full h-auto max-h-[70vh] object-contain"
            onError={(e) => {
              e.currentTarget.parentElement!.innerHTML = `
                <div class="flex items-center justify-center h-64 text-gray-400">
                  <div class="text-center">
                    <svg class="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p>Image could not be loaded</p>
                  </div>
                </div>
              `
            }}
          />
          
          {/* Image title */}
          {imageTitle && (
            <div className="p-4 bg-gray-800">
              <h3 className="text-white font-medium">{imageTitle}</h3>
            </div>
          )}
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