interface Event {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  public: boolean;
  DateTime: Date;
  created_at: Date;
  updated_at: Date;
  author: string;
  tagIds: number[];
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
  public: boolean;
  DateTime: Date;
  tagIds?: number[];
}

interface EventUpdateRequest {
  title?: string;
  description?: string;
  public?: boolean;
  DateTime?: Date;
  tagIds?: number[];
}
export {
  Event,
  Pagination,
  PaginatedEvents,
  EventCreateRequest,
  EventUpdateRequest,
};
