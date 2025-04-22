import { Button } from "@/components/ui/button";
import React, { useState } from "react";

type Props = {};

function WireframeAIEditor({}: Props) {
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);

  const startGenerating = async () => {
    if (!prompt || prompt.length < 5) return;
    setGenerating(true);

    // setGenerating(false);
  };

  return (
    <div className="absolute top-12 left-0 bg-white shadow-md rounded-md p-2">
      <div className="flex flex-col gap-2 w-full">
        <textarea
          placeholder="Enter your prompt"
          className="w-full border-2 border-gray-300 rounded-md text-base p-2 min-w-[300px] resize-none"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={8}
        />
        <Button
          disabled={generating || prompt.length < 5}
          onClick={startGenerating}
          className="bg-indigo-800"
        >
          {generating ? "Generating..." : "Generate"}
        </Button>
      </div>
    </div>
  );
}

export default WireframeAIEditor;
