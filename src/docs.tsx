import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Documentation from './Documentation'
import './Documentation.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Documentation />
  </StrictMode>,
)