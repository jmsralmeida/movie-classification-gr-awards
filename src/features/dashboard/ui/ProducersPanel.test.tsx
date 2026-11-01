import { screen, within } from '@testing-library/react'
import { http, HttpResponse, type JsonBodyType } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import { apiBaseUrl } from '../../../shared/api/config'
import { renderWithProviders } from '../../../test/render'
import { server } from '../../../test/server'
import { intervalsOnlyMaxResponse, intervalsWithTiesResponse } from '../testing/fixtures'
import { dashboardHandlers } from '../testing/handlers'
import { ProducersPanel } from './ProducersPanel'

function bodyRows(tableName: string) {
  const table = screen.getByRole('table', { name: tableName })
  return within(table)
    .getAllByRole('row')
    .slice(1)
    .map((row) => row.textContent)
}

function mockIntervals(body: JsonBodyType) {
  server.use(http.get(`${apiBaseUrl}/maxMinWinIntervalForProducers`, () => HttpResponse.json(body)))
}

describe('ProducersPanel', () => {
  beforeEach(() => {
    server.use(...dashboardHandlers)
  })

  it('shows the maximum and minimum intervals with their four columns', async () => {
    renderWithProviders(<ProducersPanel />)

    expect(await screen.findByRole('heading', { level: 3, name: 'Maximum' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Minimum' })).toBeInTheDocument()
    expect(bodyRows('Maximum interval')).toEqual(['Matthew Vaughn1320022015'])
    expect(bodyRows('Minimum interval')).toEqual(['Joel Silver119901991'])
    const headers = within(screen.getByRole('table', { name: 'Maximum interval' })).getAllByRole(
      'columnheader',
    )
    expect(headers.map((header) => header.textContent)).toEqual([
      'Producer',
      'Interval',
      'Previous Year',
      'Following Year',
    ])
  })

  it('lists every tied producer in each table', async () => {
    mockIntervals(intervalsWithTiesResponse)

    renderWithProviders(<ProducersPanel />)

    await screen.findByRole('table', { name: 'Maximum interval' })
    expect(bodyRows('Maximum interval')).toEqual([
      'Matthew Vaughn1320022015',
      'Another Producer1319801993',
    ])
    expect(bodyRows('Minimum interval')).toEqual(['Joel Silver119901991', 'Bo Derek119841985'])
  })

  it('keeps the panel in success when only one group is empty', async () => {
    mockIntervals(intervalsOnlyMaxResponse)

    renderWithProviders(<ProducersPanel />)

    await screen.findByRole('table', { name: 'Maximum interval' })
    expect(bodyRows('Maximum interval')).toEqual(['Matthew Vaughn1320022015'])
    expect(bodyRows('Minimum interval')).toEqual(['No producers.'])
    expect(screen.queryByText('No producers with multiple wins.')).not.toBeInTheDocument()
  })
})
