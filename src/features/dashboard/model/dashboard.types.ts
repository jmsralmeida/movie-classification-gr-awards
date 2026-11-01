export interface YearWinCount {
  year: number
  winnerCount: number
}

export interface StudioWinCount {
  name: string
  winCount: number
}

export interface ProducerInterval {
  producer: string
  interval: number
  previousWin: number
  followingWin: number
}

export interface ProducerIntervals {
  max: ProducerInterval[]
  min: ProducerInterval[]
}

export interface WinningMovie {
  id: number
  year: number
  title: string
}
