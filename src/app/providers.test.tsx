import { useQueryClient } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { queryClient } from '../shared/api/queryClient'
import { Providers } from './providers'

describe('Providers', () => {
  it('exposes the global QueryClient to its children', () => {
    let received: unknown

    function Probe() {
      received = useQueryClient()
      return null
    }

    render(
      <Providers>
        <Probe />
      </Providers>,
    )

    expect(received).toBe(queryClient)
  })
})
