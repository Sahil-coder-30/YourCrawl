import TopNav from "../TopNav/TopNav";
import Sidebar from "../Sidebar/Sidebar";
import Footer from "../Footer/Footer";

export default function AppLayout({ children, sidebarFooter }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <TopNav />
      <div className="flex flex-1">
        <Sidebar footer={sidebarFooter} />
        <main className="flex-1 px-8 py-10">
          <div className="mx-auto max-w-[1200px]">{children}</div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
