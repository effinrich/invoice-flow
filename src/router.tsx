import {
  createRouter,
  createRoute,
  createRootRoute,
} from '@tanstack/react-router'
import { lazy } from 'react'
import { RootLayout } from './layouts/RootLayout'
import LandingPage from './pages/LandingPage'
import InvoiceCreator from './pages/InvoiceCreator'
import RecurringInvoices from './pages/RecurringInvoices'
import NotFound from './pages/NotFound'

const ClientPortal = lazy(() => import('./pages/ClientPortal').then(m => ({ default: m.ClientPortal || m.default })))

// Root layout route — wraps all pages with auth/subscription + upgrade modal
const rootRoute = createRootRoute({
  component: RootLayout,
})

// Landing page: /
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
})

// Invoice creator: /create
const createRoute_ = createRoute({
  getParentRoute: () => rootRoute,
  path: '/create',
  component: InvoiceCreator,
})

// Recurring invoices: /recurring
const recurringRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/recurring',
  component: RecurringInvoices,
})

// Client portal: /portal/$invoiceId
const portalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/portal/$invoiceId',
  component: ClientPortal,
})

// Catch-all: render a proper Not Found page (with noindex) rather than
// redirecting unknown URLs to "/", which reads as a soft 404 to search engines.
const catchAllRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '*',
  component: NotFound,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  createRoute_,
  recurringRoute,
  portalRoute,
  catchAllRoute,
])

export const router = createRouter({ routeTree })

// Type-safety for the router
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
