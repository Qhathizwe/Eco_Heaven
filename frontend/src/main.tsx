import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

import  {store }from './store.ts'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
    <BrowserRouter   future={{ 
        v7_startTransition: true, 
        v7_relativeSplatPath: true 
      }}>
    <App />
    </BrowserRouter>
    </Provider>
  </StrictMode>,
)
