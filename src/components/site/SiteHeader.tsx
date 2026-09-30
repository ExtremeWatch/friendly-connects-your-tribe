import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/useSession";

export function SiteHeader() {
  const { user } = useSession();

  return (
    <header className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-5 py-6">
      <Link to="/" className="font-display text-xl font-semibold tracking-tight">
        Tifkira
      </Link>
      <nav className="flex flex-wrap items-center gap-1 sm:gap-2">
        <Button asChild variant="ghost" className="rounded-full">
          <Link to="/how-it-works">How it works</Link>
        </Button>
        <Button asChild variant="ghost" className="rounded-full">
          <Link to="/use-cases">Occasions</Link>
        </Button>
        <Button asChild variant="ghost" className="rounded-full">
          <Link to="/pricing">Pricing</Link>
        </Button>
        <Button asChild variant="ghost" className="rounded-full">
          <Link to="/faq">FAQ</Link>
        </Button>

        <Button asChild variant="ghost" className="rounded-full">
          <Link to="/demo">Try it yourself</Link>
        </Button>
        {user ? (
          <Button asChild variant="secondary" className="rounded-full">
            <Link to="/dashboard">My events</Link>
          </Button>
        ) : (
          <Button asChild variant="secondary" className="rounded-full">
            <Link to="/auth">Sign in</Link>
          </Button>
        )}
      </nav>
    </header>
  );
}
