// Every business fact the site shows lives here, so the family can update contact details, ratings and policies in one place.
// Contact channels the owner has not provided yet stay empty: the site then says they are pending instead of inventing them.
// They can also be set at build time with VITE_CONTACT_WHATSAPP, VITE_CONTACT_PHONE and VITE_CONTACT_EMAIL.

const env = import.meta.env;

export type Channel = "whatsapp" | "phone" | "email";

export const site = {
  name: "Gîte chez l'habitant Amazigh",
  listingName: "Chez l'habitant AmazighTiken",
  host: "Mohamed",
  url: "https://chez-habitant-amazigh.example",
  address: {
    locality: "Comune rurale de Ghassate",
    city: "Ouarzazate",
    postalCode: "45022",
    country: "Morocco",
  },
  geo: { lat: 31.178871, lng: -6.813136 },
  links: {
    maps: "https://www.google.com/maps?q=31.178871,-6.813136",
    directions: "https://www.google.com/maps/dir/?api=1&destination=31.178871,-6.813136",
    booking: "https://www.booking.com/hotel/ma/chez-l-habitant-amazightiken.fr.html",
    airbnb: "https://www.airbnb.fr/rooms/956593018740086715",
  },
  contact: {
    // Digits only with country code, e.g. 2126XXXXXXXX. Owner must provide.
    whatsapp: (env.VITE_CONTACT_WHATSAPP as string | undefined) ?? "",
    phone: (env.VITE_CONTACT_PHONE as string | undefined) ?? "",
    email: (env.VITE_CONTACT_EMAIL as string | undefined) ?? "",
    // The channel inquiries are sent through once it is configured.
    preferred: "whatsapp" as Channel,
  },
  spokenLanguages: ["ar", "fr", "en", "es", "pt"] as const,
  ratings: {
    source: "Booking.com",
    url: "https://www.booking.com/hotel/ma/chez-l-habitant-amazightiken.fr.html#tab-reviews",
    checked: "2026-11",
    overall: 9.4,
    scale: 10,
    reviews: 51,
    categories: [
      { key: "staff", score: 9.8 },
      { key: "value", score: 9.6 },
      { key: "comfort", score: 9.4 },
      { key: "location", score: 9.3 },
      { key: "facilities", score: 9.2 },
      { key: "cleanliness", score: 9.1 },
      { key: "wifi", score: 7.5 },
    ],
  },
  policies: {
    checkIn: "10:00–21:00",
    checkOut: "09:00–18:00",
    // Direct reservations stay off until the family has confirmed every policy.
    directReservations: false,
  },
} as const;

export type RatingKey = (typeof site.ratings.categories)[number]["key"];

export const hasChannel = (c: Channel) => site.contact[c].trim().length > 0;

export function whatsappUrl(text: string) {
  const number = site.contact.whatsapp.replace(/\D/g, "");
  return number ? `https://wa.me/${number}?text=${encodeURIComponent(text)}` : null;
}
