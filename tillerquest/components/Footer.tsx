export default function Footer() {
  return (
    <div className="flex flex-col w-full py-10 items-center bg-gradient-to-r from-slate-900 to-slate-950">
      <h2>
        Made with ❤️ by {}
        <a href="https://github.com/jonp-h" className="text-blue-400">
          Pape
        </a>
      </h2>
      <p>2024</p>
    </div>
  );
}
