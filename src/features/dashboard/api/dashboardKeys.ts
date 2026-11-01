export const dashboardKeys = {
  yearsWithMultipleWinners: ['dashboard', 'years-with-multiple-winners'] as const,
  studios: ['dashboard', 'studios-with-win-count'] as const,
  producerIntervals: ['dashboard', 'producer-intervals'] as const,
  winnersByYear: (year: string) => ['dashboard', 'winners-by-year', year] as const,
}
