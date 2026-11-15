export const BUSINESS = {
  name: "SHE Salon & Make-up Studio",
  address: "LaL Chauk, 6/344, Awas Vikas Colony, Yojna-3, Yojna-2, Jhusi, Prayagraj, Uttar Pradesh – 211019",
  phoneDisplay: "+91 70840 07700",
  phoneHref: "tel:+917084007700",
};

export const WHATSAPP_MESSAGE =
  "Hello She Salon & Make-up Studio! I would like to enquire about your services and book an appointment. Please share the details.";
export const WHATSAPP_URL = `https://wa.me/917084007700?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

const mapQuery = encodeURIComponent(`SHE Salon & Make-up Studio, ${BUSINESS.address}`);
export const MAP_EMBED_URL = `https://www.google.com/maps?q=${mapQuery}&output=embed`;
export const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`;
export const GOOGLE_REVIEWS_URL = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

export const NAV = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Gallery", href: "#gallery" },
  { label: "Why us", href: "#why-us" },
  { label: "Reviews", href: "#reviews" },
  { label: "Contact", href: "#contact" },
];

export type Service = { name: string; text: string; image: string; alt: string };

export const SERVICES: Service[] = [
  {
    name: "Bridal Makeup",
    text: "Your wedding look, planned around your outfit, jewellery and the light of each ceremony, and finished to last the whole day.",
    image: "service-bridal-makeup.jpg",
    alt: "Makeup artist applying eyeliner to a bride wearing a gold maang tikka",
  },
  {
    name: "Party Makeup",
    text: "Polished makeup for receptions, festivals and evenings out, from a soft glow to a defined, dramatic eye.",
    image: "service-party-makeup.jpg",
    alt: "Woman in an embroidered lavender outfit with smoky evening makeup and a maang tikka",
  },
  {
    name: "Professional Makeup",
    text: "Clean, camera-ready makeup for photoshoots, interviews, presentations and the occasions where you want to look your best.",
    image: "service-professional-makeup.jpg",
    alt: "Makeup artist sweeping pink blush onto a woman in a white robe",
  },
  {
    name: "Hair Styling",
    text: "Blow-dries, curls, braids and occasion updos, styled to suit your face, your outfit and your day.",
    image: "service-hair-styling.jpg",
    alt: "Stylist blow-drying long dark hair with a round brush",
  },
  {
    name: "Haircuts & Hair Treatments",
    text: "Cuts and trims shaped to your hair's natural fall, with nourishing treatments for dry, dull or tired hair.",
    image: "service-haircuts.jpg",
    alt: "Stylist trimming wet dark hair with scissors and a comb",
  },
  {
    name: "Eyebrow Threading & Shaping",
    text: "Precise threading that follows your natural arch, for clean, balanced brows that frame your eyes.",
    image: "service-threading.jpg",
    alt: "Side view of a woman having her eyebrows shaped with threading",
  },
  {
    name: "Eyebrow Beautification",
    text: "Careful shaping and grooming to define fuller, softer or more structured brows, agreed with you before we begin.",
    image: "service-eyebrow-beautification.jpg",
    alt: "Beautician holding a twisted thread ready for eyebrow threading",
  },
  {
    name: "Eyelash Services",
    text: "Lash care that opens up the eyes, from subtle definition to a fuller look for your special occasions.",
    image: "service-eyelash.jpg",
    alt: "Lash artist preparing a client for eyelash extensions, with an under-eye pad in place",
  },
  {
    name: "Skin Care & Beauty Treatments",
    text: "Calming facials and skin treatments chosen for your skin type, so your skin feels fresh and cared for.",
    image: "service-skin-care.jpg",
    alt: "Beautician brushing a clay mask onto a client's face during a facial",
  },
  {
    name: "Tanning Services",
    text: "Tanning treatments discussed with you first, so the result suits your skin tone and the look you have in mind.",
    image: "service-tanning.jpg",
    alt: "Facial mask being brushed onto a relaxed client's face",
  },
];

export type GalleryItem = { image: string; alt: string; caption: string; tall?: boolean };

export const GALLERY: GalleryItem[] = [
  { image: "gallery-bridal-1.jpg", alt: "Bride in a red dupatta and gold jewellery looking down, with henna on her hands", caption: "Bridal makeup", tall: true },
  { image: "gallery-party.jpg", alt: "Close-up of shimmering green eye makeup with a gold maang tikka", caption: "Party makeup", tall: true },
  { image: "interior-lounge.jpg", alt: "Bright salon lounge with a grey velvet sofa, blush cushions and rose-gold pendant lights", caption: "Salon interior" },
  { image: "gallery-hair.jpg", alt: "Smiling woman with a glossy, wavy blow-dry in a salon", caption: "Hairstyle", tall: true },
  { image: "gallery-transformation.jpg", alt: "Stylist's hands pinning a bride's hair into an updo while her makeup is finished", caption: "Bridal transformation in progress" },
  { image: "gallery-bridal-2.jpg", alt: "Smiling bride in a red and gold embroidered lehenga with a matha patti and gold choker", caption: "Finished bridal look", tall: true },
  { image: "gallery-makeup-station.jpg", alt: "Makeup artist at a dressing table laid out with eyeshadow palettes and brushes", caption: "Makeup station" },
  { image: "interior-room.jpg", alt: "Calm treatment room with a gold wavy mirror, a candle and a rolled towel", caption: "Treatment room" },
];

export const REASONS = [
  { title: "A women-only space", text: "A private, comfortable salon where every guest is a woman and you can relax completely." },
  { title: "Professional beauty and makeup services", text: "Makeup, hair, brows, lashes and skin care carried out with care and attention to detail." },
  { title: "Personalised attention", text: "We listen first and shape every look around your features, your style and your occasion." },
  { title: "Beauty and styling services in one place", text: "Plan your hair, makeup and grooming together, in one visit to one studio." },
  { title: "Convenient appointment booking", text: "Call or send a WhatsApp message and we will find a time that suits you." },
];
