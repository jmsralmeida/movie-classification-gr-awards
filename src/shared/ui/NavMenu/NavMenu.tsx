import { NavLink } from 'react-router'
import type { NavItem } from './NavMenu.types'

interface NavMenuProps {
  items: NavItem[]
  label: string
}

export function NavMenu({ items, label }: NavMenuProps) {
  return (
    <nav aria-label={label}>
      <ul>
        {items.map((item) => (
          <li key={item.to}>
            <NavLink to={item.to} end>
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
