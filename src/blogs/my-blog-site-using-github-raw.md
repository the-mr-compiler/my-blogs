---
title: 🏗️ Building a Dynamic Blog Site with React and GitHub Raw Content
date: 2026-01-05
description: Learn how I created a serverless blog platform using React, Vite, and GitHub for dynamic content delivery
---

# 🏗️ Building a Dynamic Blog Site with React and GitHub Raw Content

## 📖 Introduction

I wanted a simple yet powerful blog platform without the complexity of traditional CMS systems. This post explains how I built a dynamic blog using React and GitHub's raw content API for serverless hosting.

**The Challenge:** Create a modern blog that requires no backend maintenance or database setup.

**My Solution:** A React SPA that fetches Markdown content directly from GitHub repositories at runtime.

---

## 🎯 Project Goals

- **Serverless Architecture**: Zero backend maintenance
- **Markdown-First**: Write content in Markdown with frontmatter
- **Instant Updates**: Push to GitHub = live on site
- **Modern UI**: Responsive design with dark/light themes
- **Free Hosting**: GitHub Pages deployment

---

## 📚 Tech Stack

- **React 19 + TypeScript**: Modern React with type safety
- **Vite**: Fast build tool and dev server
- **Tailwind CSS + DaisyUI**: Utility-first styling with components
- **React Router**: Client-side routing
- **Marked + Front-matter**: Markdown parsing and metadata
- **GitHub Raw API**: Dynamic content fetching

---

## 🏗️ Project Setup

### Quick Start

```bash
npm create vite@latest markdown-blogs -- --template react-ts
cd markdown-blogs
npm install react-router-dom marked front-matter dompurify highlight.js github-markdown-css
npm install -D @tailwindcss/vite daisyui tailwindcss autoprefixer postcss gh-pages
```

### Key Configuration

**Tailwind + DaisyUI Setup:**

```css
@import "tailwindcss";
@plugin "daisyui";
```

**Project Structure:**

```
src/
├── components/     # Header, PostCard, etc.
├── pages/         # HomePage, PostPage, AboutPage
├── utils/         # fetchPosts.ts
├── blogs/         # Markdown files
└── assets/posts.json  # Blog metadata
```

---

## 🔄 Dynamic Content Strategy

Instead of bundling content, I fetch it dynamically from GitHub:

**Benefits:**

- Content updates without redeployment
- Version control for all changes
- Easy collaboration

**Implementation:**

```typescript
// Fetch blog list
export const fetchPostsList = async () => {
  const res = await fetch(
    "https://raw.githubusercontent.com/the-mr-compiler/my-blogs/main/src/assets/posts.json",
  );
  return res.json();
};

// Fetch individual post
export const fetchMarkdownContent = async (filename: string) => {
  const res = await fetch(
    `https://raw.githubusercontent.com/the-mr-compiler/my-blogs/main/src/blogs/${filename}`,
  );
  return res.text();
};
```

---

## 🎨 Key Components

**Blog Post Cards:**

```jsx
const PostCard = ({ post }) => (
  <div className="card bg-base-100 shadow-xl">
    <div className="card-body">
      <h2 className="card-title">{post.title}</h2>
      <p>{post.description}</p>
      <div className="card-actions justify-between">
        <span>{new Date(post.date).toLocaleDateString()}</span>
        <Link to={`/post/${post.slug}`} className="btn btn-primary">
          Read More
        </Link>
      </div>
    </div>
  </div>
);
```

**Markdown Rendering:**

```tsx
const PostPage = () => {
  const [content, setContent] = useState("");

  useEffect(() => {
    const loadPost = async () => {
      const md = await fetchMarkdownContent(filename);
      const html = marked.parse(md);
      setContent(DOMPurify.sanitize(html));
    };
    loadPost();
  }, [filename]);

  return (
    <article
      className="prose max-w-none"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};
```

---

## 🚀 Deployment

**GitHub Pages Setup:**

```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

**Hash Router for SPA:**

```tsx
const router = createHashRouter([
  { path: "/", element: <HomePage /> },
  { path: "/post/:slug", element: <PostPage /> },
]);
```

---

## 📝 Writing & Publishing

1. Write Markdown post in `src/blogs/` with frontmatter
2. Add entry to `src/assets/posts.json`
3. Push to GitHub
4. Run `npm run deploy`

**Post Format:**

```markdown
---
title: Your Title
date: 2026-01-05
description: Brief description
---

# Your Content Here
```

---

## 🎯 Results

**Performance:**

- Fast loading with Vite optimization
- Lighthouse scores: 95+ on mobile/desktop
- Bundle size: ~150KB gzipped

**Benefits:**

- Zero server costs
- Automatic HTTPS
- Global CDN via GitHub
- Easy maintenance

---

## 🎉 Conclusion

This approach combines the best of static and dynamic sites. By leveraging GitHub's raw API, I created a maintainable blog that updates automatically when I push content changes. The combination of Markdown authoring, GitHub hosting, and React frontend provides simplicity and power without traditional infrastructure complexity.

---

_Have questions? Check out my [GitHub repository](https://github.com/the-mr-compiler/my-blogs)!_
