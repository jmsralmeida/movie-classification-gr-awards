// Só dado cru, sem imports: também é compilado pelo projeto node do e2e (plan.md, R9).

export const yearsResponse = {
  years: [
    { year: 1986, winnerCount: 2 },
    { year: 1990, winnerCount: 2 },
    { year: 2015, winnerCount: 2 },
  ],
}

export const emptyYearsResponse = { years: [] }

export const studiosResponse = {
  studios: [
    { name: 'Columbia Pictures', winCount: 6 },
    { name: 'Paramount Pictures', winCount: 6 },
    { name: 'Warner Bros.', winCount: 5 },
    { name: '20th Century Fox', winCount: 4 },
    { name: 'MGM', winCount: 3 },
  ],
}

export const emptyStudiosResponse = { studios: [] }

export const intervalsResponse = {
  min: [{ producer: 'Joel Silver', interval: 1, previousWin: 1990, followingWin: 1991 }],
  max: [{ producer: 'Matthew Vaughn', interval: 13, previousWin: 2002, followingWin: 2015 }],
}

export const intervalsWithTiesResponse = {
  min: [
    { producer: 'Joel Silver', interval: 1, previousWin: 1990, followingWin: 1991 },
    { producer: 'Bo Derek', interval: 1, previousWin: 1984, followingWin: 1985 },
  ],
  max: [
    { producer: 'Matthew Vaughn', interval: 13, previousWin: 2002, followingWin: 2015 },
    { producer: 'Another Producer', interval: 13, previousWin: 1980, followingWin: 1993 },
  ],
}

export const intervalsOnlyMaxResponse = {
  min: [],
  max: intervalsResponse.max,
}

export const emptyIntervalsResponse = { min: [], max: [] }

export const winnersByYear2018Response = [
  {
    id: 197,
    year: 2018,
    title: 'Holmes & Watson',
    studios: ['Columbia Pictures', 'Mimran Schur Pictures'],
    producers: ['Will Ferrell', 'Adam McKay', 'Jimmy Miller', 'Clayton Townsend'],
    winner: true,
  },
]

export const winnersWithTiesResponse = [
  {
    id: 101,
    year: 1990,
    title: 'First Winner',
    studios: ['Studio A'],
    producers: ['Producer A'],
    winner: true,
  },
  {
    id: 102,
    year: 1990,
    title: 'Second Winner',
    studios: ['Studio B'],
    producers: ['Producer B'],
    winner: true,
  },
]

export const emptyWinnersResponse: unknown[] = []
