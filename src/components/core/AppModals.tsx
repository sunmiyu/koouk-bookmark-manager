'use client'

import { useAppState } from './AppStateManager'
import { useAppEventHandlers } from './AppEventHandlers'
import { useAuth } from '@/components/auth/AuthProvider'
import { useToast } from '@/hooks/useToast'
import { useDeleteConfirmation } from '@/hooks/useDeleteConfirmation'
import { useUndoToast } from '@/hooks/useUndoToast'
import LoginModal from '../auth/LoginModal'
import FeedbackModal from '../modals/FeedbackModal'
import SignoutModal from '../ui/SignoutModal'
import Toast from '../ui/Toast'
import DeleteConfirmModal from '../ui/DeleteConfirmModal'
import UndoToast from '../ui/UndoToast'

/**
 * 모든 앱 모달들을 중앙에서 관리하는 컴포넌트
 * 각 모달의 표시/숨김 상태와 핸들러를 통합 관리
 */
export function AppModals() {
  const { signOut } = useAuth()
  const { toast, hideToast } = useToast()
  const { confirmModal, hideDeleteConfirmation } = useDeleteConfirmation()
  const { toastState, hideUndoToast } = useUndoToast()
  const {
    showFeedbackModal,
    showLoginModal,
    showAccountMenu,
    showSignoutModal,
    showCreateFolderModal,
    newFolderName,
    setShowFeedbackModal,
    setShowLoginModal,
    setShowAccountMenu,
    setShowSignoutModal,
    setShowCreateFolderModal,
    setNewFolderName
  } = useAppState()
  
  const { handleCreateFolder } = useAppEventHandlers()

  return (
    <>
      {/* 🎭 피드백 모달 */}
      {showFeedbackModal && (
        <FeedbackModal 
          isOpen={true}
          onClose={() => setShowFeedbackModal(false)} 
        />
      )}

      {/* 🔐 로그인 모달 */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      {/* 🚪 로그아웃 확인 모달 */}
      <SignoutModal
        isOpen={showSignoutModal}
        onClose={() => setShowSignoutModal(false)}
        onConfirm={async () => {
          await signOut()
          setShowSignoutModal(false)
        }}
      />

      {/* 🍞 Toast 알림 */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />

      {/* 👤 계정 메뉴 모달 */}
      {showAccountMenu && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAccountMenu(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-xl w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                Account
              </h3>
              
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setShowAccountMenu(false)
                    setShowFeedbackModal(true)
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Send Feedback
                </button>
                
                <button
                  onClick={() => {
                    setShowAccountMenu(false)
                    window.open('/privacy', '_blank')
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Privacy Policy
                </button>
                
                <button
                  onClick={() => {
                    setShowAccountMenu(false)
                    setShowSignoutModal(true)
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                >
                  Sign Out
                </button>
              </div>
              
              <button
                onClick={() => setShowAccountMenu(false)}
                className="w-full mt-4 px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📁 새 폴더 생성 모달 */}
      {showCreateFolderModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowCreateFolderModal(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-xl w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                Create New Folder
              </h3>
              
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateFolder()
                  }
                  if (e.key === 'Escape') {
                    setShowCreateFolderModal(false)
                  }
                }}
              />
              
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setShowCreateFolderModal(false)}
                  className="flex-1 px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateFolder}
                  className="flex-1 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🗑️ 삭제 확인 모달 */}
      {confirmModal && (
        <DeleteConfirmModal
          isOpen={confirmModal.show}
          type={confirmModal.type}
          title={confirmModal.title}
          message={confirmModal.message}
          itemName={confirmModal.item?.name || confirmModal.item?.title || ''}
          onConfirm={confirmModal.onConfirm}
          onCancel={hideDeleteConfirmation}
        />
      )}

      {/* ↩️ Undo 토스트 */}
      <UndoToast
        show={toastState.show}
        message={toastState.message}
        onUndo={toastState.onUndo}
        onDismiss={hideUndoToast}
      />
    </>
  )
}