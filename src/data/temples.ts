export interface Temple {
  id: string;
  name: string;
  city: string;
}

export const temples: Temple[] = [
  { id: "thaeron-temple", name: "Thaeron Temple", city: "Thaeron" },
  { id: "eldoria-temple", name: "Eldoria Temple", city: "Eldoria" },
  { id: "greenport-temple", name: "Greenport Temple", city: "Greenport" },
  { id: "eldenroot-temple", name: "Eldenroot Temple", city: "Eldenroot" },
  { id: "khazgrim-temple", name: "Khazgrim Temple", city: "Khazgrim" },
];

export function getTempleForCity(city: string): Temple {
  return temples.find((temple) => temple.city === city) ?? temples[0];
}
