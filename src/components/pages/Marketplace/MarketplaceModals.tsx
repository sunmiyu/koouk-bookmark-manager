'use client'

import { useMarketplaceState } from './MarketplaceStateManager'
import { useMarketplaceEventHandlers } from './MarketplaceEventHandlers'
import EditSharedFolderModal from '@/components/ui/EditSharedFolderModal'
import BottomSheet from '@/components/ui-mobile/BottomSheet'
import FolderImportPreview from '@/components/ui/FolderImportPreview'
import SuccessOverlay from '@/components/ui/SuccessOverlay'

/**
 * MarketPlace의 모든 모달을 관리하는 컴포넌트
 */
export function MarketplaceModals({ onImportFolder }: { onImportFolder?: (folder: any) => void }) {
  const {
    editModalOpen,
    editingFolder,
    showImportModal,
    selectedFolderForImport,
    showSuccessOverlay,
    successMessage,
    isMobile,
    setEditModalOpen,
    setEditingFolder,
    setShowImportModal,
    setSelectedFolderForImport,
    setShowSuccessOverlay
  } = useMarketplaceState()
  
  const { handleEditFolder, handleImportFolder } = useMarketplaceEventHandlers(onImportFolder)

  return (
    <>
      {/* 편집 모달 */}
      {editModalOpen && editingFolder && (
        <EditSharedFolderModal
          isOpen={editModalOpen}
          sharedFolder={editingFolder}
          onClose={() => {
            setEditModalOpen(false)
            setEditingFolder(null)
          }}
          onUpdateFolder={handleEditFolder}
        />
      )}

      {/* Import 모달 - 모바일/데스크톱 대응 */}
      {showImportModal && selectedFolderForImport && (
        <>
          {isMobile ? (
            <BottomSheet
              isOpen={showImportModal}
              onClose={() => {
                setShowImportModal(false)
                setSelectedFolderForImport(null)
              }}
              title="Import Collection"
            >
              <div className="p-4">
                <FolderImportPreview
                  folder={selectedFolderForImport}
                  onImport={() => handleImportFolder(selectedFolderForImport)}
                  onCancel={() => {
                    setShowImportModal(false)
                    setSelectedFolderForImport(null)
                  }}
                />
              </div>
            </BottomSheet>
          ) : (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Import Collection
                  </h3>
                  <FolderImportPreview
                    folder={selectedFolderForImport}
                    onImport={() => handleImportFolder(selectedFolderForImport)}
                    onCancel={() => {
                      setShowImportModal(false)
                      setSelectedFolderForImport(null)
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* 성공 오버레이 */}
      {showSuccessOverlay && (
        <SuccessOverlay
          show={showSuccessOverlay}
          message={successMessage}
          onComplete={() => setShowSuccessOverlay(false)}
        />
      )}
    </>
  )
}