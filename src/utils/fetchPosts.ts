// utils/fetchPosts.js

export const fetchPostsList = async () => {
  try {
    const res = await fetch(
      "https://raw.githubusercontent.com/the-mr-compiler/my-blogs/refs/heads/main/src/assets/posts.json",
    );
    if (!res.ok) throw new Error(`Failed to fetch posts list: ${res.status}`);
    const posts = await res.json();
    // Optional: sort by date
    return posts.sort(
      (a: any, b: any) =>
        new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  } catch (err) {
    console.error("Error fetching posts list:", err);
    return [];
  }
};

export const fetchMarkdownContent = async (filename: string) => {
  try {
    const res = await fetch(
      `https://raw.githubusercontent.com/the-mr-compiler/my-blogs/refs/heads/main/src/blogs/${filename}`,
    );
    if (!res.ok) throw new Error(`Failed to fetch markdown: ${res.status}`);
    const md = await res.text();
    return md;
  } catch (err) {
    console.error(`Error fetching markdown for ${filename}:`, err);
    return null;
  }
};
