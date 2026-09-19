import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Online Book Explorer" },
      {
        name: "description",
        content: "Learn about the responsive Online Book Explorer college mini-project.",
      },
      { property: "og:title", content: "About — Online Book Explorer" },
      {
        property: "og:description",
        content:
          "A simple full-stack-ready digital library built with HTML5, CSS3, and Bootstrap 5.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="container content-page">
      <header className="section-heading text-center">
        <span className="badge category-badge mb-2">About the project</span>
        <h1 className="h2 fw-bold">Online Book Explorer</h1>
        <p className="text-muted">
          A responsive digital library mini-project with a full-stack-ready structure.
        </p>
      </header>
      <div className="row g-4">
        <div className="col-md-4">
          <section className="about-feature">
            <h2 className="h5">HTML5 &amp; CSS3</h2>
            <p className="mb-0">
              Semantic page sections and a separate hand-written stylesheet provide a clear
              presentation layer.
            </p>
          </section>
        </div>
        <div className="col-md-4">
          <section className="about-feature">
            <h2 className="h5">Bootstrap 5</h2>
            <p className="mb-0">
              The navbar, grid, cards, forms, buttons, badges, and dropdown use real Bootstrap
              components.
            </p>
          </section>
        </div>
        <div className="col-md-4">
          <section className="about-feature">
            <h2 className="h5">Full-stack ready</h2>
            <p className="mb-0">
              Book data, authentication, favorites, and cart features are connected through a
              structured data layer.
            </p>
          </section>
        </div>
      </div>
      <div className="text-center mt-4">
        <Link to="/" className="btn btn-accent">
          Browse books
        </Link>
      </div>
    </div>
  );
}
