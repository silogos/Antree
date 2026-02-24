import { useEffect, useState } from "react";

export function Footer() {
  const [isTV, setIsTV] = useState(false);

  useEffect(() => {
    const checkTV = () => {
      const width = window.innerWidth;
      setIsTV(width >= 1024);
    };
    checkTV();
    window.addEventListener("resize", checkTV);
    return () => window.removeEventListener("resize", checkTV);
  }, []);

  return (
    <footer
      className={`fixed bottom-0 left-0 right-0 bg-gray-900 text-gray-400 py-4 transition-all duration-300 ${
        isTV ? "hidden" : "block"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm">Version: 1.0.0</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span>Built with</span>
            <span className="text-blue-400">React</span>
            <span>+</span>
            <span className="text-green-400">TypeScript</span>
            <span>+</span>
            <span className="text-purple-400">Tailwind CSS</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
