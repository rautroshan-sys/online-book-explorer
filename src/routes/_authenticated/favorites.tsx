import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";

import { getFavorites, toggleFavorite } from "@/lib/books.functions";

const favoritesQueryOptions = queryOptions({
  queryKey: ["favorites"],
  queryFn: () => getFavorites(),
});

export const Route = createFileRoute("/_authenticated/favorites")({
  loader: ({ context }) => context.queryClient.ensureQueryData(favoritesQueryOptions),
  head: () => ({
    meta: [
      { title: "My Favorites — Book Explorer" },
      { name: "description", content: "Your saved books in the Book Explorer library." },
      { property: "og:title", content: "My Favorites — Online Book Explorer" },
      {
        property: "og:description",
        content: "View your saved books in the Online Book Explorer library.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  errorComponent: ({ error }) => (
    <div className="container py-5" role="alert">
      <div className="alert alert-danger">Could not load favorites: {error.message}</div>
    </div>
  ),
  notFoundComponent: () => <div className="container py-5">No favorites found.</div>,
  component: FavoritesPage,
});

function FavoritesPage() {
  const queryClient = useQueryClient();
  const { data: favorites } = useSuspenseQuery(favoritesQueryOptions);
  const books = favorites.filter((fav) => fav.books);

  return (
    <div className="container py-5">
      <h1 className="h3 fw-bold mb-4">My favorites</h1>

      {books.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon" aria-hidden>
            ♡
          </div>
          <h2 className="h4">No favorites yet</h2>
          <p>Tap the heart on any book to save it here.</p>
          <Link to="/" className="btn btn-accent">
            Browse books
          </Link>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          {books.map((fav) => {
            const book = fav.books!;
            return (
              <div className="col" key={fav.id}>
                <article className="card book-card">
                  <Link to="/books/$bookId" params={{ bookId: book.id }}>
                    <img
                      src={book.cover_image}
                      className="card-img-top"
                      alt={`Cover of ${book.title}`}
                      loading="lazy"
                      width={640}
                      height={960}
                    />
                  </Link>
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className="badge category-badge">{book.category}</span>
                      <span className="badge price-badge">${book.price.toFixed(2)}</span>
                    </div>
                    <h2 className="card-title h6">{book.title}</h2>
                    <p className="card-text text-muted small">{book.author}</p>
                    <button
                      type="button"
                      className="btn btn-outline-accent btn-sm mt-auto"
                      onClick={async () => {
                        await toggleFavorite({ data: { bookId: book.id } });
                        queryClient.invalidateQueries({ queryKey: ["favorites"] });
                        queryClient.invalidateQueries({ queryKey: ["favorite-ids"] });
                      }}
                    >
                      ♥ Remove from favorites
                    </button>
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
