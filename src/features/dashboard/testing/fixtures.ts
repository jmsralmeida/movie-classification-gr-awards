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
