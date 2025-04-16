import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <div className="flex flex-col items-center justify-center space-y-4">
        <h1 className="text-4xl font-bold">TL Draw Demo</h1>
        <Link href="/demo">
          <Button>View Demo</Button>
        </Link>
      </div>
    </div>
  );
}
