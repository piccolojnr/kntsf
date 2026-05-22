export type ContentListParams = {
  search?: string;
  category?: string;
  featured?: boolean;
  upcoming?: boolean;
  page?: number;
  per_page?: number;
};

export type ContentItem = {
  id: string | number;
  slug: string;
  title: string;
  excerpt?: string | null;
  content?: string | null;
  description?: string | null;
  category?: string | null;
  status?: string | null;
  published_at?: string | null;
  image_url?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  location?: string | null;
};

export type Announcement = ContentItem;

export type Event = ContentItem;

export type DocumentFile = {
  id?: string | number;
  title?: string | null;
  name?: string | null;
  url?: string | null;
  file_url?: string | null;
  mime_type?: string | null;
  size?: string | number | null;
};

export type Document = ContentItem & {
  files?: DocumentFile[];
  file_url?: string | null;
  url?: string | null;
};

export type Executive = {
  id: string | number;
  name: string;
  position: string;
  biography?: string | null;
  avatar_url?: string | null;
  email?: string | null;
  phone?: string | null;
};

export type MobileContentHome = {
  announcements: Announcement[];
  events: Event[];
  documents: Document[];
  executives: Executive[];
};
