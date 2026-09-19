import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";

import {
  listBooks,
  listCategories,
  getFavoriteIds,
  toggleFavorite,
  addToCart,
} from "@/lib/books.functions";

type BookSearch = {
  q?: string | undefined;
  category?: string | undefined;
  maxPrice?: number | undefined;
  inStock?: boolean | undefined;
  sort?: "newest" | "price-asc" | "price-desc" | "rating" | undefined;
};

const booksQueryOptions = (search: BookSearch) =>
  queryOptions({
    queryKey: ["books", search],
    queryFn: () =>
      listBooks({
        data: {
          q: search.q ?? "",
          category: search.category ?? "",
          maxPrice: search.maxPrice ?? 0,
          inStock: search.inStock ?? false,
          sort: search.sort ?? "newest",
        },
      }),
  });

const categoriesQueryOptions = queryOptions({
  queryKey: ["categories"],
  queryFn: () => listCategories(),
});

export const Route = createFileRoute("/")({
  validateSearch: (search): BookSearch => ({
    q: typeof search["q"] === "string" ? search["q"] : "",
    category: typeof search["category"] === "string" ? search["category"] : "",
    maxPrice: Number(search["maxPrice"]) > 0 ? Number(search["maxPrice"]) : 0,
    inStock: search["inStock"] === true || search["inStock"] === "true",
    sort: ["newest", "price-asc", "price-desc", "rating"].includes(
      search["sort"] as string,
    )
      ? (search["sort"] as NonNullable<BookSearch["sort"]>)
      : "newest",
  }),

  loaderDeps: ({ search }) => ({ search }),

  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(booksQueryOptions(deps.search)),

  head: () => ({
    meta: [
      { title: "Browse Books — Book Explorer" },
      {
        name: "description",
        content:
          "Search and filter our digital library by category, price, and rating.",
      },
      { property: "og:title", content: "Browse Books — Book Explorer" },
      {
        property: "og:description",
        content:
          "Search and filter our digital library by category, price, and rating.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),

  errorComponent: ({ error }) => (
    <div className="container py-5" role="alert">
      <div className="alert alert-danger">
        Could not load the library: {error.message}
      </div>
    </div>
  ),

  notFoundComponent: () => (
    <div className="container py-5 text-center">
      No books found.
    </div>
  ),

  component: BrowsePage,
});

function BrowsePage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/" });

  const { data: books } = useSuspenseQuery(booksQueryOptions(search));
  const { data: categories } = useSuspenseQuery(categoriesQueryOptions);

  const { data: favoriteIds, refetch: refetchFavorites } = useQuery({
    queryKey: ["favorite-ids"],
    queryFn: () => getFavoriteIds(),
  });

  const [registrationMessage, setRegistrationMessage] = useState("");
  const registrationFormRef = useRef<HTMLFormElement>(null);

  const setSearch = (patch: Partial<BookSearch>) =>
    navigate({
      search: (prev) => ({ ...prev, ...patch }),
      replace: true,
    });

  return (
    <div className="container py-4">
      <section className="hero-banner text-center">
        <p className="text-uppercase fw-semibold mb-2">
          College mini-project
        </p>

        <h1 className="display-5 fw-bold">
          Online Book Explorer
        </h1>

        <p className="lead mb-0">
          Discover, register, and organize books in one responsive digital
          library.
        </p>
      </section>

      <section
        id="books"
        className="section-block"
        aria-labelledby="books-heading"
      >
        <div className="section-heading text-center">
          <span className="badge category-badge mb-2">
            Books collection
          </span>

          <h2 id="books-heading" className="h2 fw-bold">
            Browse books
          </h2>

          <p className="text-muted mb-0">
            Showing {books.length} titles from our digital library.
          </p>
        </div>

        <div
          className="filter-panel mb-4"
          aria-label="Search and filters"
        >
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label htmlFor="searchInput" className="form-label">
                Search
              </label>

              <input
                id="searchInput"
                type="search"
                className="form-control"
                placeholder="Title or author…"
                value={search.q}
                onChange={(e) =>
                  setSearch({ q: e.target.value })
                }
              />
            </div>

            <div className="col-md-3">
              <label htmlFor="categorySelect" className="form-label">
                Category
              </label>

              <select
                id="categorySelect"
                className="form-select"
                value={search.category}
                onChange={(e) =>
                  setSearch({ category: e.target.value })
                }
              >
                <option value="">All categories</option>

                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-2">
              <label htmlFor="maxPriceInput" className="form-label">
                Max price ($)
              </label>

              <input
                id="maxPriceInput"
                type="number"
                min={0}
                step={1}
                className="form-control"
                placeholder="Any"
                value={search.maxPrice || ""}
                onChange={(e) =>
                  setSearch({
                    maxPrice: Number(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div className="col-md-3">
              <label htmlFor="sortSelect" className="form-label">
                Sort by
              </label>

              <select
                id="sortSelect"
                className="form-select"
                value={search.sort}
                onChange={(e) =>
                  setSearch({
                    sort: e.target.value as BookSearch["sort"],
                  })
                }
              >
                <option value="newest">Newest</option>
                <option value="rating">Top rated</option>
                <option value="price-asc">
                  Price: low to high
                </option>
                <option value="price-desc">
                  Price: high to low
                </option>
              </select>
            </div>

            <div className="col-12">
              <div className="form-check">
                <input
                  id="inStockCheck"
                  className="form-check-input"
                  type="checkbox"
                  checked={search.inStock}
                  onChange={(e) =>
                    setSearch({
                      inStock: e.target.checked,
                    })
                  }
                />

                <label
                  className="form-check-label"
                  htmlFor="inStockCheck"
                >
                  Show in-stock titles only
                </label>
              </div>
            </div>
          </div>
        </div>

        {books.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon" aria-hidden>
              📚
            </div>

            <h2 className="h4">
              No books match your filters
            </h2>

            <p>
              Try widening the price range or clearing the search.
            </p>
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
            {books.map((book) => (
              <div className="col" key={book.id}>
                <article className="card book-card">
                  <Link
                    to="/books/$bookId"
                    params={{ bookId: book.id }}
                  >
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
                      <span className="badge category-badge">
                        {book.category}
                      </span>

                      <span className="badge price-badge">
                        ${book.price.toFixed(2)}
                      </span>
                    </div>

                    <h2 className="card-title h6">
                      <Link
                        to="/books/$bookId"
                        params={{ bookId: book.id }}
                        className="text-decoration-none text-dark"
                      >
                        {book.title}
                      </Link>
                    </h2>

                    <p className="card-text text-muted small mb-1">
                      {book.author}
                    </p>

                    <p className="card-text small mb-2">
                      <strong>Category:</strong> {book.category}
                    </p>

                    <p className="card-text small mb-2">
                      <span className="rating-star">★</span>{" "}
                      {book.rating.toFixed(1)}

                      <span
                        className={`badge ms-2 ${
                          book.stock > 0
                            ? "bg-success"
                            : "stock-badge-out"
                        }`}
                      >
                        {book.stock > 0
                          ? "Available"
                          : "Not available"}
                      </span>
                    </p>

                    <Link
                      to="/books/$bookId"
                      params={{ bookId: book.id }}
                      className="btn btn-outline-secondary btn-sm mb-2"
                    >
                      View Details
                    </Link>

                    <div className="mt-auto d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-accent btn-sm flex-grow-1"
                        disabled={book.stock === 0}
                        onClick={async () => {
                          await addToCart({
                            data: { bookId: book.id },
                          });
                        }}
                      >
                        Add to cart
                      </button>

                      <button
                        type="button"
                        className="btn btn-outline-accent btn-sm"
                        aria-label={`Toggle favorite for ${book.title}`}
                        onClick={async () => {
                          await toggleFavorite({
                            data: { bookId: book.id },
                          });

                          refetchFavorites();
                        }}
                      >
                        {favoriteIds?.includes(book.id)
                          ? "♥"
                          : "♡"}
                      </button>
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </div>
        )}
      </section>

      <section
        id="register"
        className="registration-section section-block"
        aria-labelledby="register-heading"
      >
        <div className="row justify-content-center">
          <div className="col-md-10 col-lg-8">
            <div className="section-heading text-center">
              <span className="badge category-badge mb-2">
                Book entry
              </span>

              <h2 id="register-heading" className="h2 fw-bold">
                Book Registration Form
              </h2>

              <p className="text-muted mb-0">
                Enter book details for the library record.
              </p>
            </div>

            {registrationMessage && (
              <div className="alert alert-success" role="status">
                {registrationMessage}
              </div>
            )}

            <form
              ref={registrationFormRef}
              className="registration-form border p-4"
              onSubmit={(event) => {
                event.preventDefault();

                setRegistrationMessage(
                  "Book details submitted successfully for review.",
                );

                registrationFormRef.current?.reset();
              }}
              onReset={() => setRegistrationMessage("")}
            >
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="bookName" className="form-label">
                    Book name
                  </label>

                  <input
                    id="bookName"
                    name="bookName"
                    className="form-control"
                    type="text"
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label htmlFor="authorName" className="form-label">
                    Author name
                  </label>

                  <input
                    id="authorName"
                    name="authorName"
                    className="form-control"
                    type="text"
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label htmlFor="isbn" className="form-label">
                    ISBN
                  </label>

                  <input
                    id="isbn"
                    name="isbn"
                    className="form-control"
                    type="text"
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label
                    htmlFor="registrationCategory"
                    className="form-label"
                  >
                    Category
                  </label>

                  <select
                    id="registrationCategory"
                    name="category"
                    className="form-select"
                    required
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Select a category
                    </option>

                    <option>Programming</option>
                    <option>Database</option>
                    <option>Web Development</option>
                    <option>Artificial Intelligence</option>
                    <option>Fiction</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label htmlFor="bookPrice" className="form-label">
                    Price
                  </label>

                  <div className="input-group">
                    <span className="input-group-text">$</span>

                    <input
                      id="bookPrice"
                      name="price"
                      className="form-control"
                      type="number"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <span className="form-label d-block">
                    Availability
                  </span>

                  <div className="form-check form-check-inline">
                    <input
                      id="available"
                      className="form-check-input"
                      type="radio"
                      name="availability"
                      value="available"
                      required
                    />

                    <label
                      className="form-check-label"
                      htmlFor="available"
                    >
                      Available
                    </label>
                  </div>

                  <div className="form-check form-check-inline">
                    <input
                      id="notAvailable"
                      className="form-check-input"
                      type="radio"
                      name="availability"
                      value="not-available"
                    />

                    <label
                      className="form-check-label"
                      htmlFor="notAvailable"
                    >
                      Not Available
                    </label>
                  </div>
                </div>

                <div className="col-12">
                  <label
                    htmlFor="bookDescription"
                    className="form-label"
                  >
                    Book description
                  </label>

                  <textarea
                    id="bookDescription"
                    name="description"
                    className="form-control"
                    rows={4}
                    required
                  />
                </div>

                <div className="col-12 d-flex flex-wrap gap-2 justify-content-center mt-4">
                  <button
                    type="submit"
                    className="btn btn-accent px-4"
                  >
                    Submit
                  </button>

                  <button
                    type="reset"
                    className="btn btn-outline-secondary px-4"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}