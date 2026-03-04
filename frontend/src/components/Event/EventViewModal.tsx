import { useEffect, useState } from "react";
import type { Event, Tag } from "../../interfaces/events.interface";
import toast from "react-hot-toast";
import { rsvpToEvent } from "../../api/eventsApi";

interface EventViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
  tags: Tag[];
  onRsvpUpdate?: () => void;
}

const EventViewModal = ({
  isOpen,
  onClose,
  event,
  tags,
  onRsvpUpdate,
}: EventViewModalProps) => {
  const [visible, setVisible] = useState(false);
  const [currentRsvp, setCurrentRsvp] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setVisible(true), 10);
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  useEffect(() => {
    setCurrentRsvp(event?.currentUserRsvp || null);
  }, [event]);

  if (!isOpen || !event) return null;

  const eventTags = tags.filter((t) => event.tagIds.includes(t.id));
  const eventDate = new Date(event.DateTime);
  const isPast = eventDate < new Date();

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`relative w-full max-w-lg rounded-2xl overflow-hidden bg-white border border-stone-200 shadow-xl transition-all duration-200 ${visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-3 scale-95"}`}
      >
        <div className="bg-stone-100 px-6 pt-5 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border mb-2 ${isPast ? "bg-white/60 text-stone-600 border-stone-200" : event.public ? "bg-white text-yellow-700 border-yellow-200" : "bg-white/60 text-stone-600 border-stone-200"}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${isPast ? "bg-stone-400" : event.public ? "bg-yellow-500" : "bg-stone-400"}`}
                />
                {isPast ? "Past" : event.public ? "Public" : "Private"}
              </span>
              <h2 className="text-xl font-black text-stone-900 leading-snug">
                {event.title}
              </h2>
              <p className="text-sm text-stone-700 mt-0.5">
                by <span className="font-semibold">{event.author}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-yellow-500 transition flex-shrink-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4 text-yellow-600 flex-shrink-0"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 9v7.5"
              />
            </svg>
            <span className="font-semibold text-stone-800">
              {eventDate.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="text-stone-400">·</span>
            <span className="text-stone-500">
              {eventDate.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          {event.location && (
            <div className="flex items-center gap-2 text-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4 text-yellow-600 flex-shrink-0"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                />
              </svg>
              <span className="text-stone-700 font-medium">
                {event.location}
              </span>
            </div>
          )}

          {event.description && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                Description
              </p>
              <p className="text-sm text-stone-600 leading-relaxed">
                {event.description}
              </p>
            </div>
          )}

          {eventTags.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                Tags
              </p>
              <div className="flex flex-wrap gap-1.5">
                {eventTags.map((tag) => (
                  <span
                    key={tag.id}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700 border border-yellow-200"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-stone-100">
            <p className="text-sm font-bold text-stone-900 mb-3">Your RSVP</p>
            <div className="flex gap-2">
              {(
                [
                  {
                    value: "yes",
                    label: "Yes",
                    colorClass:
                      "bg-green-100 text-green-800 border-green-300 hover:bg-green-200",
                  },
                  {
                    value: "no",
                    label: "No",
                    colorClass:
                      "bg-red-100 text-red-800 border-red-300 hover:bg-red-200",
                  },
                  {
                    value: "maybe",
                    label: "Maybe",
                    colorClass:
                      "bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-200",
                  },
                ] as const
              ).map((option) => (
                <button
                  key={option.value}
                  onClick={async () => {
                    setCurrentRsvp(option.value);
                    const res = await rsvpToEvent(
                      event.id,
                      option.value as any,
                    );
                    if (res.success) {
                      toast.success("RSVP updated");
                      onRsvpUpdate?.();
                    } else {
                      toast.error(res.message || "Failed to submit RSVP");
                      setCurrentRsvp(event.currentUserRsvp || null);
                    }
                  }}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition ${
                    currentRsvp === option.value
                      ? option.colorClass
                      : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-stone-100 flex items-center justify-between">
          <p className="text-xs text-stone-400">
            Posted{" "}
            {new Date(event.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
            {event.updated_at !== event.created_at && (
              <>
                {" "}
                · Updated{" "}
                {new Date(event.updated_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </>
            )}
          </p>
          <button
            onClick={onClose}
            className="text-xs font-semibold text-stone-500 hover:text-stone-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventViewModal;
