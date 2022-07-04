import './header.css'

import { Menu, Input } from 'antd'

export default function Header({ inputHandler, inputValue }) {
  const menuItems = [
    { label: 'Search', key: 'search' },
    { label: 'Rated', key: 'rated' },
  ]

  return (
    <header className="header">
      <Menu items={menuItems} mode="horizontal" defaultSelectedKeys={['search']} className="header__menu" />

      <Input
        className="header__search"
        placeholder="Type to search..."
        value={inputValue}
        onChange={(e) => inputHandler(e.target.value)}
      />
    </header>
  )
}
