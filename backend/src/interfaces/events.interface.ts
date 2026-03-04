interface Event {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  location?: string | null;
  public: boolean;
  DateTime: Date;
  created_at: Date;
  updated_at: Date;
  author: string;
  tagIds: number[];
  currentUserRsvp?: "yes" | "no" | "maybe" | null;
  rsvpCounts?: {
    yes: number;
    no: number;
    maybe: number;
  };
}
interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface PaginatedEvents {
  Events: Event[];
  pagination: Pagination;
}


interface EventCreateRequest {
  title: string;
  description?: string;
  location?: string;
  public: boolean;
  DateTime: Date;
  tagIds?: number[];
}

interface EventUpdateRequest {
  title?: string;
  description?: string;
  location?: string;
  public?: boolean;
  DateTime?: Date;
  tagIds?: number[];
}

interface RSVPRequest {
  status: "yes" | "no" | "maybe";
}

export {
  Event,
  Pagination,
  PaginatedEvents,
  EventCreateRequest,
  EventUpdateRequest,
  RSVPRequest,
};
