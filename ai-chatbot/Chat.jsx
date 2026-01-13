import { useState } from "react";

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  const send = async () => {
    const res = await fetch("http://localhost:8000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: input }),
    });

    const data = await res.json();
    setMessages((prev) => [
      ...prev,
      { role: "user", text: input },
      { role: "bot", text: data.answer, sources: data.sources },
    ]);
    setInput("");
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "2rem" }}>
      <h2>Reproductive Health Chatbot</h2>
      <div>
        {messages.map((msg, i) => (
          <div key={i} style={{ textAlign: msg.role === "user" ? "right" : "left" }}>
            <p>{msg.text}</p>
            {msg.sources && (
              <ul>
                {msg.sources.map((s, j) => (
                  <li key={j}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer">
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask a question"
      />
      <button onClick={send}>Send</button>
    </div>
  );
}

export default App;
