export interface Movie {
  id: number
  year: number
  title: string
  winner: boolean
}

export interface MoviesPage {
  movies: Movie[]
  totalPages: number
}

export interface MoviesQuery {
  // Base 1 (a API usa base 0; a conversão é feita em toApiParams).
  page: number
  year?: string
  winner?: boolean
}
