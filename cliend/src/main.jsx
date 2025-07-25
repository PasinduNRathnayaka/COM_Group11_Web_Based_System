import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AppContextProvider } from './context/AppContext.jsx'

import axios from 'axios'


axios.defaults.baseURL = 'http://localhost:4000'
axios.defaults.headers.common['Content-Type'] = 'application/json'

createRoot(document.getElementById('root')).render(
  <StrictMode>
  <BrowserRouter>
    <AppContextProvider>
    <App />
    </AppContextProvider> 
  </BrowserRouter>
  </StrictMode>
)

