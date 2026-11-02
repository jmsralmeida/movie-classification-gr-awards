// Só dado e funções puras, sem imports: também é compilado pelo projeto node do e2e (plan.md, R9).

interface FixtureMovie {
  id: number
  year: number
  title: string
  studios: string[]
  producers: string[]
  winner: boolean
}

const KNOWN_TITLES = [
  "Can't Stop the Music",
  'Cruising',
  'The Formula',
  'Friday the 13th',
  'The Nude Bomb',
  'The Jazz Singer',
  'Raise the Titanic',
  'Saturn 3',
  'Windows',
  'Xanadu',
  'Mommie Dearest',
  'Endless Love',
  "Heaven's Gate",
  'The Legend of the Lone Ranger',
  'Tarzan, the Ape Man',
]

// 1980: ids 1 a 10; 1981: ids 11 a 30; 1982: ids 31 a 40. O primeiro de cada ano é o vencedor.
function yearOf(id: number): number {
  if (id <= 10) return 1980
  if (id <= 30) return 1981
  return 1982
}

function isFirstOfYear(id: number): boolean {
  return id === 1 || id === 11 || id === 31
}

function buildMovie(id: number): FixtureMovie {
  return {
    id,
    year: yearOf(id),
    title: KNOWN_TITLES[id - 1] ?? `Movie ${id}`,
    studios: [`Studio ${id}`],
    producers: [`Producer ${id}`],
    winner: isFirstOfYear(id),
  }
}

export const movies: FixtureMovie[] = Array.from({ length: 40 }, (_, index) =>
  buildMovie(index + 1),
)

// Página no formato Spring da API.
export function buildMoviesPageResponse(list: FixtureMovie[], page: number, size: number) {
  const totalPages = Math.ceil(list.length / size)
  const content = list.slice(page * size, page * size + size)
  return {
    content,
    pageable: { pageNumber: page, pageSize: size },
    totalElements: list.length,
    totalPages,
    number: page,
    size,
    numberOfElements: content.length,
    first: page === 0,
    last: page >= totalPages - 1,
    empty: content.length === 0,
  }
}

const DEFAULT_SIZE = 20
const INTEGER_PATTERN = /^-?\d+$/
const DIGITS_PATTERN = /^\d+$/

// Emula a API real: page/size inválidos => 500 e year não numérico => 400, com os corpos reais.
export function respondToMoviesQuery(searchParams: URLSearchParams): {
  status: number
  body: unknown
} {
  const rawPage = searchParams.get('page') ?? '0'
  const rawSize = searchParams.get('size') ?? String(DEFAULT_SIZE)
  const page = Number(rawPage)
  const size = Number(rawSize)
  if (!INTEGER_PATTERN.test(rawPage) || !INTEGER_PATTERN.test(rawSize) || page < 0 || size < 1) {
    return {
      status: 500,
      body: {
        status: '500 INTERNAL_SERVER_ERROR',
        timestamp: '2026-10-31T00:00:00.000+00:00',
        message: 'Invalid page request',
      },
    }
  }

  const rawYear = searchParams.get('year')
  if (rawYear !== null && !DIGITS_PATTERN.test(rawYear)) {
    return {
      status: 400,
      body: {
        detail: 'Failed to convert value of type java.lang.String to required type int',
        instance: '/api/movies',
        status: 400,
        title: 'Bad Request',
      },
    }
  }

  const rawWinner = searchParams.get('winner')
  const filtered = movies.filter(
    (movie) =>
      (rawYear === null || movie.year === Number(rawYear)) &&
      (rawWinner === null || movie.winner === (rawWinner === 'true')),
  )
  return { status: 200, body: buildMoviesPageResponse(filtered, page, size) }
}
