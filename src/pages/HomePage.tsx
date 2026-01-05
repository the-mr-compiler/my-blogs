import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPostsList } from "../utils/fetchPosts";

type Post = {
  title: string;
  slug: string;
  date: string;
  description: string;
  file: string;
};

function HomePage() {
  const navigate = useNavigate();

  const [sortedPosts, setSortedPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetchPostsList().then((result) => {
      setSortedPosts(result);
    });

    return () => {};
  }, []);

  if (!sortedPosts || sortedPosts.length === 0)
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-8 p-4">Loading..</div>
    );

  const latestPost = sortedPosts[0];
  const otherPosts = sortedPosts.slice(1);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 p-4">
      {/* Banner for latest post */}
      <div
        className="card card-lg image-full cursor-pointer"
        onClick={() => navigate(`/post/${latestPost.slug}`)}
      >
        <figure>
          <img
            src={`https://picsum.photos/800/300?random=1`}
            alt={latestPost.title}
            className="h-64 w-full object-cover"
          />
        </figure>
        <div className="card-body">
          <h2 className="card-title text-3xl font-bold">{latestPost.title}</h2>
          <p className="text-base-content/80 mb-2">{latestPost.description}</p>
          <div className="card-actions">
            <button
              className="btn btn-primary btn-lg"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/post/${latestPost.slug}`);
              }}
            >
              Read Latest
            </button>
          </div>
        </div>
      </div>

      {/* List of other posts */}
      <div className="grid gap-6 sm:grid-cols-2">
        {otherPosts.map((post, idx) => (
          <div key={post.slug} className="card card-md shadow-md">
            <figure>
              <img
                src={`https://picsum.photos/400/200?random=${idx + 2}`}
                alt={post.title}
                className="h-32 w-full object-cover"
              />
            </figure>
            <div className="card-body">
              <h3 className="card-title text-xl font-semibold">{post.title}</h3>
              <p className="text-base-content/70 mb-2">{post.description}</p>
              <div className="card-actions">
                <button
                  className="btn btn-outline btn-primary"
                  onClick={() => navigate(`/post/${post.slug}`)}
                >
                  Open
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HomePage;
