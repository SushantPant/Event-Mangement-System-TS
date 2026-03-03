import { useEffect, useState } from "react";

import {
  getAllEvents,
  getAllTags,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../api/eventsApi";
import ConfirmModal from "../components/ui/ConfirmModal";
import type { Event, EventCreateRequest, Pagination, Tag } from "../interfaces/events.interface";
import EventModal from "../components/Event/EventModal";
import EventCard from "../components/Event/EventCard";
import { useDebounce } from "../hooks/useDebounce";

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
  const debouncedSearch = useDebounce(search, 500);
  const [filterTag, setFilterTag] = useState("");
  const [filterPublic, setFilterPublic] = useState<
    "all" | "public" | "private"
  >("all");
  const [sort, setSort] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "update">("create");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<number | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    const res = await getAllEvents(
      page,
      10,
      debouncedSearch,
      filterTag,
      filterPublic,
      sort,
    );
    if (res.success && res.data) {
      setEvents(res.data.events);
      setPagination(res.data.pagination);
    }
    setLoading(false);
  };

  const fetchTags = async () => {
    const res = await getAllTags();
    if (res.success && res.data) setTags(res.data);
  };

  useEffect(() => {
    fetchTags();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [debouncedSearch, sort, page, filterTag, filterPublic]);

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

  const handleSubmit = async (data: EventCreateRequest) => {
    if (modalMode === "create") {
      await createEvent(data);
    } else if (selectedEvent) {
      await updateEvent(selectedEvent.id, data);
    }
    fetchEvents();
  };

  const handleDeleteClick = (id: number) => {
    setEventToDelete(id);
    setConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (eventToDelete === null) return;
    await deleteEvent(eventToDelete);
    setConfirmOpen(false);
    setEventToDelete(null);
    fetchEvents();
  };

  const handleDeleteCancel = () => {
    setConfirmOpen(false);
    setEventToDelete(null);
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
                className={`px-3 py-2 text-xs font-semibold capitalize transition border-r border-stone-200 last:border-r-0 ${filterPublic === v
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
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                tags={tags}
                onEdit={openEdit}
                onDelete={handleDeleteClick}
              />
            ))}
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
              description: selectedEvent.description ?? "",
              public: selectedEvent.public,
              DateTime: selectedEvent.DateTime,
              tagIds: selectedEvent.tagIds,
            }
            : undefined
        }
      />
      <ConfirmModal
        isOpen={confirmOpen}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
};

export default EventsDashboard;
