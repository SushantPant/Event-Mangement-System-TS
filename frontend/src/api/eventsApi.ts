
import type {
  Event,
  EventCreateRequest,
  EventUpdateRequest,
  Pagination,
  Tag,
} from "../interfaces/events.interface";
import type { IResponse } from "../interfaces/response.interface";
import api from "./api";

const getAllEvents = async (
  userId: number,
  page: number,
  limit: number,
  search: string,
  tags: string,
  isPublic: "all" | "public" | "private",
  isOngoing: "all" | "Ongoing" | "Past",
  sort: "asc" | "desc",
): Promise<IResponse<{ events: Event[]; pagination: Pagination }>> => {
  try {
    const params = new URLSearchParams();
    params.set("userId", String(userId));
    params.set("page", String(page));
    params.set("limit", String(limit));
    params.set("sort", sort);
    if (search) params.set("search", search);
    if (tags) params.set("tags", tags);
    if (isPublic === "public") params.set("isPublic", "true");
    if (isPublic === "private") params.set("isPublic", "false");
    if (isOngoing === "Ongoing") params.set("isOngoing", "true");
    if (isOngoing === "Past") params.set("isOngoing", "false");
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
): Promise<IResponse<Event>> => {
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
): Promise<IResponse<Event>> => {
  try {
    const res = await api.patch(`events/${id}`, body);
    return res.data;
  } catch (error: any) {
    return (
      error.response?.data ?? {
        success: false,
        message: "Failed to update event",
      }
    );
  }
};

const deleteEvent = async (id: number): Promise<IResponse<null>> => {
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

const getAllTags = async (): Promise<IResponse<Tag[]>> => {
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

const createTag = async (name: string): Promise<IResponse<Tag>> => {
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

const updateTag = async (id: number, name: string): Promise<IResponse<Tag>> => {
  try {
    const res = await api.put(`events/tags/${id}`, { name });
    return res.data;
  } catch (error: any) {
    return (
      error.response?.data ?? {
        success: false,
        message: "Failed to update tag",
      }
    );
  }
};

const deleteTag = async (id: number): Promise<IResponse<null>> => {
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
  updateTag,
  deleteTag,
};
