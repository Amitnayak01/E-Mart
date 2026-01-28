import { Check, CheckCheck } from "lucide-react";

export default function ChatBubble({ msg, mine }) {
  const time = new Date(msg.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2 shadow transition-all ${
          mine
            ? "bg-indigo-600 text-white rounded-br-none"
            : "bg-white border rounded-bl-none"
        }`}
      >
        <div className="text-sm whitespace-pre-wrap">{msg.text}</div>

        <div
          className={`mt-1 flex items-center gap-1 text-[11px] ${
            mine ? "text-white/70 justify-end" : "text-slate-500"
          }`}
        >
          <span>{time}</span>

          {mine && (
            <>
              {msg.read ? (
                <CheckCheck className="w-4 h-4 text-blue-300" />
              ) : msg.delivered ? (
                <CheckCheck className="w-4 h-4" />
              ) : (
                <Check className="w-4 h-4" />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
