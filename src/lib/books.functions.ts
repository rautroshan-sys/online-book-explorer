import { books, type Book } from "./books.data";

export type CartItemRow = {
  id: string;
  user_id: string;
  book_id: string;
  quantity: number;
  created_at: string;
};

export type CartItemWithBook = CartItemRow & {
  books: Book | null;
};

export type FavoriteRow = {
  id: string;
  user_id: string;
  book_id: string;
  created_at: string;
};

export type FavoriteWithBook = FavoriteRow & {
  books: Book | null;
};

type SearchData = {
  q?: string;
  category?: string;
  maxPrice?: number;
  inStock?: boolean;
  sort?: "newest" | "price-asc" | "price-desc" | "rating";
};

const getStorage = (key: string): string[] => {
  if (typeof window === "undefined") return [];

  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
};

const setStorage = (key: string, value: string[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

export async function listBooks({ data }: { data: SearchData }) {
  let result = [...books];

  const q = data.q?.trim().toLowerCase() || "";

  if (q) {
    result = result.filter(
      (book) =>
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q),
    );
  }

  if (data.category) {
    result = result.filter((book) => book.category === data.category);
  }

  if (data.maxPrice && data.maxPrice > 0) {
    result = result.filter((book) => book.price <= data.maxPrice!);
  }

  if (data.inStock) {
    result = result.filter((book) => book.stock > 0);
  }

  switch (data.sort) {
    case "price-asc":
      result.sort((a, b) => a.price - b.price);
      break;

    case "price-desc":
      result.sort((a, b) => b.price - a.price);
      break;

    case "rating":
      result.sort((a, b) => b.rating - a.rating);
      break;

    default:
      result.sort((a, b) => b.published_year - a.published_year);
  }

  return result;
}

export async function getBook({
  data,
}: {
  data: { id: string };
}) {
  return books.find((book) => book.id === data.id) ?? null;
}

export async function listCategories() {
  return [...new Set(books.map((book) => book.category))].sort();
}

export async function getFavoriteIds() {
  return getStorage("favorite-books");
}

export async function getFavorites() {
  const ids = getStorage("favorite-books");

  return ids
    .map((bookId, index) => {
      const book = books.find((item) => item.id === bookId);

      if (!book) return null;

      return {
        id: String(index + 1),
        user_id: "local-user",
        book_id: bookId,
        created_at: new Date().toISOString(),
        books: book,
      };
    })
    .filter(Boolean) as FavoriteWithBook[];
}

export async function toggleFavorite({
  data,
}: {
  data: { bookId: string };
}) {
  const ids = getStorage("favorite-books");

  const index = ids.indexOf(data.bookId);

  if (index >= 0) {
    ids.splice(index, 1);
    setStorage("favorite-books", ids);
    return { favorited: false };
  }

  ids.push(data.bookId);
  setStorage("favorite-books", ids);

  return { favorited: true };
}

export async function getCart() {
  const ids = getStorage("cart-books");

  return ids
    .map((bookId, index) => {
      const book = books.find((item) => item.id === bookId);

      if (!book) return null;

      return {
        id: String(index + 1),
        user_id: "local-user",
        book_id: bookId,
        quantity: 1,
        created_at: new Date().toISOString(),
        books: book,
      };
    })
    .filter(Boolean) as CartItemWithBook[];
}

export async function addToCart({
  data,
}: {
  data: { bookId: string };
}) {
  const ids = getStorage("cart-books");

  if (!ids.includes(data.bookId)) {
    ids.push(data.bookId);
    setStorage("cart-books", ids);
  }

  return { ok: true };
}

export async function updateCartQuantity({
  data,
}: {
  data: { itemId: string; quantity: number };
}) {
  return { ok: true };
}

export async function removeFromCart({
  data,
}: {
  data: { itemId: string };
}) {
  const items = await getCart();
  const item = items.find((cartItem) => cartItem.id === data.itemId);

  if (item) {
    const ids = getStorage("cart-books");
    setStorage(
      "cart-books",
      ids.filter((id) => id !== item.book_id),
    );
  }

  return { ok: true };
}