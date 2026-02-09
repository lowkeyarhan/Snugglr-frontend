import Sidebar from "../components/layout/Sidebar";
import MainContent from "../components/user/MainContent";

export default function Home() {
  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-gray-900 dark:text-white h-screen overflow-hidden selection:bg-primary selection:text-white">
      {/* Background Pattern Layer */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-doodle-pattern opacity-100"></div>

      <div className="relative z-10 flex h-full w-full max-w-[1920px] mx-auto">
        <Sidebar />
        <MainContent />
      </div>
    </div>
  );
}
