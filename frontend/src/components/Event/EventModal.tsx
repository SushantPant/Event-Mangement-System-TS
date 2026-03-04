import { useEffect, useState } from "react";
import type {
  EventCreateRequest,
  Tag,
} from "../../interfaces/events.interface";
import SubmitButton from "../ui/SubmitButton";
import CancelButton from "../ui/CancelButton";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EventCreateRequest) => Promise<void>;
  tags: Tag[];
  initialData?: Partial<EventCreateRequest> & { id?: number };
  mode: "create" | "update" | "view";
}

const EventModal = ({
  isOpen,
  onClose,
  onSubmit,
  tags,
  initialData,
  mode,
}: EventModalProps) => {
  const [form, setForm] = useState<EventCreateRequest>({
    title: "",
    description: "",
    location: "",
    public: false,
    DateTime: "",
    tagIds: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      let localDateTime = "";
      if (initialData.DateTime) {
        const d = new Date(initialData.DateTime);
        localDateTime = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
      }
      setForm({
        title: initialData.title ?? "",
        description: initialData.description ?? "",
        location: (initialData.location as string | null | undefined) ?? "",
        public: initialData.public ?? false,
        DateTime: localDateTime,
        tagIds: initialData.tagIds ?? [],
      });
    } else {
      setForm({
        title: "",
        description: "",
        location: "",
        public: false,
        DateTime: "",
        tagIds: [],
      });
    }
  }, [initialData, isOpen]);

  const toggleTag = (id: number) => {
    setForm((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(id)
        ? prev.tagIds.filter((t) => t !== id)
        : [...prev.tagIds, id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(form);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl overflow-hidden bg-white border border-stone-200 shadow-xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100">
          <div>
            <h2 className="text-xl font-black text-stone-900">
              {mode === "create" ? "Create an Event" : "Update Event"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
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

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
              Title
            </label>
            <input
              required
              value={form.title}
              onChange={(e) =>
                setForm((p) => ({ ...p, title: e.target.value }))
              }
              placeholder="Event title"
              className="w-full px-4 py-2.5 rounded-lg text-sm text-stone-800 placeholder-stone-400 bg-stone-100 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-yellow-500/40 focus:border-yellow-600 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="Describe your event..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg text-sm text-stone-800 placeholder-stone-400 bg-stone-100 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-yellow-500/40 focus:border-yellow-600 transition resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
              Location
            </label>
            <input
              value={form.location ?? ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, location: e.target.value }))
              }
              placeholder="Event location (optional)"
              className="w-full px-4 py-2.5 rounded-lg text-sm text-stone-800 placeholder-stone-400 bg-stone-100 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-yellow-500/40 focus:border-yellow-600 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
              Date & Time
            </label>
            <input
              required
              type="datetime-local"
              value={form.DateTime}
              onChange={(e) =>
                setForm((p) => ({ ...p, DateTime: e.target.value }))
              }
              className="w-full px-4 py-2.5 rounded-lg text-sm text-stone-800 bg-stone-100 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-yellow-500/40 focus:border-yellow-600 transition"
            />
          </div>

          {tags.length > 0 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => {
                  const selected = form.tagIds.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition border ${
                        selected
                          ? "bg-yellow-600 text-white border-yellow-600"
                          : "bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200"
                      }`}
                    >
                      {tag.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, public: !p.public }))}
              className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
                form.public ? "bg-yellow-600" : "bg-stone-300"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                  form.public ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <span className="text-sm text-stone-700 font-medium">
              Make this event public
            </span>
          </div>

          <div className="flex gap-3 pt-2 border-t border-stone-100">
            <CancelButton onClick={onClose} className="flex-1" />
            <SubmitButton isLoading={isSubmitting} className="flex-1">
              {mode === "create" ? "Create Event" : "Save Changes"}
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;
