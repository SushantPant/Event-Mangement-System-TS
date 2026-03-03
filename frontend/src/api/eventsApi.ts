import type {
  EventCreateRequest,
  EventResponse,
  EventUpdateRequest,
  Pagination,
  Tag,
} from "../interfaces/events.interface";
import api from "./api";

const getAllEvents = async (
  page: number,
  limit: number,
  search: string,
  tags: string,
  isPublic: "all" | "public" | "private",
  sort: "asc" | "desc",
): Promise<EventResponse<{ events: Event[]; pagination: Pagination }>> => {
  try {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    params.set("sort", sort);
    if (search) params.set("search", search);
    if (tags) params.set("tags", tags);
    if (isPublic === "public") params.set("isPublic", "true");
    if (isPublic === "private") params.set("isPublic", "false");
    const res = await api.get(`events?${params.toString()}`);
    return res.data;
  } catch (error: any) {
    return (
      error.response?.data ?? {
        success: false,
        message: "Failed to fetch events",
      }
    );
  }
};

const createEvent = async (
  body: EventCreateRequest,
): Promise<EventResponse<Event>> => {
  try {
    const res = await api.post("events", body);
    return res.data;
  } catch (error: any) {
    return (
      error.response?.data ?? {
        success: false,
        message: "Failed to create event",
      }
    );
  }
};

const updateEvent = async (
  id: number,
  body: EventUpdateRequest,
): Promise<EventResponse<Event>> => {
  try {
    console.log("Full body being sent:", JSON.stringify(body, null, 2)); // ✅

    const res = await api.patch(`events/${id}`, body);
    return res.data;
  } catch (error: any) {
    console.error(error.response);
    return (
      error.response?.data ?? {
        success: false,
        message: "Failed to update event",
      }
    );
  }
};

const deleteEvent = async (id: number): Promise<EventResponse<null>> => {
  try {
    const res = await api.delete(`events/${id}`);
    return res.data;
  } catch (error: any) {
    return (
      error.response?.data ?? {
        success: false,
        message: "Failed to delete event",
      }
    );
  }
};

const getAllTags = async (): Promise<EventResponse<Tag[]>> => {
  try {
    const res = await api.get("events/tags");
    return res.data;
  } catch (error: any) {
    return (
      error.response?.data ?? {
        success: false,
        message: "Failed to fetch tags",
      }
    );
  }
};

const createTag = async (name: string): Promise<EventResponse<Tag>> => {
  try {
    const res = await api.post("events/tags", { name });
    return res.data;
  } catch (error: any) {
    return (
      error.response?.data ?? {
        success: false,
        message: "Failed to create tag",
      }
    );
  }
};

const deleteTag = async (id: number): Promise<EventResponse<null>> => {
  try {
    const res = await api.delete(`events/tags/${id}`);
    return res.data;
  } catch (error: any) {
    return (
      error.response?.data ?? {
        success: false,
        message: "Failed to delete tag",
      }
    );
  }
};

export {
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getAllTags,
  createTag,
  deleteTag,
};
