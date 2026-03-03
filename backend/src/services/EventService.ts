import db from "../db/db";
import {
    EventCreateRequest,
    EventUpdateRequest,
} from "../interfaces/events.interface";
import { IResponse } from "../interfaces/response.interface";

export class EventService {
    public async getEvents(
        userId: number | null,
        page: number = 1,
        limit: number = 10,
        search?: string,
        tags?: string,
        isPublic?: boolean,
        sort?: "asc" | "desc",
    ) {
        const safePage = Math.max(1, page);
        const safeLimit = Math.min(50, Math.max(1, limit));
        const offset = (safePage - 1) * safeLimit;

        let query = db("events")
            .leftJoin("users", "events.user_id", "users.id")
            .leftJoin(
                "event_tags_mapping",
                "events.id",
                "event_tags_mapping.event_id",
            )
            .leftJoin("tags", "event_tags_mapping.tag_id", "tags.id")
            .select(
                "events.id",
                "events.title",
                "events.description",
                "events.public",
                "events.DateTime",
                "events.created_at",
                "events.updated_at",
                "users.username as author",
                db.raw("GROUP_CONCAT(tags.id) as tagIds"),
            )
            .groupBy("events.id");

        let countQuery = db("events")
            .join("users", "events.user_id", "users.id")
            .leftJoin(
                "event_tags_mapping",
                "events.id",
                "event_tags_mapping.event_id",
            )
            .leftJoin("tags", "event_tags_mapping.tag_id", "tags.id");

        if (search) {
            query = query.where("events.title", "like", `%${search}%`);
            countQuery = countQuery.where("events.title", "like", `%${search}%`);
        }
        if (tags) {
            const tagsArray = tags.split(",").map((tag) => tag.trim());
            query = query.whereExists(function () {
                this.select("*")
                    .from("event_tags_mapping as etm")
                    .join("tags as t", "etm.tag_id", "t.id")
                    .whereRaw("etm.event_id = events.id")
                    .whereIn("t.name", tagsArray);
            });
            countQuery = countQuery.whereExists(function () {
                this.select("*")
                    .from("event_tags_mapping as etm")
                    .join("tags as t", "etm.tag_id", "t.id")
                    .whereRaw("etm.event_id = events.id")
                    .whereIn("t.name", tagsArray);
            });
        }
        if (isPublic !== undefined) {
            if (isPublic === true) {
                query = query.where(function () {
                    this.where("events.public", true).orWhere("events.user_id", userId);
                });

                countQuery = countQuery.where(function () {
                    this.where("events.public", true).orWhere("events.user_id", userId);
                });
            } else {
                query = query.where("events.user_id", userId);
                countQuery = countQuery.where("events.user_id", userId);
            }
        }
        query = query
            .orderBy("events.DateTime", sort)
            .limit(safeLimit)
            .offset(offset);
        const [events, total] = await Promise.all([
            query,
            countQuery.countDistinct("events.id as count").first(),
        ]);
        const totalCount = Number((total as any)?.count || 0);
        const totalPages = Math.ceil(totalCount / safeLimit);
        console.log(events)
        return {
            success: true,
            data: {
                events: events.map((e: any) => ({
                    ...e,
                    public: Boolean(e.public),
                    tagIds: e.tagIds ? e.tagIds.split(",").map(Number) : [],
                })),
                pagination: {
                    page: safePage,
                    limit: safeLimit,
                    totalCount,
                    totalPages,
                    hasNext: safePage < totalPages,
                    hasPrev: safePage > 1,
                },
            },
        };
    }

    public async createEvent(
        userId: number,
        requestBody: EventCreateRequest,
    ): Promise<IResponse> {
        const {
            title,
            description,
            public: isPublic,
            DateTime,
            tagIds,
        } = requestBody;
        const [id] = await db("events").insert({
            user_id: userId,
            title,
            description,
            public: isPublic,
            DateTime,
        });

        if (tagIds && tagIds.length > 0) {
            await db("event_tags_mapping").insert(
                tagIds.map((tagId) => ({ event_id: id, tag_id: tagId })),
            );
        }
        const event = await db("events")
            .where({ "events.id": id })
            .leftJoin("users", "events.user_id", "users.id")
            .select(
                "events.id",
                "events.title",
                "events.description",
                "events.public",
                "events.DateTime",
                "events.created_at",
                "events.updated_at",
                "users.username as author",
            )
            .first();

        return {
            success: true,
            data: event,
        };
    }

    public async updateEvent(
        userId: number,
        id: number,
        requestBody: EventUpdateRequest,
    ): Promise<IResponse> {
        const { tagIds, ...eventData } = requestBody;
        const event = await db("events").where({ id }).first();
        if (!event) {
            return {
                success: false,
                message: "Event not found",
            };
        }
        if (event.user_id !== userId) {
            return {
                success: false,
                message: "Forbidden",
            };
        }
        await db("events")
            .where({ id })
            .update({ ...eventData, updated_at: db.fn.now() });
        if (tagIds !== undefined) {
            await db("event_tags_mapping").where({ event_id: id }).delete();
            if (tagIds.length > 0) {
                await db("event_tags_mapping").insert(
                    tagIds.map((tagId) => ({ event_id: id, tag_id: tagId })),
                );
            }
        }
        const updatedEvent = await db("events")
            .where({ "events.id": id })
            .leftJoin("users", "events.user_id", "users.id")
            .select(
                "events.id",
                "events.title",
                "events.description",
                "events.public",
                "events.DateTime",
                "events.created_at",
                "events.updated_at",
                "users.username as author",
            )
            .first();
        return {
            success: true,
            message: "Event Updated successfully",
            data: updatedEvent,
        };
    }

    public async deleteEvent(userId: number, id: number): Promise<IResponse> {
        const event = await db("events").where({ id }).first();
        if (!event) {
            return {
                success: false,
                message: "Event not found",
            };
        }
        if (event.user_id !== userId) {
            return {
                success: false,
                message: "Forbidden",
            };
        }
        await db("events").where({ id }).delete();
        return {
            success: true,
            message: "Event deleted successfully",
        };
    }

    public async getTags(): Promise<IResponse> {
        const tags = await db("tags").select("id", "name");
        return { success: true, data: tags };
    }

    public async createTag(name: string): Promise<IResponse> {
        const existing = await db("tags").where({ name }).first();
        if (existing) {
            return { success: false, message: "Tag already exists" };
        }
        const [id] = await db("tags").insert({ name });
        return { success: true, data: { id, name } };
    }

    public async deleteTag(id: number): Promise<IResponse> {
        const tag = await db("tags").where({ id }).first();
        if (!tag) {
            return { success: false, message: "Tag not found" };
        }
        await db("tags").where({ id }).delete();
        return { success: true, message: "Tag deleted successfully" };
    }
}
