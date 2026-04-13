export default function Card({ children, className = "" }) {
  
  return (
    <div
      className={`
        border-4 border-black dark:border-zinc-600
        bg-white dark:bg-zinc-800
        text-black dark:text-white
        rounded-3xl p-6
        w-full max-w-lg
        ${className}
      `}
    >
      {children}
    </div>
  );
}