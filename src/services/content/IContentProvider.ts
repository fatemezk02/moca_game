import {
  ArtworkContent,
  GalleryContent,
  QuestionContent,
  StarContent,
  ExperienceContent,
  LocationContent,
  PopupContent,
} from './types';

/**
 * Interface representing any content provider backend (Google Sheets, REST API, MySQL microservice, etc.)
 *
 * This allows replacing Google Sheets with an Express/MySQL backend later
 * without having to touch any game or UI components.
 */
export interface IContentProvider {
  /** Identifier name of the provider (e.g. 'GoogleSheets', 'BackendApi') */
  readonly name: string;

  /** Fetch Questions dataset */
  fetchQuestions(): Promise<QuestionContent[]>;

  /** Fetch Stars dataset */
  fetchStars(): Promise<StarContent[]>;

  /** Fetch Artworks dataset */
  fetchArtworks(): Promise<ArtworkContent[]>;

  /** Fetch Galleries dataset */
  fetchGalleries(): Promise<GalleryContent[]>;

  /** Fetch Experiences dataset */
  fetchExperiences(): Promise<ExperienceContent[]>;

  /** Fetch Locations dataset */
  fetchLocations(): Promise<LocationContent[]>;

  /** Fetch Popups dataset */
  fetchPopups(): Promise<PopupContent[]>;

  /** Fetch all datasets in parallel */
  fetchAll(): Promise<{
    questions: QuestionContent[];
    stars: StarContent[];
    artworks: ArtworkContent[];
    galleries: GalleryContent[];
    experiences: ExperienceContent[];
    locations: LocationContent[];
    popups: PopupContent[];
  }>;
}
