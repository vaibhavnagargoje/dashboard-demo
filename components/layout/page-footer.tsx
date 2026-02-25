export function PageFooter() {
  return (
    <footer className="pt-4 pb-2 text-center border-t border-border-light">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-subtext-light text-xs">
          &copy; 
        </p>
        <div className="flex items-center gap-4 text-xs">
          <button className="text-subtext-light hover:text-primary transition-colors">
            Help
          </button>
          <button className="text-subtext-light hover:text-primary transition-colors">
            Privacy
          </button>
          <span className="flex items-center gap-1 text-subtext-light">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            System Online
          </span>
        </div>
      </div>
    </footer>
  );
}
