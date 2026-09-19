import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { getCart } from "@/lib/books.functions";

function NotFoundComponent() {
  return (
    <div className="container py-5 text-center">
      <h1 className="display-1 fw-bold">404</h1>
      <h2 className="h4">Page not found</h2>
      <p className="text-muted">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn btn-accent">
        Back to the library
      </Link>
    </div>
  );
}

function ErrorComponent({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  console.error(error);

  const router = useRouter();

  useEffect(() => {
    reportLovableError(error, {
      boundary: "tanstack_root_error_component",
    });
  }, [error]);

  return (
    <div className="container py-5 text-center">
      <h1 className="h3">This page didn't load</h1>

      <p className="text-muted">
        Something went wrong on our end. You can try again or head home.
      </p>

      <div className="d-flex justify-content-center gap-2">
        <button
          className="btn btn-accent"
          onClick={() => {
            router.invalidate();
            reset();
          }}
        >
          Try again
        </button>

        <a href="/" className="btn btn-outline-secondary">
          Go home
        </a>
      </div>
    </div>
  );
}

export const Route =
  createRootRouteWithContext<{ queryClient: QueryClient }>()({
    head: () => ({
      meta: [
        { charSet: "utf-8" },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1",
        },
        {
          title: "Book Explorer — Online Digital Library",
        },
        {
          name: "description",
          content:
            "Browse, search, and collect books from our digital library.",
        },
      ],

      links: [
        {
          rel: "stylesheet",
          href: "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css",
          integrity:
            "sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH",
          crossOrigin: "anonymous",
        },
        {
          rel: "stylesheet",
          href: appCss,
        },
        {
          rel: "icon",
          href: "/favicon.ico",
          type: "image/x-icon",
        },
      ],

      scripts: [
        {
          src: "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js",
          integrity:
            "sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA5dN6N6jIeHz",
          crossOrigin: "anonymous",
          defer: true,
        },
      ],
    }),

    shellComponent: RootShell,
    component: RootComponent,
    notFoundComponent: NotFoundComponent,
    errorComponent: ErrorComponent,
  });

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>

      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <SiteNavbar />

      <main className="site-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container text-center">
          <span>
            Online Book Explorer — your online digital library. Built with
            Bootstrap 5.
          </span>
        </div>
      </footer>
    </QueryClientProvider>
  );
}

function SiteNavbar() {
  const queryClient = useQueryClient();

  const { data: cartItems } = useQuery({
    queryKey: ["cart"],
    queryFn: () => getCart(),
    retry: false,
  });

  const cartCount = (cartItems ?? []).reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  useEffect(() => {
    queryClient.invalidateQueries({
      queryKey: ["cart"],
    });
  }, [queryClient]);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark site-navbar">
      <div className="container">
        <Link to="/" className="navbar-brand">
          Online Book Explorer
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          aria-controls="mainNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="mainNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link
                to="/"
                className="nav-link"
                activeOptions={{ exact: true }}
              >
                Home
              </Link>
            </li>

            <li className="nav-item">
              <a href="/#books" className="nav-link">
                Books
              </a>
            </li>

            <li className="nav-item">
              <Link to="/categories" className="nav-link">
                Categories
              </Link>
            </li>

            <li className="nav-item">
              <Link to="/about" className="nav-link">
                About
              </Link>
            </li>

            <li className="nav-item">
              <Link to="/favorites" className="nav-link">
                Favorites
              </Link>
            </li>
          </ul>

          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link to="/cart" className="nav-link position-relative">
                Cart

                {cartCount > 0 && (
                  <span className="badge rounded-pill bg-danger ms-1">
                    {cartCount}
                  </span>
                )}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}