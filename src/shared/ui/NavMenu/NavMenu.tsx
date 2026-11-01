import { NavLink } from 'react-router'
import type { NavItem } from './NavMenu.types'
import styles from './NavMenu.module.css'

interface NavMenuProps {
  items: NavItem[]
  label: string
}

export function NavMenu({ items, label }: NavMenuProps) {
  return (
    <nav aria-label={label}>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end
              className={({ isActive }) =>
                isActive ? `${styles.link} ${styles.current}` : styles.link
              }
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
