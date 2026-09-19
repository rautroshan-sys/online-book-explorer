import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  queryOptions,
  useQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useState } from "react";

import {
  getBook,
  getFavoriteIds,
  toggleFavorite,
  addToCart,
} from "@/lib/books.functions";

const bookQueryOptions = (bookId: string) =>
  queryOptions({
    queryKey: ["books", "detail", bookId],
    queryFn: async () => {
      const book = await getBook({ data: { id: bookId } });

      if (!book) {
        throw notFound();
      }

      return book;
    },
  });

export const Route = createFileRoute("/books/$bookId")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      bookQueryOptions(params.bookId),
    ),

  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData.title} — Book Explorer`
          : "Book — Book Explorer",
      },
      {
        name: "description",
        content:
          loaderData?.description ??
          "Book details from the Book Explorer library.",
      },
      {
        property: "og:title",
        content: loaderData
          ? `${loaderData.title} by ${loaderData.author}`
          : "Book Explorer",
      },
      {
        property: "og:description",
        content:
          loaderData?.description ??
          "Book details from the Book Explorer library.",
      },
      {
        property: "og:type",
        content: "book",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
    ],
  }),

  errorComponent: ({ error }) => (
    <div className="container py-5" role="alert">
      <div className="alert alert-danger">
        Could not load this book: {error.message}
      </div>
    </div>
  ),

  notFoundComponent: () => (
    <div className="container py-5 text-center">
      <h1 className="h3">Book not found</h1>

      <p className="text-muted">
        This title may have been removed from the library.
      </p>

      <Link to="/" className="btn btn-accent">
        Browse all books
      </Link>
    </div>
  ),

  component: BookDetailPage,
});

function BookDetailPage() {
  const { bookId } = Route.useParams();

  const { data: book } = useSuspenseQuery(
    bookQueryOptions(bookId),
  );

  const [added, setAdded] = useState(false);

  const {
    data: favoriteIds,
    refetch: refetchFavorites,
  } = useQuery({
    queryKey: ["favorite-ids"],
    queryFn: () => getFavoriteIds(),
  });

  const isFavorite =
    favoriteIds?.includes(book.id) ?? false;

  return (
    <div className="container py-5">
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/">Browse</Link>
          </li>

          <li
            className="breadcrumb-item active"
            aria-current="page"
          >
            {book.title}
          </li>
        </ol>
      </nav>

      <div className="row g-5">
        <div className="col-md-4">
          <img
            src={book.cover_image}
            alt={`Cover of ${book.title}`}
            className="detail-cover"
            width={640}
            height={960}
          />
        </div>

        <div className="col-md-8">
          <span className="badge category-badge mb-2">
            {book.category}
          </span>

          <h1 className="h2 fw-bold">
            {book.title}
          </h1>

          <p className="lead text-muted">
            by {book.author}
          </p>

          <p className="fs-5">
            <span className="rating-star">★</span>{" "}
            {book.rating.toFixed(1)} / 5
          </p>

          <p>{book.description}</p>

          <dl className="row detail-meta">
            <dt className="col-sm-3">ISBN</dt>
            <dd className="col-sm-9">
              {book.isbn}
            </dd>

            <dt className="col-sm-3">Published</dt>
            <dd className="col-sm-9">
              {book.published_year}
            </dd>

            <dt className="col-sm-3">Availability</dt>
            <dd className="col-sm-9">
              {book.stock > 0 ? (
                <span className="badge bg-success">
                  In stock ({book.stock})
                </span>
              ) : (
                <span className="badge stock-badge-out">
                  Out of stock
                </span>
              )}
            </dd>
          </dl>

          <div className="d-flex align-items-center gap-3 mt-4 flex-wrap">
            <span className="fs-3 fw-bold">
              ${book.price.toFixed(2)}
            </span>

            <button
              type="button"
              className="btn btn-accent"
              disabled={book.stock === 0}
              onClick={async () => {
                await addToCart({
                  data: { bookId: book.id },
                });

                setAdded(true);

                setTimeout(
                  () => setAdded(false),
                  2000,
                );
              }}
            >
              {added ? "Added ✓" : "Add to cart"}
            </button>

            <button
              type="button"
              className="btn btn-outline-accent"
              onClick={async () => {
                await toggleFavorite({
                  data: { bookId: book.id },
                });

                refetchFavorites();
              }}
            >
              {isFavorite
                ? "♥ Saved to favorites"
                : "♡ Add to favorites"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}