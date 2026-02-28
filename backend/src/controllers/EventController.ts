import express from "express";
import {
  Controller,
  Get,
  Query,
  Route,
  Tags,
  Request,
  Security,
  Body,
  Post,
  Path,
  Put,
  Delete,
} from "tsoa";
import db from "../db/db";
import {
  EventCreateRequest,
  EventResponse,
  EventUpdateRequest,
} from "../interfaces/events.interface";

@Route("events")
@Tags("Events")
export class EventController extends Controller {
  @Get("")
  public async getEvents(
    @Request() req: express.Request,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10,
    @Query("search") search?: string,
    @Query("tags") tags?: string,
    @Query("isPublic") isPublic?: boolean,
    @Query("sort") sort?: "asc" | "desc",
  ) {
    const userId = await db("refresh_tokens")
      .where({ token: req?.cookies?.refreshToken.split(":")[1] })
      .first("user_id");
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
        db.raw("GROUP_CONCAT(tags.name) as tags"),
      )
      .groupBy("events.id");

    let countQuery = db("events").join("users", "events.user_id", "users.id");

    if (search) {
      query = query.where("events.title", "like", `%${search}%`);
      countQuery = countQuery.where("events.title", "like", `%${search}%`);
    }
    if (isPublic) {
      query = query.where("events.public", true);
      countQuery = countQuery.where("events.public", true);
    }
    if (tags) {
      const tagsArray = tags.split(",").map((tag) => tag.trim());
      query = query.whereIn("tags.name", tagsArray);
      countQuery = countQuery.whereIn("tags.name", tagsArray);
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
    const totalCount = Number((total as any)?.total || 0);
    const totalPages = Math.ceil(totalCount / safeLimit);
    return {
      success: true,
      data: {
        events,
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

  @Security("bearerAuth")
  @Post("")
  public async createEvent(
    @Request() req: express.Request,
    @Body() requestBody: EventCreateRequest,
  ) {
    const {
      title,
      description,
      public: isPublic,
      DateTime,
      tagIds,
    } = requestBody;
    const userId = (req as any).user.id;
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
    this.setStatus(201);
    return {
      success: true,
      data: event,
    };
  }

  @Security("bearerAuth")
  @Put("{id}")
  public async updateEvent(
    @Request() req: express.Request,
    @Path() id: number,
    @Body() requestBody: EventUpdateRequest,
  ) {
    const userId = (req as any).user.id;
    const { tagIds, ...eventData } = requestBody;
    const event = await db("events").where({ id }).first();
    if (!event) {
      this.setStatus(404);
      return {
        success: false,
        message: "Event not found",
      };
    }
    if (event.user_id !== userId) {
      this.setStatus(403);
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
      message: "Todod Updated successfully",
      data: updatedEvent,
    };
  }

  @Security("bearerAuth")
  @Delete("{id}")
  public async deleteEvent(
    @Request() req: express.Request,
    @Path() id: number,
  ): Promise<EventResponse | void> {
    const userId = (req as any).user.id;
    const event = await db("events").where({ id }).first();
    if (!event) {
      this.setStatus(404);
      return {
        success: false,
        message: "Event not found",
      };
    }
    if (event.user_id !== userId) {
      this.setStatus(403);
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

  @Get("tags")
  public async getTags() {
    const tags = await db("tags").select("id", "name");
    return { success: true, data: tags };
  }

  @Security("bearerAuth", ["admin"])
  @Post("tags")
  public async createTag(
    @Request() req: express.Request,
    @Body() body: { name: string },
  ) {
    if ((req as any).user.role !== "admin") {
      this.setStatus(403);
      return {
        success: false,
        message: "Forbidden: Only admins can create tags",
      };
    }
    const existing = await db("tags").where({ name: body.name }).first();
    if (existing) {
      this.setStatus(409);
      return { success: false, message: "Tag already exists" };
    }
    const [id] = await db("tags").insert({ name: body.name });
    return { success: true, data: { id, name: body.name } };
  }

  @Security("bearerAuth")
  @Delete("tags/{id}")
  public async deleteTag(@Request() req: express.Request, @Path() id: number) {
    if ((req as any).user.role !== "admin") {
      this.setStatus(403);
      return {
        success: false,
        message: "Forbidden: Only admins can delete tags",
      };
    }
    const tag = await db("tags").where({ id }).first();
    if (!tag) {
      this.setStatus(404);
      return { success: false, message: "Tag not found" };
    }
    await db("tags").where({ id }).delete();
    return { success: true, message: "Tag deleted successfully" };
  }
}
