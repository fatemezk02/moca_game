/**
 * Global Store for managing Location Pins Visibility on the Map.
 * Default state is FALSE (hidden initially).
 * Toggling makes them appear with quick growth animation or hide.
 */

let locationPinsVisible = false;

export function getLocationPinsVisible(): boolean {
  return locationPinsVisible;
}

export function setLocationPinsVisible(visible: boolean): void {
  locationPinsVisible = visible;
  window.dispatchEvent(
    new CustomEvent('museum_location_pins_visibility_changed', {
      detail: { visible: locationPinsVisible, timestamp: Date.now() },
    })
  );
}

export function toggleLocationPinsVisible(): boolean {
  locationPinsVisible = !locationPinsVisible;
  window.dispatchEvent(
    new CustomEvent('museum_location_pins_visibility_changed', {
      detail: { visible: locationPinsVisible, timestamp: Date.now() },
    })
  );
  return locationPinsVisible;
}
