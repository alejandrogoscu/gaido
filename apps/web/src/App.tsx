import './styles.css'

import { GaidoLogo } from './components/GaidoLogo'

export function App() {
  return (
    <main className="brand-shell">
      <h1 className="visually-hidden">Gaido</h1>
      <GaidoLogo />
    </main>
  )
}