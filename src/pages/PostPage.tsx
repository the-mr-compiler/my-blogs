import { useEffect, useState } from "react";
import { marked } from "marked";
import fm from "front-matter";
import DOMPurify from "dompurify";
import { useParams } from "react-router-dom";
import { fetchMarkdownContent } from "../utils/fetchPosts";
import "github-markdown-css/github-markdown-light.css";
import "highlight.js/styles/github.css";
import hljs from "highlight.js";

type PostType = {
  title: string;
  date: string;
  description?: string;
  content: string;
};

// Create a custom renderer
const renderer = new marked.Renderer();

renderer.code = ({ lang, text }) => {
  const validLang = hljs.getLanguage(lang || "") ? lang : "plaintext";
  const highlighted = hljs.highlight(text, { language: validLang || "" }).value;

  return `<pre><code class="hljs ${validLang}">${highlighted}</code></pre>`;
};

marked.setOptions({ renderer });

const PostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<PostType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!slug) {
        setError("No post specified.");
        setPost(null);
        return;
      }
      try {
        const md = (await fetchMarkdownContent(`${slug}.md`)) || "";
        const { attributes, body } = fm(md);
        const attrs = attributes as {
          title?: string;
          date?: string;
          description?: string;
        };
        setPost({
          title: attrs.title || slug,
          date: attrs.date || "",
          description: attrs.description,
          content: DOMPurify.sanitize(await marked.parse(body)),
        });
        setError(null);
      } catch (err) {
        setError("Failed to load post. Please try again later.");
        setPost(null);
      }
    };
    load();
  }, [slug]);

  if (error) {
    console.log(error);

    return (
      <div className="prose mx-auto px-4">
        <div className="alert alert-error mb-4">{error}</div>
      </div>
    );
  }

  if (!post) return <p>Loading...</p>;

  return (
    <div className="prose mx-auto px-4">
      <h1>{post.title}</h1>
      <p className="text-gray-500">{post.date}</p>
      <div
        className="markdown-body p-5"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </div>
  );
};

export default PostPage;
