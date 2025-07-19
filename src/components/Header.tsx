import { Link } from "react-router-dom";
import DarkModeToggle from "./DarkModeToggle";

type MenuItemProp = {
  label: string;
  href?: string;
  submenu?: MenuItemProp[];
};

type HeaderProps = {
  title: string;
  menuItems?: MenuItemProp[];
  showToggleTheme?: boolean;
};

const MenuItem = ({ label, submenu, href }: MenuItemProp) => {
  return (
    <li>
      <Link to={href || "#"}>{label}</Link>
      {submenu && submenu.length > 0 && (
        <ul className="p-2">
          {submenu.map((subItem, index) => (
            <MenuItem key={index} {...subItem} />
          ))}
        </ul>
      )}
    </li>
  );
};

const Header = ({ title, menuItems, showToggleTheme }: HeaderProps) => {
  return (
    <header className="navbar bg-base-100 sticky top-0 z-50 shadow-md">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
          >
            {menuItems?.map((item) => (
              <MenuItem
                key={item.label}
                label={item.label}
                submenu={item.submenu}
                href={item.href}
              />
            ))}
          </ul>
        </div>
        <Link to="/" className="btn btn-ghost text-xl">
          {title}
        </Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          {menuItems?.map((item) => (
            <MenuItem
              key={item.label}
              label={item.label}
              submenu={item.submenu}
              href={item.href}
            />
          ))}
        </ul>
      </div>
      <div className="navbar-end">{showToggleTheme && <DarkModeToggle />}</div>
    </header>
  );
};

export default Header;
