import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/api/query-keys";

import {
  getAnnouncement,
  getAnnouncements,
  getContentHome,
  getDocument,
  getDocuments,
  getEvent,
  getEvents,
  getExecutives,
} from "./content-api";
import { ContentListParams } from "./content-types";

export function useContentHome() {
  return useQuery({
    queryKey: queryKeys.content.home(),
    queryFn: getContentHome,
  });
}

export function useAnnouncements(params?: ContentListParams) {
  return useQuery({
    queryKey: queryKeys.content.lists("announcements", params),
    queryFn: () => getAnnouncements(params),
  });
}

export function useAnnouncement(slug?: string | null) {
  return useQuery({
    enabled: Boolean(slug),
    queryKey: queryKeys.content.detail("announcements", slug ?? ""),
    queryFn: () => getAnnouncement(slug ?? ""),
  });
}

export function useEvents(params?: ContentListParams) {
  return useQuery({
    queryKey: queryKeys.content.lists("events", params),
    queryFn: () => getEvents(params),
  });
}

export function useEvent(slug?: string | null) {
  return useQuery({
    enabled: Boolean(slug),
    queryKey: queryKeys.content.detail("events", slug ?? ""),
    queryFn: () => getEvent(slug ?? ""),
  });
}

export function useDocuments(params?: ContentListParams) {
  return useQuery({
    queryKey: queryKeys.content.lists("documents", params),
    queryFn: () => getDocuments(params),
  });
}

export function useDocument(slug?: string | null) {
  return useQuery({
    enabled: Boolean(slug),
    queryKey: queryKeys.content.detail("documents", slug ?? ""),
    queryFn: () => getDocument(slug ?? ""),
  });
}

export function useExecutives(params?: ContentListParams) {
  return useQuery({
    queryKey: queryKeys.content.lists("executives", params),
    queryFn: () => getExecutives(params),
  });
}
