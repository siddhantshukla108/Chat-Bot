// src/App.jsx
import React, { useState, useEffect, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState("dark");
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        systemInstruction: `TRAINED_YOUR_BOT`,     // Replace with your system instruction
      });

      const result = await model.generateContent(input);
      const botReply = result.response.text();

      let displayedText = "";
      const words = botReply.split(" ");
      let index = 0;

      const typingInterval = setInterval(() => {
        displayedText += (index > 0 ? " " : "") + words[index];
        index++;
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: "bot", content: displayedText },
        ]);

        if (index === words.length) {
          clearInterval(typingInterval);
        }
      }, 40);

      setMessages((prev) => [...prev, { role: "bot", content: "" }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "⚠️ Error: Could not fetch response." },
      ]);
    }

    setLoading(false);
  };

  return (
    <div
      className={`flex flex-col h-screen transition-colors duration-300 ${
        theme === "dark"
          ? "bg-[#0a0a0a] text-white"
          : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* Header */}
      <header className="p-4 flex justify-between items-center bg-black/70 backdrop-blur-md border-b border-gray-800 shadow-md">
        <span className="text-lg font-semibold">💬 Personal Chat Bot</span>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="px-3 py-1 rounded-lg border border-gray-600 text-sm hover:bg-gray-700/40 transition"
        >
          {theme === "dark" ? "☀ Light" : "🌙 Dark"}
        </button>
      </header>

      {/* Chat */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex flex-col justify-center items-center text-center opacity-70 select-none">
            <h2 className="text-2xl font-bold mb-2">👋 Welcome!</h2>
            <p className="max-w-md">
              I’m your <strong>Chat</strong> Bot.
              Ask me anything which comes under my domain — but if it’s unrelated… expect a rude answer. 😈
            </p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`max-w-xl px-4 py-3 rounded-2xl shadow-lg transition-all duration-300 animate-fadeIn ${
              msg.role === "user"
                ? "bg-blue-600 text-white ml-auto rounded-br-none"
                : "bg-gray-800/80 backdrop-blur-sm text-white mr-auto rounded-bl-none"
            }`}
          >
            {msg.content}
          </div>
        ))}

        {loading && (
          <div className="text-gray-400 italic animate-pulse">I,m thinking dood...</div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-black/70 backdrop-blur-md border-t border-gray-800 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask something about DSA..."
          className="flex-1 p-3 rounded-xl bg-gray-900/70 backdrop-blur-sm border border-gray-700 outline-none focus:border-blue-400 transition text-white placeholder-gray-400"
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-blue-600 px-5 py-2 rounded-xl hover:bg-blue-500 disabled:bg-gray-600 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}
