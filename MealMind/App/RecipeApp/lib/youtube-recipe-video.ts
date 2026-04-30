import type { MockRecipe } from '@/lib/mealmind-recipe-mocks';
import { cookedDishSearchSuffix } from '@/lib/recipe-title-media-boost';

const YT_VIDEO_ID_RE = /^[a-zA-Z0-9_-]{11}$/;

export function isLikelyYoutubeVideoId(id: string): boolean {
  return YT_VIDEO_ID_RE.test(id.trim());
}

/** Static thumbnail for tap-to-open playback (in-app embeds often hit YouTube error 152 in WebView). */
export function youtubeVideoThumbnailUrl(videoId: string): string {
  const id = videoId.trim();
  return `https://img.youtube.com/vi/${encodeURIComponent(id)}/hqdefault.jpg`;
}

/** True when the hero URL is a YouTube still for this video (any quality: hqdefault, maxresdefault, etc.). */
export function isHeroImageFromSameYoutubeVideo(
  heroImage: string | null | undefined,
  videoId: string | null | undefined,
): boolean {
  if (!heroImage?.trim() || !videoId || !isLikelyYoutubeVideoId(videoId)) {
    return false;
  }
  const id = videoId.trim();
  const re = /img\.youtube\.com\/vi\/([^/]+)\//i;
  const m = re.exec(heroImage.trim());
  if (!m) {
    return false;
  }
  try {
    return decodeURIComponent(m[1]) === id;
  } catch {
    return m[1] === id;
  }
}

function getYoutubeDataApiKey(): string | undefined {
  return process.env.EXPO_PUBLIC_YOUTUBE_API_KEY?.trim() || undefined;
}

/** Phrase for YouTube search: prefer model output, else title + staples. */
export function buildYoutubeSearchQuery(recipe: MockRecipe): string {
  const fromModel = recipe.tutorialSearchQuery?.trim();
  if (fromModel && fromModel.length > 2) {
    return fromModel.replace(/\s+/g, ' ').slice(0, 160);
  }
  const ing = recipe.ingredients
    .map((i) => i.name.trim())
    .filter((n) => n.length > 0 && !/see steps/i.test(n))
    .slice(0, 4)
    .join(' ');
  const base = `${recipe.title} recipe how to cook`;
  const q = ing ? `${base} ${ing}` : base;
  const withDish = `${q} ${cookedDishSearchSuffix(recipe.title)}`.replace(/\s+/g, ' ').trim();
  return withDish.slice(0, 160);
}

export function youtubeResultsSearchUrl(searchQuery: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
}

type YtSearchItem = {
  id?: { videoId?: string };
  snippet?: { title?: string };
};

function pickBestVideoId(items: YtSearchItem[]): string | null {
  const rows = items
    .map((it) => ({
      id: it.id?.videoId,
      title: (it.snippet?.title ?? '').toLowerCase(),
    }))
    .filter((x): x is { id: string; title: string } => typeof x.id === 'string' && isLikelyYoutubeVideoId(x.id));
  if (rows.length === 0) {
    return null;
  }
  const recipeHint = /recipe|how to|how-to|cook|make |easy |homemade|tutorial/;
  const preferred = rows.filter((s) => recipeHint.test(s.title));
  return (preferred[0] ?? rows[0]).id;
}

/** YouTube Data API v3 search; returns first sensible tutorial match. */
export type YoutubeVideoSnippet = {
  title: string;
  description: string;
};

/** Video title + description (often lists steps/timings) for aligning written instructions. */
export async function fetchYoutubeVideoSnippet(videoId: string): Promise<YoutubeVideoSnippet | null> {
  const key = getYoutubeDataApiKey();
  const id = videoId.trim();
  if (!key || !isLikelyYoutubeVideoId(id)) {
    return null;
  }
  const url = new URL('https://www.googleapis.com/youtube/v3/videos');
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('id', id);
  url.searchParams.set('key', key);

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12_000);
  let res: Response;
  try {
    res = await fetch(url.toString(), { signal: ctrl.signal });
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) {
    return null;
  }
  const data = (await res.json()) as {
    items?: Array<{ snippet?: { title?: string; description?: string } }>;
  };
  const sn = data.items?.[0]?.snippet;
  if (!sn) {
    return null;
  }
  const title = typeof sn.title === 'string' ? sn.title.trim() : '';
  const description = typeof sn.description === 'string' ? sn.description.trim() : '';
  if (!title && !description) {
    return null;
  }
  return { title: title || 'Recipe video', description };
}

export async function fetchYoutubeVideoIdForSearchQuery(searchQuery: string): Promise<string | null> {
  const key = getYoutubeDataApiKey();
  if (!key || !searchQuery.trim()) {
    return null;
  }
  const q = searchQuery.replace(/\s+/g, ' ').trim().slice(0, 200);
  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('type', 'video');
  url.searchParams.set('maxResults', '8');
  url.searchParams.set('videoEmbeddable', 'true');
  url.searchParams.set('safeSearch', 'moderate');
  url.searchParams.set('q', q);
  url.searchParams.set('key', key);

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12_000);
  let res: Response;
  try {
    res = await fetch(url.toString(), { signal: ctrl.signal });
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) {
    return null;
  }
  const data = (await res.json()) as { items?: YtSearchItem[] };
  const items = data.items ?? [];
  return pickBestVideoId(items);
}

function watchUrlForVideoId(id: string): string {
  return `https://www.youtube.com/watch?v=${encodeURIComponent(id)}`;
}

export async function attachTutorialYoutubeVideos(recipes: MockRecipe[]): Promise<MockRecipe[]> {
  const key = getYoutubeDataApiKey();
  if (!key) {
    return recipes;
  }
  return Promise.all(
    recipes.map(async (r) => {
      const existing = r.tutorialVideoUrl?.trim();
      if (existing && /^https:\/\//i.test(existing) && /youtube\.com\/watch|youtu\.be\//i.test(existing)) {
        return r;
      }
      const q = buildYoutubeSearchQuery(r);
      const id = await fetchYoutubeVideoIdForSearchQuery(q);
      if (!id) {
        return r;
      }
      const thumb = youtubeVideoThumbnailUrl(id);
      return {
        ...r,
        tutorialVideoUrl: watchUrlForVideoId(id),
        heroImage: thumb,
        videoThumb: thumb,
      };
    }),
  );
}

function youtubeVideoIdFromUrl(url: string | undefined): string | null {
  const u = url?.trim();
  if (!u) {
    return null;
  }
  const m = /(?:youtu\.be\/|youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/i.exec(u);
  const id = m?.[1]?.trim();
  return id && isLikelyYoutubeVideoId(id) ? id : null;
}

/** Use the matched YouTube thumbnail as hero so list/detail match the tutorial. */
export function syncRecipesHeroWithYoutubeThumbnails(recipes: MockRecipe[]): MockRecipe[] {
  return recipes.map((r) => {
    const id = youtubeVideoIdFromUrl(r.tutorialVideoUrl);
    if (!id) {
      return r;
    }
    const thumb = youtubeVideoThumbnailUrl(id);
    return { ...r, heroImage: thumb, videoThumb: thumb };
  });
}
