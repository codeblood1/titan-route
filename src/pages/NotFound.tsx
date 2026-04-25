import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Package } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md text-center p-8">
        <div className="text-6xl mb-4 animate-bounce">
          <Package className="h-16 w-16 text-blue-600 mx-auto" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-slate-700 mb-3">Page Not Found</h2>
        <p className="text-slate-500 mb-6">
          The page you are looking for seems to have been rerouted. Let us get you back on track!
        </p>
        <Button onClick={() => navigate("/")} className="bg-blue-700 hover:bg-blue-800">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      </Card>
    </div>
  );
}
