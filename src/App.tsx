import { createHashRouter, RouterProvider } from "react-router-dom";

import Header from "./components/Header";
import AboutPage from "./pages/AboutPage";
import HomePage from "./pages/HomePage";
import PostPage from "./pages/PostPage";
import { ThemeProvider } from "./state/ThemeContext";

const menuItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "GitHub", href: "https://github.com/the-mr-compiler/my-blogs" },
];

const router = createHashRouter([
  {
    path: "/",
    element: (
      <div className="bg-base-100 min-h-screen">
        <Header title="Blogs" showToggleTheme menuItems={menuItems} />
        <HomePage />
      </div>
    ),
  },
  {
    path: "/about",
    element: (
      <div className="bg-base-100 min-h-screen">
        <Header title="Blogs" showToggleTheme menuItems={menuItems} />
        <AboutPage />
      </div>
    ),
  },
  {
    path: "/post/:slug",
    element: (
      <div className="bg-base-100 min-h-screen">
        <Header title="Blogs" showToggleTheme menuItems={menuItems} />
        <PostPage />
      </div>
    ),
  },
]);

function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
