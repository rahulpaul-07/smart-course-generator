import Navbar from './Navbar';

export default function DashboardLayout({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <div className="pointer-events-none fixed -left-40 top-20 -z-10 h-96 w-96 rounded-full bg-violet-600/10 blur-[100px]" />
      <div className="pointer-events-none fixed -right-48 top-1/3 -z-10 h-[30rem] w-[30rem] rounded-full bg-cyan-500/10 blur-[120px]" />
      <Navbar />
      <main className="relative">{children}</main>
    </div>
  );
}
