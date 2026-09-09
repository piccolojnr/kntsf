import { apiClient } from "@/lib/api/api-client";
import { toUserFacingError } from "@/lib/api/api-errors";
import { unwrapData, unwrapPaginated } from "@/lib/api/api-response";
import { PaginatedResult } from "@/lib/api/pagination";

import {
  Announcement,
  ContentItem,
  ContentListParams,
  Document,
  Event,
  Executive,
  MobileContentHome,
} from "./content-types";

type LaravelListResponse<T> =
  | T[]
  | { data: T[]; links?: Record<string, string | null>; meta?: Record<string, unknown> }
  | { data: T[] };

function toApiParams(params?: ContentListParams) {
  return {
    search: params?.search || undefined,
    category: params?.category || undefined,
    featured: params?.featured ? true : undefined,
    upcoming: params?.upcoming ? true : undefined,
    page: params?.page,
    per_page: params?.per_page,
  };
}

function normalizeList<T extends ContentItem | Executive>(
  response: LaravelListResponse<T>,
): PaginatedResult<T> {
  if (Array.isArray(response)) {
    return {
      items: response,
      pagination: {
        page: 1,
        limit: response.length,
        total: response.length,
        totalPages: 1,
      },
    };
  }

  if ("meta" in response) {
    return unwrapPaginated<T>(
      response as {
        data: T[];
        links?: Record<string, string | null>;
        meta?: Record<string, unknown>;
      },
    );
  }

  return {
    items: response.data,
    pagination: {
      page: 1,
      limit: response.data.length,
      total: response.data.length,
      totalPages: 1,
    },
  };
}

async function getContentList<T extends ContentItem | Executive>(
  path: string,
  params?: ContentListParams,
) {
  try {
    const response = await apiClient.get<LaravelListResponse<T>>(path, {
      params: toApiParams(params),
    });

    return normalizeList<T>(response.data);
  } catch (error) {
    throw toUserFacingError(error);
  }
}

async function getContentDetail<T>(path: string) {
  try {
    const response = await apiClient.get<T | { data: T }>(path);

    return unwrapData<T>(response.data);
  } catch (error) {
    throw toUserFacingError(error);
  }
}

export async function getContentHome() {
  return getContentDetail<MobileContentHome>("/api/mobile/content/home");
}

export async function getAnnouncements(params?: ContentListParams) {
  return getContentList<Announcement>(
    "/api/mobile/content/announcements",
    params,
  );
}

export async function getAnnouncement(slug: string) {
  return getContentDetail<Announcement>(
    `/api/mobile/content/announcements/${encodeURIComponent(slug)}`,
  );
}

export async function getEvents(params?: ContentListParams) {
  return getContentList<Event>("/api/mobile/content/events", params);
}

export async function getEvent(slug: string) {
  return getContentDetail<Event>(
    `/api/mobile/content/events/${encodeURIComponent(slug)}`,
  );
}

export async function getDocuments(params?: ContentListParams) {
  return getContentList<Document>("/api/mobile/content/documents", params);
}

export async function getDocument(slug: string) {
  return getContentDetail<Document>(
    `/api/mobile/content/documents/${encodeURIComponent(slug)}`,
  );
}

export async function getExecutives(params?: ContentListParams) {
  return getContentList<Executive>("/api/mobile/content/executives", params);
}
