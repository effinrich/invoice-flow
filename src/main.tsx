import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BlinkUIProvider, Toaster } from '@blinkdotnew/ui'
import { RouterProvider } from '@tanstack/react-router'
import { router } from './router'
import './index.css'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BlinkUIProvider theme="minimal" darkMode="light">
        <Toaster position="top-right" />
        <RouterProvider router={router} />
      </BlinkUIProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
