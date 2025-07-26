interface Image {
  id: number
  title: string
  url: string
  thumbnail: string
}

export default function ImageSection() {
  const images: Image[] = [
    { id: 1, title: "Modern UI Design Trends", url: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300&h=200&fit=crop", thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300&h=200&fit=crop" },
    { id: 2, title: "Color Palette Inspiration", url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=300&h=200&fit=crop", thumbnail: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=300&h=200&fit=crop" },
    { id: 3, title: "Typography Examples", url: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=200&fit=crop", thumbnail: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=200&fit=crop" },
    { id: 4, title: "Mobile App Designs", url: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=300&h=200&fit=crop", thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=300&h=200&fit=crop" },
    { id: 5, title: "Website Layout Ideas", url: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=300&h=200&fit=crop", thumbnail: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=300&h=200&fit=crop" },
    { id: 6, title: "Icon Design Collection", url: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=300&h=200&fit=crop", thumbnail: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=300&h=200&fit=crop" },
    { id: 7, title: "Branding Examples", url: "https://images.unsplash.com/photo-1634942537034-2531766767d1?w=300&h=200&fit=crop", thumbnail: "https://images.unsplash.com/photo-1634942537034-2531766767d1?w=300&h=200&fit=crop" },
    { id: 8, title: "UI Component Library", url: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=300&h=200&fit=crop", thumbnail: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=300&h=200&fit=crop" },
    { id: 9, title: "Dashboard Designs", url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop", thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop" },
    { id: 10, title: "Landing Page Examples", url: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=300&h=200&fit=crop", thumbnail: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=300&h=200&fit=crop" },
    { id: 11, title: "Illustration Styles", url: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=300&h=200&fit=crop", thumbnail: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=300&h=200&fit=crop" }
  ]

  return (
    <div className="h-full">
      <h3 className="responsive-text-lg font-semibold mb-4 text-green-400">Images ({images.length})</h3>
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {images.map((image) => (
          <div key={image.id} className="bg-gray-800 hover:bg-gray-700 transition-colors cursor-pointer rounded-lg responsive-p-sm border border-gray-700">
            <div className="flex items-start responsive-gap-sm">
              <div className="w-14 h-10 sm:w-16 sm:h-12 bg-gray-700 rounded flex-shrink-0 overflow-hidden">
                <img 
                  src={image.thumbnail}
                  alt={image.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.parentElement!.innerHTML = `
                      <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    `
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-white responsive-text-sm line-clamp-2">{image.title}</h4>
                <p className="text-xs text-gray-400 mt-1">Image • Design</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {images.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p>No images yet</p>
        </div>
      )}
    </div>
  )
}