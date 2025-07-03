// types.ts
export interface ClassItem {
  id: string
  title: string
}

export interface ClassesResponse {
  data: {
    filterClasses: {
      upcoming: ClassItem[]
      ongoing: ClassItem[]
    }
    totalClasses: number
    totalPages: number
  }
}
