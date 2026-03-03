import { useEffect, useState } from "react";
import EventModal, {
  type EventFormData,
  type Tag,
} from "../components/EventModal";
import {
  getAllEvents,
  getAllTags,
  createEvent,
  updateEvent,
  deleteEvent,
  type Event,
  type Pagination,
} from "../api/eventsApi";
import { formatDate, formatTime } from "../lib/FormatDateTime";

const EventsDashboard = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [filterPublic, setFilterPublic] = useState<
    "all" | "public" | "private"
  >("all");
  const [sort, setSort] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "update">("create");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    const res = await getAllEvents(
      page,
      10,
      search,
      filterTag,
      filterPublic,
      sort,
    );
    if (res.success) {
      setEvents(res.data.events);
      setPagination(res.data.pagination);
    }
    setLoading(false);
  };

  const fetchTags = async () => {
    const res = await getAllTags();
    if (res.success) setTags(res.data);
  };

  useEffect(() => {
    fetchTags();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [search, sort, page, filterTag, filterPublic]);

  const openCreate = () => {
    setSelectedEvent(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const openEdit = (event: Event) => {
    setSelectedEvent(event);
    setModalMode("update");
    setModalOpen(true);
  };

  const handleSubmit = async (data: EventFormData) => {
    if (modalMode === "create") {
      await createEvent(data);
    } else if (selectedEvent) {
      await updateEvent(selectedEvent.id, data);
    }
    fetchEvents();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this event?")) return;
    await deleteEvent(id);
    fetchEvents();
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="md:px-4 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-yellow-700 mb-1">
              Your Schedule
            </p>
            <h1 className="text-4xl font-black text-stone-900 tracking-tight">
              Events
            </h1>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-yellow-600 hover:bg-yellow-700 shadow-md hover:shadow-lg transition hover:scale-105 active:scale-95"
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
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            New Event
          </button>
        </div>

        <div className="flex flex-wrap gap-3 mb-8 p-4 rounded-2xl bg-white border border-stone-200 shadow-sm">
          <div className="relative flex-1 min-w-48">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search events..."
              className="w-full pl-9 pr-4 py-2 rounded-lg text-sm text-stone-800 placeholder-stone-400 bg-stone-100 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-yellow-500/40 focus:border-yellow-600 transition"
            />
          </div>

          <select
            value={filterTag}
            onChange={(e) => {
              setFilterTag(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-lg text-sm text-stone-700 bg-stone-100 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-yellow-500/40 focus:border-yellow-600 transition"
          >
            <option value="">All Tags</option>
            {tags.map((t) => (
              <option key={t.id} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>

          <div className="flex rounded-lg overflow-hidden border border-stone-200">
            {(["all", "public", "private"] as const).map((v) => (
              <button
                key={v}
                onClick={() => {
                  setFilterPublic(v);
                  setPage(1);
                }}
                className={`px-3 py-2 text-xs font-semibold capitalize transition border-r border-stone-200 last:border-r-0 ${
                  filterPublic === v
                    ? "bg-yellow-600 text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          <button
            onClick={() => setSort((s) => (s === "desc" ? "asc" : "desc"))}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-stone-600 bg-stone-100 border border-stone-200 hover:bg-stone-200 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-3.5 h-3.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d={
                  sort === "desc"
                    ? "M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12"
                    : "M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21l3.75-3.75"
                }
              />
            </svg>
            {sort === "desc" ? "Newest" : "Oldest"}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-stone-200 border-t-yellow-600 rounded-full animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-yellow-100 border border-yellow-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="#a16207"
                className="w-7 h-7"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                />
              </svg>
            </div>
            <p className="text-stone-900 font-bold text-lg mb-1">
              No events yet
            </p>
            <p className="text-stone-500 text-sm mb-5">
              Create your first event to get started
            </p>
            <button
              onClick={openCreate}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-yellow-600 hover:bg-yellow-700 transition shadow"
            >
              Create Event
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {events.map((event) => {
              const eventTags = event.tags ? event.tags.split(",") : [];
              return (
                <div
                  key={event.id}
                  className="group rounded-2xl p-5 flex flex-col gap-3 bg-white border border-stone-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${event.public ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"}`}
                      >
                        {event.public ? "Public" : "Private"}
                      </span>
                      {eventTags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 rounded-full text-stone-600 bg-stone-100 border border-stone-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => openEdit(event)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-400 hover:text-yellow-600 hover:bg-yellow-50 transition"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-3.5 h-3.5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-400 hover:text-red-500 hover:bg-red-50 transition"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-3.5 h-3.5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-stone-900 font-bold text-base leading-snug mb-1">
                      {event.title}
                    </h3>
                    {event.description && (
                      <p className="text-stone-500 text-sm leading-relaxed line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-auto border-t border-stone-100">
                    <div className="flex items-center gap-1.5 text-stone-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-3.5 h-3.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                        />
                      </svg>
                      <span className="text-xs font-medium">
                        {formatDate(event.DateTime)}
                      </span>
                      <span className="text-xs text-stone-300">·</span>
                      <span className="text-xs">
                        {formatTime(event.DateTime)}
                      </span>
                    </div>
                    <span className="text-xs text-stone-400 font-medium">
                      @{event.author}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              disabled={!pagination.hasPrev}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-stone-600 bg-white border border-stone-200 hover:bg-stone-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-stone-500 font-medium px-2">
              {pagination.page} / {pagination.totalPages}
            </span>
            <button
              disabled={!pagination.hasNext}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-stone-600 bg-white border border-stone-200 hover:bg-stone-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <EventModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        tags={tags}
        mode={modalMode}
        initialData={
          selectedEvent
            ? {
                id: selectedEvent.id,
                title: selectedEvent.title,
                description: selectedEvent.description,
                public: selectedEvent.public,
                DateTime: selectedEvent.DateTime,
                tagIds: [],
              }
            : undefined
        }
      />
    </div>
  );
};

export default EventsDashboard;
