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
        isOngoing?: boolean,
        sort?: "asc" | "desc",
        rsvpStatus?: string,
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
            .leftJoin("rsvps as current_user_rsvp", function () {
                this.on("events.id", "=", "current_user_rsvp.event_id")
                    .andOn("current_user_rsvp.user_id", "=", db.raw("?", [userId || 0]));
            })
            .leftJoin("rsvps as all_rsvps", "events.id", "all_rsvps.event_id")
            .select(
                "events.id",
                "events.title",
                "events.description",
                "events.location",
                "events.public",
                "events.DateTime",
                "events.created_at",
                "events.updated_at",
                "events.user_id",
                "users.username as author",
                db.raw("GROUP_CONCAT(DISTINCT tags.id) as tagIds"),
                "current_user_rsvp.status as currentUserRsvp",
                db.raw(`SUM(CASE WHEN all_rsvps.status = 'yes' THEN 1 ELSE 0 END) as rsvpYesCount`),
                db.raw(`SUM(CASE WHEN all_rsvps.status = 'no' THEN 1 ELSE 0 END) as rsvpNoCount`),
                db.raw(`SUM(CASE WHEN all_rsvps.status = 'maybe' THEN 1 ELSE 0 END) as rsvpMaybeCount`)
            )
            .groupBy("events.id", "current_user_rsvp.status");

        let countQuery = db("events")
            .leftJoin("users", "events.user_id", "users.id")
            .leftJoin(
                "event_tags_mapping",
                "events.id",
                "event_tags_mapping.event_id",
            )
            .leftJoin("tags", "event_tags_mapping.tag_id", "tags.id")
            .leftJoin("rsvps as current_user_rsvp", function () {
                this.on("events.id", "=", "current_user_rsvp.event_id")
                    .andOn("current_user_rsvp.user_id", "=", db.raw("?", [userId || 0]));
            });

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
        if (isPublic === true) {
            query = query.where("events.public", true);
            countQuery = countQuery.where("events.public", true);
        } else if (isPublic === false) {
            query = query.where("events.public", false).where("events.user_id", userId);
            countQuery = countQuery.where("events.public", false).where("events.user_id", userId);
        } else {
            query = query.where(function () {
                this.where("events.public", true).orWhere("events.user_id", userId);
            });
            countQuery = countQuery.where(function () {
                this.where("events.public", true).orWhere("events.user_id", userId);
            });
        }
        if (isOngoing === true) {
            query = query.where("events.DateTime", ">", new Date().toISOString());
            countQuery = countQuery.where("events.DateTime", ">", new Date().toISOString());
        } else if (isOngoing === false) {
            query = query.where("events.DateTime", "<", new Date().toISOString());
            countQuery = countQuery.where("events.DateTime", "<", new Date().toISOString());
        }

        if (rsvpStatus) {
            query = query.where("current_user_rsvp.status", rsvpStatus);
            countQuery = countQuery.where("current_user_rsvp.status", rsvpStatus);
        }
        query = query
            .orderBy("events.created_at", sort)
            .limit(safeLimit)
            .offset(offset);
        const [events, total] = await Promise.all([
            query,
            countQuery.countDistinct("events.id as count").first(),
        ]);
        const totalCount = Number((total as any)?.count || 0);
        const totalPages = Math.ceil(totalCount / safeLimit);
        return {
            success: true,
            data: {
                events: events.map((e: any) => ({
                    ...e,
                    public: Boolean(e.public),
                    tagIds: e.tagIds ? e.tagIds.split(",").map(Number) : [],
                    currentUserRsvp: e.currentUserRsvp || null,
                    rsvpCounts: {
                        yes: Number(e.rsvpYesCount) || 0,
                        no: Number(e.rsvpNoCount) || 0,
                        maybe: Number(e.rsvpMaybeCount) || 0,
                    }
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
            location,
            public: isPublic,
            DateTime,
            tagIds,
        } = requestBody;
        const [id] = await db("events").insert({
            user_id: userId,
            title,
            description,
            location,
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
                "events.location",
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
                "events.location",
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

    public async updateTag(id: number, name: string): Promise<IResponse> {
        const tag = await db("tags").where({ id }).first();
        if (!tag) {
            return { success: false, message: "Tag not found" };
        }
        const existing = await db("tags").where({ name }).whereNot({ id }).first();
        if (existing) {
            return { success: false, message: "Tag already exists" };
        }
        await db("tags").where({ id }).update({ name });
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

    public async rsvpToEvent(userId: number, eventId: number, status: string): Promise<IResponse> {
        const event = await db("events").where({ id: eventId }).first();
        if (!event) {
            return { success: false, message: "Event not found" };
        }

        if (!event.public && event.user_id !== userId) {
            return { success: false, message: "Forbidden" };
        }

        const existingRsvp = await db("rsvps").where({ user_id: userId, event_id: eventId }).first();
        if (existingRsvp) {
            await db("rsvps").where({ id: existingRsvp.id }).update({ status, updated_at: db.fn.now() });
        } else {
            await db("rsvps").insert({ user_id: userId, event_id: eventId, status });
        }

        return { success: true, message: "RSVP updated successfully" };
    }
}
