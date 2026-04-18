export interface Bookmark {
  id: string;
  title: string;
  url: string;
  lastUsed: number;
  category: string;
  tags: string[];
}

export type SortOrder = 'newest' | 'oldest' | 'alpha';

export interface FilterState {
  activeCategory: string | null;
  activeTags: string[];
  searchQuery: string;
  sortOrder: SortOrder;
}
