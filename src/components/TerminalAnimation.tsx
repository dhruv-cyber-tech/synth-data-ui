import { useEffect, useState } from "react";

type Line =
  | { kind: "command"; text: string; arg?: string; typeSpeed?: number }
  | { kind: "result"; text: string; tone?: "muted" | "success"; delay?: number };

const SCRIPT: Line[] = [
  { kind: "command", text: "promptlab search", arg: '"python bug fixer"' },
  { kind: "result", text: "→ Found 12 results in 0.03s", tone: "muted", delay: 350 },
  { kind: "command", text: "promptlab install", arg: "prompt-id-4" },
  { kind: "result", text: "✓ Python Bug Fixer v1.0 installed — $12.99", tone: "success", delay: 500 },
  { kind: "command", text: "promptlab run", arg: "--model gpt-4o" },
  { kind: "result", text: "→ Analyzing 248 lines... 3 bugs fixed ✨", tone: "success", delay: 600 },
];

const TYPE_SPEED = 35; // ms per char
const RESET_DELAY = 2200;

const TerminalAnimation = () => {
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [completed, setCompleted] = useState<Line[]>([]);

  useEffect(() => {
    if (lineIdx >= SCRIPT.length) {
      const t = setTimeout(() => {
        setCompleted([]);
        setLineIdx(0);
        setCharIdx(0);
      }, RESET_DELAY);
      return () => clearTimeout(t);
    }

    const current = SCRIPT[lineIdx];
    const fullText =
      current.kind === "command"
        ? `${current.text}${current.arg ? " " + current.arg : ""}`
        : current.text;

    if (current.kind === "result") {
      // Results appear instantly after a short delay
      const t = setTimeout(() => {
        setCompleted((c) => [...c, current]);
        setLineIdx((i) => i + 1);
        setCharIdx(0);
      }, current.delay ?? 300);
      return () => clearTimeout(t);
    }

    if (charIdx < fullText.length) {
      const t = setTimeout(() => setCharIdx((c) => c + 1), TYPE_SPEED);
      return () => clearTimeout(t);
    }

    // Command finished typing; commit & move on
    const t = setTimeout(() => {
      setCompleted((c) => [...c, current]);
      setLineIdx((i) => i + 1);
      setCharIdx(0);
    }, 250);
    return () => clearTimeout(t);
  }, [lineIdx, charIdx]);

  const renderCommand = (line: Extract<Line, { kind: "command" }>, partial?: string) => {
    const cmd = line.text;
    const arg = line.arg ?? "";
    const shown = partial ?? `${cmd}${arg ? " " + arg : ""}`;

    // Split typed portion between command and arg for color
    const cmdPart = shown.slice(0, Math.min(shown.length, cmd.length));
    const argPart = shown.length > cmd.length ? shown.slice(cmd.length) : "";

    return (
      <p>
        <span className="text-primary">$</span>{" "}
        <span className="text-muted-foreground">{cmdPart}</span>
        <span className="text-accent">{argPart}</span>
      </p>
    );
  };

  const renderResult = (line: Extract<Line, { kind: "result" }>) => (
    <p className={line.tone === "success" ? "text-terminal-green" : "text-muted-foreground/60"}>
      {line.text}
    </p>
  );

  const current = lineIdx < SCRIPT.length ? SCRIPT[lineIdx] : null;
  const typingPartial =
    current?.kind === "command"
      ? `${current.text}${current.arg ? " " + current.arg : ""}`.slice(0, charIdx)
      : "";

  return (
    <div className="p-6 font-mono text-sm text-left space-y-2 min-h-[180px]">
      {completed.map((line, i) =>
        line.kind === "command" ? (
          <div key={i}>{renderCommand(line)}</div>
        ) : (
          <div key={i} className="animate-fade-in">{renderResult(line)}</div>
        )
      )}
      {current?.kind === "command" && (
        <div>
          {renderCommand(current, typingPartial)}
          <span className="inline-block w-2 h-4 bg-primary/80 ml-0.5 align-middle animate-pulse" />
        </div>
      )}
      {!current && (
        <p className="text-muted-foreground/40">
          <span className="inline-block w-2 h-4 bg-primary/80 align-middle animate-pulse" />
        </p>
      )}
    </div>
  );
};

export default TerminalAnimation;
