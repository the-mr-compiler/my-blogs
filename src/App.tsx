import Header from "./components/Header";
import AboutPage from "./pages/AboutPage";
import HomePage from "./pages/HomePage";
import PostPage from "./pages/PostPage";
import { ThemeProvider } from "./state/ThemeContext";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <div className="bg-base-100 min-h-screen">
        <Header
          title="Blogs"
          showToggleTheme
          menuItems={[
            { label: "Home", href: "/" },
            { label: "About", href: "/about" },
          ]}
        />
        <HomePage />
      </div>
    ),
  },
  {
    path: "/about",
    element: (
      <div className="bg-base-100 min-h-screen">
        <Header
          title="Blogs"
          showToggleTheme
          menuItems={[
            { label: "Home", href: "/" },
            { label: "About", href: "/about" },
          ]}
        />
        <AboutPage />
      </div>
    ),
  },
  {
    path: "/post/:slug",
    element: (
      <div className="bg-base-100 min-h-screen">
        <Header
          title="Blogs"
          showToggleTheme
          menuItems={[
            { label: "Home", href: "/" },
            { label: "About", href: "/about" },
          ]}
        />
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
