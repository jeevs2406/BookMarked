import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/library", label: "My Library" },
  { to: "/browse", label: "Browse" },
  { to: "/plan", label: "Reading Plan" },
  //{ to: "/journal", label: "Journal" }, future feature!
];

export function NavBar() {
  return (
    <nav className="bg-bg-secondary border-b border-bg-elevated px-8 py-4 flex items-center gap-8">
      <span className="font-serif text-text-primary text-lg mr-4">
        BookMarked
      </span>
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `font-sans text-sm transition-colors ${
              isActive
                ? "text-accent-terracotta"
                : "text-text-secondary hover:text-text-primary"
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
