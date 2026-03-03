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
  tags: string[];
}
interface EventCreateRequest {
  title: string;
  description: string;
  public: boolean;
  DateTime: Date;
  tagIds: number[];
}

interface EventUpdateRequest {
  title?: string;
  description?: string;
  public?: boolean;
  DateTime?: string;
  tagIds?: number[];
}
interface EventResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
interface Tag {
  id: number;
  name: string;
}

export type {
  Event,
  EventResponse,
  Tag,
  EventCreateRequest,
  EventUpdateRequest,
  Pagination,
};
