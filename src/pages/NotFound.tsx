import { useEffect } from "react";
import { Link } from "@tanstack/react-router";

/**
 * 404 / Not Found page for unknown routes.
 *
 * This is a client-rendered SPA on static hosting, so the HTTP status for an
 * unknown path is still 200 (the host serves index.html for every path). To
 * avoid a "soft 404" in search engines we inject a `noindex, nofollow` robots
 * meta while this page is mounted and remove it on unmount, so real pages stay
 * indexable. This tells crawlers not to index unknown URLs even though the
 * status code cannot be changed at the static-hosting layer.
 */
export default function NotFound() {
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    meta.setAttribute("data-notfound", "true");
    document.head.appendChild(meta);
    const prevTitle = document.title;
    document.title = "Page not found — InvoiceFlow";
    return () => {
      document.head.removeChild(meta);
      document.title = prevTitle;
    };
  }, []);

  return (
    <main
      role="main"
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "2rem",
        gap: "0.75rem",
      }}
    >
      <h1 style={{ fontSize: "2rem", fontWeight: 700 }}>Page not found</h1>
      <p style={{ maxWidth: "32rem", color: "#5c5347" }}>
        The page you are looking for does not exist or may have moved. Head back to InvoiceFlow to
        create a professional invoice in under 60 seconds.
      </p>
      <p>
        <Link to="/" style={{ color: "#F94E10", fontWeight: 600 }}>
          Go to the homepage
        </Link>
      </p>
    </main>
  );
}
