import { FileQuestion, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground relative overflow-hidden p-6">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="relative z-10 text-center max-w-lg mx-auto p-12 bg-card/40 backdrop-blur-xl border border-border/30 shadow-lg rounded-2xl flex flex-col items-center">
        <div className="h-24 w-24 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 shadow-inner ring-1 ring-primary/20">
          <FileQuestion className="h-12 w-12 text-primary opacity-90" />
        </div>
        
        <h1 className="text-6xl font-extrabold tracking-tight mb-4 font-display text-foreground">404</h1>
        <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
        
        <p className="text-muted-foreground mb-10 leading-relaxed font-medium">
          We couldn't find the page you were looking for. It might have been moved, deleted, or perhaps the URL is incorrect.
        </p>
        
        <Button size="lg" className="h-12 px-8 rounded-full shadow-lg hover:shadow-md transition-all duration-300 w-full sm:w-auto" onClick={() => navigate("/")}>
          <Home className="mr-2 w-5 h-5" />
          Back to Home
        </Button>
      </div>
    </div>
  );
}
