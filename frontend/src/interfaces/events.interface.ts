interface Event {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  public: boolean;
  DateTime: string;
  created_at: Date;
  updated_at: Date;
  author: string;
  tagIds: number[];
}
interface EventCreateRequest {
  title: string;
  description: string;
  public: boolean;
  DateTime: string;
  tagIds: number[];
}

interface EventUpdateRequest {
  title?: string;
  description?: string;
  public?: boolean;
  DateTime?: string;
  tagIds?: number[];
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
  Tag,
  EventCreateRequest,
  EventUpdateRequest,
  Pagination,
};
