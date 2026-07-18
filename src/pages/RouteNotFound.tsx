import { Link } from "@tanstack/react-router";
import { FileQuestion } from "lucide-react";

export function PublicNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <FileQuestion className="mx-auto mb-4 h-12 w-12 text-primary" />
        <h1 className="mb-2 text-3xl font-bold tracking-tight">Page not found</h1>
        <p className="mb-6 text-sm text-muted-foreground">The page you requested doesn't exist.</p>
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}

export function ProtectedNotFound() {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center px-6 py-12">
      <div className="max-w-md text-center">
        <FileQuestion className="mx-auto mb-4 h-10 w-10 text-primary" />
        <h1 className="mb-2 text-2xl font-bold tracking-tight">Not found</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          That page doesn't exist in this section.
        </p>
        <Link
          to="/invoices"
          className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90"
        >
          Go to invoices
        </Link>
      </div>
    </div>
  );
}

export function InvoiceNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <FileQuestion className="mx-auto mb-4 h-12 w-12 text-primary" />
        <h1 className="mb-2 text-3xl font-bold tracking-tight">Invoice not found</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          This invoice link may be invalid or the invoice has been deleted.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
