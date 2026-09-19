import { createFileRoute, Link } from "@tanstack/react-router";

const categoryLinks = [
  { label: "Programming", filter: "Tech" },
  { label: "Database", filter: "Tech" },
  { label: "Web Development", filter: "Tech" },
  { label: "Artificial Intelligence", filter: "Tech" },
  { label: "Fiction", filter: "Fiction" },
] as const;

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Book Categories — Online Book Explorer" },
      {
        name: "description",
        content:
          "Explore programming, database, web development, artificial intelligence, and fiction books.",
      },
      { property: "og:title", content: "Book Categories — Online Book Explorer" },
      {
        property: "og:description",
        content: "Choose a category and discover books in the Online Book Explorer.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  return (
    <div className="container content-page">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="category-menu-card">
            <span className="badge category-badge mb-3">Categories</span>
            <h1 className="h2 fw-bold">Explore by category</h1>
            <p className="text-muted mb-4">Use the Bootstrap dropdown to choose a subject.</p>
            <div className="dropdown">
              <button
                className="btn btn-accent dropdown-toggle"
                type="button"
                id="categoryDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Select a category
              </button>
              <ul className="dropdown-menu" aria-labelledby="categoryDropdown">
                {categoryLinks.map((category) => (
                  <li key={category.label}>
                    <Link to="/" search={{ category: category.filter }} className="dropdown-item">
                      {category.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
