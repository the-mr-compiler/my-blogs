function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <h1 className="text-center text-4xl font-bold">About This Project</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">👋 Hello!</h2>
            <p>
              I'm <strong>Meghanath Nalawade</strong>, a software engineer who
              enjoys building tools and writing technical blogs.
            </p>
          </div>
        </div>

        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">📚 Purpose</h2>
            <p>
              This site is a simple markdown-based blog powered by Vite, React,
              and DaisyUI. It's deployed using GitHub Pages.
            </p>
          </div>
        </div>

        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">🛠 Tech Stack</h2>
            <ul className="list-inside list-disc space-y-1">
              <li>React + Vite</li>
              <li>DaisyUI + Tailwind CSS</li>
              <li>Markdown + Marked</li>
              <li>GitHub Pages</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;
