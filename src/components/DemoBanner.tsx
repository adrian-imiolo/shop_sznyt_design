function DemoBanner() {
  if (import.meta.env.VITE_DEMO_MODE !== "true") return null;

  return (
    <div className="bg-near-black text-warm-white px-4 py-2 text-center font-dm-sans text-xs tracking-wider">
      Portfolio demo — checkout and admin actions are disabled.{" "}
      <a
        href="https://github.com/adrian-imiolo/shop_sznyt_design"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-accent"
      >
        View source on GitHub
      </a>
    </div>
  );
}

export default DemoBanner;
