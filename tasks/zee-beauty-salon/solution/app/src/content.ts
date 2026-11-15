// All business content in one place so the owner's confirmed details can replace the placeholders.
// Services, descriptions and the gallery are placeholders until the salon confirms them; prices stay hidden.

export const BUSINESS = {
  name: "ZEE Beauty Saloon",
  address: "Shop #2, Mian Mir Market, Main Bazar, near Moughal Shadi Hall, Sahowari Mughalpura, Lahore",
  phoneDisplay: "+92 323 4325141",
  phoneTel: "+923234325141",
  whatsappNumber: "923234325141",
  hours: "11:00 AM – 8:00 PM",
  directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=Mian+Mir+Market%2C+Mughalpura%2C+Lahore",
};

export const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Gallery", href: "#gallery" },
  { label: "Contact", href: "#contact" },
];

export type Service = { name: string; image: string; short: string; more: string };

export const SERVICES: Service[] = [
  {
    name: "Bridal Makeup",
    image: "/images/service-bridal-makeup.jpg",
    short: "Wedding-day makeup planned around your outfit, jewellery and the look you have in mind.",
    more: "Tell us about your events, your outfits and how you like to look in photographs. We will plan a look with you that lasts through a long day.",
  },
  {
    name: "Party Makeup",
    image: "/images/service-party-makeup.jpg",
    short: "Makeup for mehndi, dholki, dinners and evenings out, from soft and natural to bold.",
    more: "Bring a photo of your outfit or a look you love, and we will adapt it to your features and the occasion.",
  },
  {
    name: "Hair Styling",
    image: "/images/service-hair-styling.jpg",
    short: "Blow-dries, curls and updos for an event, or just because.",
    more: "Styling for weddings, parties and everyday occasions, shaped to your hair's length and texture.",
  },
  {
    name: "Haircuts",
    image: "/images/service-haircuts.jpg",
    short: "Cuts and trims shaped to your hair type and the way you like to wear it.",
    more: "Whether you want a small trim or a new shape, we start by talking through how you style your hair day to day.",
  },
  {
    name: "Hair Treatments",
    image: "/images/service-hair-treatments.jpg",
    short: "Care for dry, tired or heat-styled hair.",
    more: "Ask which treatments suit your hair. We will recommend an option after looking at your hair in person.",
  },
  {
    name: "Facial Treatments",
    image: "/images/service-facial-treatments.jpg",
    short: "Facials to cleanse, refresh and relax.",
    more: "A calm hour for your skin. Let us know about any sensitivities before your appointment.",
  },
  {
    name: "Skincare",
    image: "/images/service-skincare.jpg",
    short: "Skin care sessions, with simple advice for your routine at home.",
    more: "We will look at your skin's needs and suggest steps that fit your routine.",
  },
  {
    name: "Waxing",
    image: "/images/service-waxing.jpg",
    short: "Waxing done carefully, with your comfort in mind.",
    more: "Let us know which areas you would like done when you book, so we can plan the right amount of time.",
  },
  {
    name: "Threading",
    image: "/images/service-threading.jpg",
    short: "Precise eyebrow and facial threading.",
    more: "Quick, precise shaping for brows, upper lip and face. A good appointment to fit into a busy day.",
  },
  {
    name: "Manicure & Pedicure",
    image: "/images/service-manicure-pedicure.jpg",
    short: "Hand and nail care, and pedicures to refresh tired feet.",
    more: "Shaping, cuticle care and polish for hands and feet. Tell us your preferred colours when you book.",
  },
];

export const GALLERY_CATEGORIES = ["Makeup Inspiration", "Bridal Looks", "Hair Styling", "Beauty Treatments", "Salon Interior"] as const;
export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];

export const GALLERY: { src: string; category: GalleryCategory; alt: string; width: number; height: number }[] = [
  { src: "/images/gallery-bridal-1.jpg", category: "Bridal Looks", alt: "Bride in a red dupatta and gold jewellery looking down, with henna on her hands", width: 1067, height: 1600 },
  { src: "/images/gallery-makeup-1.jpg", category: "Makeup Inspiration", alt: "Close-up of shimmering green eye makeup with a gold maang tikka", width: 1067, height: 1600 },
  { src: "/images/gallery-hair-1.jpg", category: "Hair Styling", alt: "Smiling woman with a glossy, wavy blow-dry in a salon", width: 1067, height: 1600 },
  { src: "/images/gallery-interior-1.jpg", category: "Salon Interior", alt: "Calm treatment room with a gold wavy mirror, a candle and a rolled towel", width: 1067, height: 1600 },
  { src: "/images/gallery-treatments-1.jpg", category: "Beauty Treatments", alt: "Facial mask being brushed onto a relaxed client's face", width: 1067, height: 1600 },
  { src: "/images/gallery-makeup-2.jpg", category: "Makeup Inspiration", alt: "Makeup artist sweeping pink blush onto a woman in a white robe", width: 1067, height: 1600 },
  { src: "/images/gallery-bridal-2.jpg", category: "Bridal Looks", alt: "Smiling bride in a red and gold embroidered lehenga with a matha patti and gold choker", width: 1094, height: 1600 },
  { src: "/images/gallery-hair-2.jpg", category: "Hair Styling", alt: "Stylist's hands pinning a bride's hair into an updo", width: 1600, height: 1066 },
  { src: "/images/gallery-treatments-2.jpg", category: "Beauty Treatments", alt: "Beautician holding a twisted thread ready for eyebrow threading", width: 1067, height: 1600 },
  { src: "/images/gallery-interior-2.jpg", category: "Salon Interior", alt: "Bright reception lounge with a grey velvet sofa, blush cushions and rose-gold pendant lights", width: 1600, height: 1066 },
];

export const HIGHLIGHTS = [
  { title: "Welcoming Atmosphere", text: "A calm, friendly space where you can sit back and take a moment for yourself." },
  { title: "Personalized Beauty Experience", text: "We listen first, then shape every look around you, your features and your plans." },
  { title: "Attention to Detail", text: "Clean lines, careful blending and a finish we check with you before you leave." },
  { title: "Beauty and Self-Care", text: "Looking after your hair and skin is part of feeling good, not an afterthought." },
  { title: "Convenient Mughalpura Location", text: "In Mian Mir Market on Main Bazar, easy to reach from across Mughalpura." },
];

export const TIME_SLOTS = Array.from({ length: 17 }, (_, i) => {
  const minutes = 11 * 60 + i * 30;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${((h + 11) % 12) + 1}:${m === 0 ? "00" : "30"} ${h < 12 ? "AM" : "PM"}`;
});

export function whatsappLink(message: string): string {
  return `https://wa.me/${BUSINESS.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
