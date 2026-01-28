import React, { useState } from "react";
import { MoreVertical } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function ConversationList({
  conversations = [],
  activeId,
  onSelect,
  onDelete,
  meId
}) {
  const [menuOpen, setMenuOpen] = useState(null);

  const closeMenu = () => setMenuOpen(null);

  return (
    <div className="card overflow-hidden">
      <div className="p-4 font-extrabold border-b border-gray-100">
        Conversations
      </div>

      <div className="divide-y">
        {conversations.map((c) => {
          const other = (c.participants || []).find(
            (p) => String(p._id) !== String(meId)
          );

          const active = c._id === activeId;
          const isOnline =
            other?.lastSeenAt &&
            Date.now() - new Date(other.lastSeenAt).getTime() < 2 * 60 * 1000;

          return (
            <div
              key={c._id}
              className={`relative group ${
                active ? "bg-blue-50" : "bg-white"
              } hover:bg-gray-50 transition`}
            >
              <button
                onClick={() => onSelect(c)}
                className="w-full text-left px-4 py-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <img
                        src={other?.avatar?.url || "/avatar.png"}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover"
                      />
                      {isOnline && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                      )}
                    </div>

                    <div>
                      <div className="font-bold">
                        {other?.name || other?.username || "User"}
                      </div>
                      <div className="text-xs text-gray-500 line-clamp-1">
                        {c.lastMessage?.text || "No messages yet"}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {c.lastMessage?.createdAt && (
                      <span className="text-[10px] text-gray-400">
                        {formatDistanceToNow(new Date(c.lastMessage.createdAt), {
                          addSuffix: true
                        })}
                      </span>
                    )}

                    {(c.unreadCount || 0) > 0 && (
                      <span className="text-xs font-extrabold bg-red-600 text-white rounded-full px-2 py-0.5">
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>

              {/* 3 DOT MENU */}
              <button
                onClick={() => setMenuOpen(menuOpen === c._id ? null : c._id)}
                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition"
              >
                <MoreVertical size={18} />
              </button>

              {menuOpen === c._id && (
                <div className="absolute right-3 top-10 bg-white border rounded-xl shadow-lg p-2 z-10">
                  <button
                    onClick={() => {
                      onDelete(c._id);
                      closeMenu();
                    }}
                    className="text-sm text-red-600 px-3 py-1 hover:bg-red-50 rounded"
                  >
                    Delete Chat
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
