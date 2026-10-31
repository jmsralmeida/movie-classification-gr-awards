import { useQuery } from '@tanstack/react-query'
import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from './render'
import { server } from './server'

function Ping() {
  const { data } = useQuery({
    queryKey: ['ping'],
    queryFn: async () => {
      const response = await fetch('http://localhost/ping')
      return (await response.json()) as { status: string }
    },
  })
  return <p>{data?.status ?? 'loading'}</p>
}

describe('test foundation', () => {
  it('serves HTTP responses through the MSW server', async () => {
    server.use(http.get('http://localhost/ping', () => HttpResponse.json({ status: 'pong' })))

    renderWithProviders(<Ping />)

    expect(await screen.findByText('pong')).toBeInTheDocument()
  })

  it('fails requests that have no handler', async () => {
    await expect(fetch('http://localhost/unhandled')).rejects.toThrow()
  })
})
