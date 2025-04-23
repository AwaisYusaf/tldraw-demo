import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Menu,
  Save,
  Code,
  History,
  Type,
  Download,
  Move,
  Trash2,
} from "lucide-react";

function WireframeDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Menu />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 mr-44">
        <DropdownMenuItem>
          <Save className="mr-2 h-4 w-4" />
          Save
          <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Code className="mr-2 h-4 w-4" />
          Show Code
          <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <History className="mr-2 h-4 w-4" />
          Prompt History
          <DropdownMenuShortcut>⌘H</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Type className="mr-2 h-4 w-4" />
          Change Font
          <DropdownMenuShortcut>⌘F</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Download className="mr-2 h-4 w-4" />
          Export
          <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Move className="mr-2 h-4 w-4" />
          Move
          <DropdownMenuShortcut>⌘M</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem className="text-red-600">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete forever
          <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default WireframeDropdown;
