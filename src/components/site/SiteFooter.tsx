import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-8 border-t">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm text-muted-foreground">
        <p className="font-display text-base text-foreground">Tifkira</p>
        <nav className="flex flex-wrap gap-4">
          <Link to="/how-it-works" className="hover:text-primary">
            How it works
          </Link>
          <Link to="/use-cases" className="hover:text-primary">
            Occasions
          </Link>
          <Link to="/pricing" className="hover:text-primary">
            Pricing
          </Link>
          <Link to="/faq" className="hover:text-primary">
            FAQ
          </Link>

          <Link to="/demo" className="hover:text-primary">
            Try it yourself
          </Link>
          <Link to="/contact" className="hover:text-primary">
            Contact
          </Link>
        </nav>
        <p>© {new Date().getFullYear()} Tifkira</p>
      </div>
    </footer>
  );
}
