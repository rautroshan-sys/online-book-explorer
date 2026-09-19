import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Book Explorer" },
      {
        name: "description",
        content: "Online Book Explorer",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  return (
    <div className="container py-5">
      <div className="card mx-auto" style={{ maxWidth: "500px" }}>
        <div className="card-body p-4 text-center">
          <h1 className="h3 mb-3">Online Book Explorer</h1>

          <p className="text-muted mb-4">
            Browse our collection of books and explore different categories.
          </p>

          <Link to="/" className="btn btn-primary">
            Browse Books
          </Link>
        </div>
      </div>
    </div>
  );
}