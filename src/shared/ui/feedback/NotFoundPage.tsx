import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BrandLockup } from "@/shared/ui/brand/BrandMark";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <BrandLockup />
      <div>
        <p className="score text-8xl text-muted-foreground/40">404</p>
        <p className="mt-2 text-muted-foreground">Esa página no existe o se movió.</p>
      </div>
      <Button asChild>
        <Link to="/">Ir al inicio</Link>
      </Button>
    </div>
  );
}

export default NotFoundPage;
