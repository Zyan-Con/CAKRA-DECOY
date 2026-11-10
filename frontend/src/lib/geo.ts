/** Proyeksi equirectangular sederhana untuk peta Kodam (cukup untuk skala nasional). */
export const ID_BOUNDS = { west: 94, east: 142, north: 7, south: -11 } as const;

export function projectLatLng(lat: number, lng: number, width: number, height: number): { x: number; y: number } {
  const { west, east, north, south } = ID_BOUNDS;
  return {
    x: ((lng - west) / (east - west)) * width,
    y: ((north - lat) / (north - south)) * height,
  };
}
