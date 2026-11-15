import { useEffect, useRef } from "react";
import type { FormEvent } from "react";
import * as server from "../server";
import type { Room } from "../server";
import type { Run } from "../App";

interface Props {
  room: Room;
  me: string;
  run: Run;
}

const word = (choice: Room["choice"]) => (choice === "dare" ? "dare" : "truth");

/** One focused screen per step after the spin: choose, write the question, then the challenge. */
export default function Stage({ room, me, run, stage }: Props & { stage: "choosing" | "asking" | "answering" }) {
  const target = room.players[room.spin!.target];
  const other = room.players[1 - room.spin!.target];
  const picked = target.id === me;
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => heading.current?.focus({ preventScroll: true }), [stage]);

  if (stage === "choosing")
    return picked ? (
      <div className="stage" key="choose" data-stage="choosing">
        <p className="stage-note">The bottle picked you, {target.name}.</p>
        <h2 tabIndex={-1} ref={heading}>Truth or dare?</h2>
        <div className="choices">
          <button className="btn choice" onClick={() => run(() => server.choose(room.id, me, "truth"))}>
            Truth
          </button>
          <button className="btn choice choice-dare" onClick={() => run(() => server.choose(room.id, me, "dare"))}>
            Dare
          </button>
        </div>
        <p className="stage-help">With truth, {other.name} asks you a question. With dare, {other.name} gives you something to do.</p>
      </div>
    ) : (
      <div className="stage" key="choose-wait" data-stage="choosing">
        <p className="stage-note">The bottle picked {target.name}.</p>
        <h2 tabIndex={-1} ref={heading}>{target.name} is choosing truth or dare</h2>
        <p className="stage-help">You'll write the question once they've chosen.</p>
      </div>
    );

  if (stage === "asking")
    return picked ? (
      <div className="stage" key="ask-wait" data-stage="asking">
        <p className="stage-note">You chose {word(room.choice)}.</p>
        <h2 tabIndex={-1} ref={heading}>{other.name} is writing your {room.choice === "dare" ? "dare" : "question"}</h2>
        <p className="stage-help">It will appear here when they send it.</p>
      </div>
    ) : (
      <AskForm room={room} me={me} run={run} targetName={target.name} heading={heading} />
    );

  return (
    <div className="stage" key="answer" data-stage="answering">
      <p className="stage-note">
        {picked ? `Your ${word(room.choice)}, from ${other.name}` : `${target.name}'s ${word(room.choice)}, from you`}
      </p>
      <h2 tabIndex={-1} ref={heading} className="challenge">
        {room.question}
      </h2>
      {picked ? (
        <div className="stage-actions">
          <button className="btn btn-primary" onClick={() => run(() => server.finishRound(room.id))}>
            {room.choice === "dare" ? "Dare done" : "Answered"}
          </button>
        </div>
      ) : (
        <p className="stage-help">Round {room.round + 1} starts when {target.name} is done.</p>
      )}
    </div>
  );
}

function AskForm({ room, me, run, targetName, heading }: Props & { targetName: string; heading: React.RefObject<HTMLHeadingElement | null> }) {
  const dare = room.choice === "dare";
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = String(new FormData(e.currentTarget).get("question") || "");
    run(() => server.ask(room.id, me, text));
  };
  return (
    <form className="stage stage-form" key="ask" data-stage="asking" onSubmit={submit}>
      <p className="stage-note">{targetName} chose {dare ? "dare" : "truth"}.</p>
      <h2 tabIndex={-1} ref={heading}>{dare ? `Write a dare for ${targetName}` : `Write a question for ${targetName}`}</h2>
      <div className="field">
        <label htmlFor="question">{dare ? "Your dare" : "Your question"}</label>
        <textarea
          id="question"
          name="question"
          rows={3}
          maxLength={200}
          required
          enterKeyHint="send"
          onFocus={(e) => setTimeout(() => e.target.form?.querySelector("button")?.scrollIntoView({ block: "nearest" }), 300)}
        />
      </div>
      <div className="stage-actions sticky-submit">
        <button type="submit" className="btn btn-primary">
          Send to {targetName}
        </button>
      </div>
    </form>
  );
}
