import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { WalletConnectWrapper } from './components/WalletConnectWrapper.jsx'

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <WalletConnectWrapper>
    <App />
  </WalletConnectWrapper>

  // </StrictMode>,
)
