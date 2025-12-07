import { AppLayout } from "@/shared/layout/AppLayout";
import { Button } from "@/shared/ui/button";

export default function Home() {
  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h1 className="text-4xl font-bold mb-3 tracking-tight">
          New Phone Who Dis
        </h1>
        <p className="text-muted-foreground text-lg mb-8 max-w-md">
          Start a new game or join an existing one to play with friends!
        </p>
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <Button size="lg" className="w-full">
            Start a new game
          </Button>
          <Button variant="outline" size="lg" className="w-full">
            Join an existing game
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
