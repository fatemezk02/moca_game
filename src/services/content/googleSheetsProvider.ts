import { CONTENT_SOURCE_CONFIG } from '../../config/contentConfig';
import { IContentProvider } from './IContentProvider';
import { parseSheetResponse } from './googleSheetsParser';
import {
  mapRowToArtwork,
  mapRowToExperience,
  mapRowToGallery,
  mapRowToLocation,
  mapRowToPopup,
  mapRowToQuestion,
  mapRowToStar,
} from './mappers';
import {
  ArtworkContent,
  ExperienceContent,
  GalleryContent,
  LocationContent,
  PopupContent,
  QuestionContent,
  StarContent,
} from './types';

/**
 * Google Sheets implementation of IContentProvider.
 * Fetches published Google Sheets tabs as CSV/JSON, parses rows,
 * and maps them into strongly typed game data models.
 */
export class GoogleSheetsContentProvider implements IContentProvider {
  readonly name = 'GoogleSheets';

  /**
   * Resolves the fetch URL for a specific tab
   */
  private getTabUrl(
    tabKey: 'questions' | 'stars' | 'artworks' | 'galleries' | 'experiences' | 'locations' | 'pop'
  ): string {
    const directUrl = CONTENT_SOURCE_CONFIG.sheetUrls[tabKey]?.trim();
    if (directUrl) return directUrl;

    const spreadsheetId = CONTENT_SOURCE_CONFIG.spreadsheetId?.trim();
    if (spreadsheetId) {
      const tabName =
        CONTENT_SOURCE_CONFIG.tabNames?.[tabKey] ||
        (tabKey === 'questions'
          ? 'Questions'
          : tabKey === 'stars'
          ? 'Stars'
          : tabKey === 'artworks'
          ? 'Artworks'
          : tabKey === 'galleries'
          ? 'Galleries'
          : tabKey === 'experiences'
          ? 'Experiences'
          : tabKey === 'locations'
          ? 'Location'
          : 'Pop');
      return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(
        tabName
      )}`;
    }

    return '';
  }

  /**
   * Helper to perform network fetch with timeout
   */
  private async fetchText(url: string, tabName: string): Promise<string> {
    if (!url) {
      throw new Error(`[GoogleSheetsProvider] URL for "${tabName}" tab is not configured.`);
    }

    const timeoutMs = CONTENT_SOURCE_CONFIG.fetchTimeoutMs || 10000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: 'text/csv, text/plain, application/json, */*',
        },
      });

      if (!response.ok) {
        throw new Error(
          `[GoogleSheetsProvider] HTTP ${response.status} ${response.statusText} fetching "${tabName}" from ${url}`
        );
      }

      return await response.text();
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error(`[GoogleSheetsProvider] Timeout (${timeoutMs}ms) fetching tab "${tabName}".`);
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Fetch and parse Questions
   */
  async fetchQuestions(): Promise<QuestionContent[]> {
    const url = this.getTabUrl('questions');
    if (!url) return [];

    const text = await this.fetchText(url, 'Questions');
    const rawRows = parseSheetResponse(text);
    return rawRows.map((row, idx) => mapRowToQuestion(row, idx));
  }

  /**
   * Fetch and parse Stars
   */
  async fetchStars(): Promise<StarContent[]> {
    const url = this.getTabUrl('stars');
    if (!url) return [];

    const text = await this.fetchText(url, 'Stars');
    const rawRows = parseSheetResponse(text);
    return rawRows.map((row, idx) => mapRowToStar(row, idx));
  }

  /**
   * Fetch and parse Artworks
   */
  async fetchArtworks(): Promise<ArtworkContent[]> {
    const url = this.getTabUrl('artworks');
    if (!url) return [];

    const text = await this.fetchText(url, 'Artworks');
    const rawRows = parseSheetResponse(text);
    return rawRows.map((row, idx) => mapRowToArtwork(row, idx));
  }

  /**
   * Fetch and parse Galleries
   */
  async fetchGalleries(): Promise<GalleryContent[]> {
    const url = this.getTabUrl('galleries');
    if (!url) return [];

    const text = await this.fetchText(url, 'Galleries');
    const rawRows = parseSheetResponse(text);
    return rawRows.map((row, idx) => mapRowToGallery(row, idx));
  }

  /**
   * Fetch and parse Experiences
   */
  async fetchExperiences(): Promise<ExperienceContent[]> {
    const url = this.getTabUrl('experiences');
    if (!url) return [];

    try {
      const text = await this.fetchText(url, 'Experiences');
      const rawRows = parseSheetResponse(text);
      return rawRows
        .map((row, idx) => mapRowToExperience(row, idx))
        .filter((exp) => Boolean(exp.experienceId));
    } catch (err: any) {
      console.warn('[GoogleSheetsContentProvider] Failed to load Experiences tab:', err?.message || err);
      return [];
    }
  }

  /**
   * Fetch and parse Locations
   */
  async fetchLocations(): Promise<LocationContent[]> {
    const url = this.getTabUrl('locations');
    if (!url) return [];

    try {
      const text = await this.fetchText(url, 'Location');
      const rawRows = parseSheetResponse(text);
      return rawRows
        .map((row, idx) => mapRowToLocation(row, idx))
        .filter((loc) => Boolean(loc.locationId && (loc.name || loc.description)));
    } catch (err: any) {
      console.warn('[GoogleSheetsContentProvider] Failed to load Location tab:', err?.message || err);
      return [];
    }
  }

  /**
   * Fetch and parse Popups from 'pop' / 'Pop' tab
   */
  async fetchPopups(): Promise<PopupContent[]> {
    const url = this.getTabUrl('pop');
    if (!url) return [];

    try {
      const text = await this.fetchText(url, 'Pop');
      const rawRows = parseSheetResponse(text);
      return rawRows
        .map((row, idx) => mapRowToPopup(row, idx))
        .filter((pop) => Boolean(pop.popupId && (pop.infoTxt || pop.picture)));
    } catch (err: any) {
      console.warn('[GoogleSheetsContentProvider] Failed to load Pop tab:', err?.message || err);
      return [];
    }
  }

  /**
   * Fetch all datasets in parallel
   */
  async fetchAll(): Promise<{
    questions: QuestionContent[];
    stars: StarContent[];
    artworks: ArtworkContent[];
    galleries: GalleryContent[];
    experiences: ExperienceContent[];
    locations: LocationContent[];
    popups: PopupContent[];
  }> {
    const [
      questionsResult,
      starsResult,
      artworksResult,
      galleriesResult,
      experiencesResult,
      locationsResult,
      popupsResult,
    ] = await Promise.allSettled([
      this.fetchQuestions(),
      this.fetchStars(),
      this.fetchArtworks(),
      this.fetchGalleries(),
      this.fetchExperiences(),
      this.fetchLocations(),
      this.fetchPopups(),
    ]);

    const errors: string[] = [];
    const questions = questionsResult.status === 'fulfilled' ? questionsResult.value : [];
    if (questionsResult.status === 'rejected') {
      errors.push(`Questions: ${questionsResult.reason?.message || questionsResult.reason}`);
    }

    const stars = starsResult.status === 'fulfilled' ? starsResult.value : [];
    if (starsResult.status === 'rejected') {
      errors.push(`Stars: ${starsResult.reason?.message || starsResult.reason}`);
    }

    const artworks = artworksResult.status === 'fulfilled' ? artworksResult.value : [];
    if (artworksResult.status === 'rejected') {
      errors.push(`Artworks: ${artworksResult.reason?.message || artworksResult.reason}`);
    }

    const galleries = galleriesResult.status === 'fulfilled' ? galleriesResult.value : [];
    if (galleriesResult.status === 'rejected') {
      errors.push(`Galleries: ${galleriesResult.reason?.message || galleriesResult.reason}`);
    }

    const experiences = experiencesResult.status === 'fulfilled' ? experiencesResult.value : [];
    if (experiencesResult.status === 'rejected') {
      console.warn(
        `[GoogleSheetsContentProvider] Experiences tab fetch error: ${
          experiencesResult.reason?.message || experiencesResult.reason
        }`
      );
    }

    const locations = locationsResult.status === 'fulfilled' ? locationsResult.value : [];
    if (locationsResult.status === 'rejected') {
      console.warn(
        `[GoogleSheetsContentProvider] Locations tab fetch error: ${
          locationsResult.reason?.message || locationsResult.reason
        }`
      );
    }

    const popups = popupsResult.status === 'fulfilled' ? popupsResult.value : [];
    if (popupsResult.status === 'rejected') {
      console.warn(
        `[GoogleSheetsContentProvider] Pop tab fetch error: ${
          popupsResult.reason?.message || popupsResult.reason
        }`
      );
    }

    // If all core sources failed, throw combined error
    if (
      errors.length === 4 &&
      this.getTabUrl('questions') &&
      this.getTabUrl('stars') &&
      this.getTabUrl('artworks') &&
      this.getTabUrl('galleries')
    ) {
      throw new Error(`Failed to fetch all Google Sheets tabs:\n${errors.join('\n')}`);
    }

    return { questions, stars, artworks, galleries, experiences, locations, popups };
  }

  /**
   * Checks if any Google Sheets URL or ID is configured
   */
  isConfigured(): boolean {
    return Boolean(
      CONTENT_SOURCE_CONFIG.sheetUrls.questions?.trim() ||
      CONTENT_SOURCE_CONFIG.sheetUrls.stars?.trim() ||
      CONTENT_SOURCE_CONFIG.sheetUrls.artworks?.trim() ||
      CONTENT_SOURCE_CONFIG.sheetUrls.galleries?.trim() ||
      CONTENT_SOURCE_CONFIG.sheetUrls.experiences?.trim() ||
      CONTENT_SOURCE_CONFIG.sheetUrls.locations?.trim() ||
      CONTENT_SOURCE_CONFIG.sheetUrls.pop?.trim() ||
      CONTENT_SOURCE_CONFIG.spreadsheetId?.trim()
    );
  }
}
