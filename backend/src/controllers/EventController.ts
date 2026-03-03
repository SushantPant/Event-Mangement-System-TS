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
  Patch,
} from "tsoa";
import {
  EventCreateRequest,
  EventUpdateRequest,
} from "../interfaces/events.interface";
import { IResponse } from "../interfaces/response.interface";
import { EventService } from "../services/EventService";
import * as jwt from "jsonwebtoken";
@Route("events")
@Tags("Events")
export class EventController extends Controller {
  private eventService = new EventService();
  @Security("bearerAuth")
  @Get("")
  public async getEvents(
    @Request() req: express.Request,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10,
    @Query("search") search?: string,
    @Query("tags") tags?: string,
    @Query("isPublic") isPublic?: boolean,
    @Query("isOngoing") isOngoing?: boolean,
    @Query("sort") sort?: "asc" | "desc",
  ) {


    const userId = (req as any).user.id;
    return this.eventService.getEvents(userId, page, limit, search, tags, isPublic, isOngoing, sort);
  }

  @Security("bearerAuth")
  @Post("")
  public async createEvent(
    @Request() req: express.Request,
    @Body() requestBody: EventCreateRequest,
  ) {
    const userId = (req as any).user.id;
    const response = await this.eventService.createEvent(userId, requestBody);

    if (response.success) {
      this.setStatus(201);
    }
    return response;
  }

  @Security("bearerAuth")
  @Patch("{id}")
  public async updateEvent(
    @Request() req: express.Request,
    @Path() id: number,
    @Body() requestBody: EventUpdateRequest,
  ) {
    const userId = (req as any).user.id;
    const response = await this.eventService.updateEvent(userId, id, requestBody);

    if (!response.success) {
      if (response.message === "Event not found") {
        this.setStatus(404);
      } else if (response.message === "Forbidden") {
        this.setStatus(403);
      }
    }
    return response;
  }

  @Security("bearerAuth")
  @Delete("{id}")
  public async deleteEvent(
    @Request() req: express.Request,
    @Path() id: number,
  ): Promise<IResponse | void> {
    const userId = (req as any).user.id;
    const response = await this.eventService.deleteEvent(userId, id);

    if (!response.success) {
      if (response.message === "Event not found") {
        this.setStatus(404);
      } else if (response.message === "Forbidden") {
        this.setStatus(403);
      }
    }
    return response;
  }

  @Get("tags")
  public async getTags() {
    return this.eventService.getTags();
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
    const response = await this.eventService.createTag(body.name);
    if (!response.success && response.message === "Tag already exists") {
      this.setStatus(409);
    }
    return response;
  }

  @Security("bearerAuth", ["admin"])
  @Put("tags/{id}")
  public async updateTag(
    @Request() req: express.Request,
    @Path() id: number,
    @Body() body: { name: string },
  ) {
    if ((req as any).user.role !== "admin") {
      this.setStatus(403);
      return {
        success: false,
        message: "Forbidden: Only admins can update tags",
      };
    }
    const response = await this.eventService.updateTag(id, body.name);
    if (!response.success) {
      if (response.message === "Tag not found") {
        this.setStatus(404);
      } else if (response.message === "Tag already exists") {
        this.setStatus(409);
      }
    }
    return response;
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
    const response = await this.eventService.deleteTag(id);
    if (!response.success && response.message === "Tag not found") {
      this.setStatus(404);
    }
    return response;
  }
}
