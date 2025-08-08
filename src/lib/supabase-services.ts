// Personal Storage Hub용 간소화된 서비스 (현재 localStorage를 사용하므로 미사용)
export const linksService = {
  async getAll(_userId: string) {
    console.log('Links service disabled for Personal Storage Hub')
    return { data: [], error: null }
  },

  async create(_link: Record<string, unknown>) {
    console.log('Links service disabled for Personal Storage Hub')
    return { data: null, error: null }
  }
}

// 기타 서비스들도 비활성화
export const notesService = {
  async getAll() {
    return { data: [], error: null }
  }
}

export const todoService = {
  async getAll() {
    return { data: [], error: null }
  }
}