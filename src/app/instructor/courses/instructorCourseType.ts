export interface EnrolledCourse {
    coverImage: string
    id: number
    name: string
}

export interface ModuleDetail {
  id: number;
  name: string;
}

export interface GetChaptersWithStatusResponse {
  moduleDetails: ModuleDetail[];
}
