import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <div className="flex flex-col items-center justify-center space-y-4">
        <h1 className="text-4xl font-bold">TL Draw Demo</h1>
        <Link href="/demo">
          <Button>View Demo 1</Button>
        </Link>

        <Link href="/demo2">
          <Button>View Demo 2</Button>
        </Link>

        <Link href="/demo3">
          <Button>View Demo 3</Button>
        </Link>
      </div>
    </div>
  );
}
