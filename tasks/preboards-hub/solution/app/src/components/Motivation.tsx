import { Shuffle } from "lucide-react";
import { QUOTES } from "../lib/quotes";
import { Button, Card, muted } from "./ui";

export default function Motivation({ index, onShuffle, onSpeak }: { index: number; onShuffle: () => void; onSpeak: (text: string) => void }) {
  const q = QUOTES[index] ?? QUOTES[0];
  return (
    <Card id="motivation" title="Daily motivation">
      <figure>
        <blockquote className="text-lg font-medium leading-relaxed text-slate-900 sm:text-xl dark:text-slate-100">“{q.text}”</blockquote>
        <figcaption className={`mt-3 text-sm ${muted}`}>{q.author}</figcaption>
      </figure>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button onClick={onShuffle}>
          <Shuffle className="size-4" aria-hidden="true" />
          New quote
        </Button>
        <Button variant="ghost" onClick={() => onSpeak(`${q.text} ${q.author}.`)}>
          Read it aloud
        </Button>
      </div>
    </Card>
  );
}
