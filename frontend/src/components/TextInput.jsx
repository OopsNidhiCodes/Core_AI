import { useState } from "react";

export default function TextInput({ onSubmit }) {
  const [text, setText] = useState("");

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text..."
      />
      <button onClick={() => onSubmit(text)}>Process</button>
    </div>
  );
}
