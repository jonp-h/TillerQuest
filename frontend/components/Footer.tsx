export default function Footer() {
  return (
    <div className="flex flex-col w-full py-5 gap-2 items-center bg-gradient-to-r from-slate-900 to-slate-950">
      <h2>
        Want a feature? Found a bug? Report issue {""}
        <a
          href="https://github.com/jonp-h/TillerQuest/issues/new/choose"
          className="text-red-400 hover:text-red-500 hover:underline"
        >
          here 🪲
        </a>
      </h2>
      <h2>
        Made with ☕ by {}
        <a
          href="https://github.com/jonp-h"
          className="text-blue-400 hover:text-blue-500 hover:underline"
        >
          jonp-h
        </a>
      </h2>
      <p>2025</p>
    </div>
  );
}
