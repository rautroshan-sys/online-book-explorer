import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";

import { getCart, updateCartQuantity, removeFromCart } from "@/lib/books.functions";

const cartQueryOptions = queryOptions({
  queryKey: ["cart"],
  queryFn: () => getCart(),
});

export const Route = createFileRoute("/_authenticated/cart")({
  loader: ({ context }) => context.queryClient.ensureQueryData(cartQueryOptions),
  head: () => ({
    meta: [
      { title: "My Cart — Book Explorer" },
      { name: "description", content: "Review the books in your cart and check out." },
      { property: "og:title", content: "My Cart — Online Book Explorer" },
      {
        property: "og:description",
        content: "Review the books saved in your Online Book Explorer cart.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  errorComponent: ({ error }) => (
    <div className="container py-5" role="alert">
      <div className="alert alert-danger">Could not load your cart: {error.message}</div>
    </div>
  ),
  notFoundComponent: () => <div className="container py-5">Cart not found.</div>,
  component: CartPage,
});

function CartPage() {
  const queryClient = useQueryClient();
  const { data: items } = useSuspenseQuery(cartQueryOptions);
  const [ordered, setOrdered] = useState(false);

  const lines = items.filter((item) => item.books);
  const subtotal = lines.reduce((sum, item) => sum + item.books!.price * item.quantity, 0);
  const shipping = subtotal > 50 || subtotal === 0 ? 0 : 4.99;
  const total = subtotal + shipping;

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["cart"] });

  return (
    <div className="container py-5">
      <h1 className="h3 fw-bold mb-4">My cart</h1>

      {ordered && (
        <div className="alert alert-success" role="alert">
          Thank you! Your order has been placed. (Demo checkout — no payment was taken.)
        </div>
      )}

      {lines.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon" aria-hidden>
            🛒
          </div>
          <h2 className="h4">Your cart is empty</h2>
          <p>Find your next read in the library.</p>
          <Link to="/" className="btn btn-accent">
            Browse books
          </Link>
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-md-8">
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th scope="col">Book</th>
                    <th scope="col">Price</th>
                    <th scope="col" style={{ width: 140 }}>
                      Quantity
                    </th>
                    <th scope="col">Total</th>
                    <th scope="col" aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {lines.map((item) => {
                    const book = item.books!;
                    return (
                      <tr key={item.id}>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <img
                              src={book.cover_image}
                              alt={`Cover of ${book.title}`}
                              className="cart-cover-thumb"
                              loading="lazy"
                              width={56}
                              height={84}
                            />
                            <div>
                              <Link
                                to="/books/$bookId"
                                params={{ bookId: book.id }}
                                className="text-decoration-none text-dark fw-semibold"
                              >
                                {book.title}
                              </Link>
                              <div className="text-muted small">{book.author}</div>
                            </div>
                          </div>
                        </td>
                        <td>${book.price.toFixed(2)}</td>
                        <td>
                          <div
                            className="btn-group btn-group-sm"
                            role="group"
                            aria-label="Quantity"
                          >
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              disabled={item.quantity <= 1}
                              onClick={async () => {
                                await updateCartQuantity({
                                  data: { itemId: item.id, quantity: item.quantity - 1 },
                                });
                                refresh();
                              }}
                            >
                              −
                            </button>
                            <span className="btn btn-outline-secondary disabled">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              disabled={item.quantity >= book.stock}
                              onClick={async () => {
                                await updateCartQuantity({
                                  data: { itemId: item.id, quantity: item.quantity + 1 },
                                });
                                refresh();
                              }}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td>${(book.price * item.quantity).toFixed(2)}</td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            aria-label={`Remove ${book.title} from cart`}
                            onClick={async () => {
                              await removeFromCart({ data: { itemId: item.id } });
                              refresh();
                            }}
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card cart-summary-card">
              <div className="card-body">
                <h2 className="h5 card-title">Order summary</h2>
                <ul className="list-group list-group-flush my-3">
                  <li className="list-group-item d-flex justify-content-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between fw-bold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </li>
                </ul>
                <p className="text-muted small mb-3">Free shipping on orders over $50.</p>
                <button
                  type="button"
                  className="btn btn-accent w-100"
                  onClick={() => setOrdered(true)}
                >
                  Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
