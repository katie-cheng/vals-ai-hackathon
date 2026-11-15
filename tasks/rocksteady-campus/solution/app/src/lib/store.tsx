import React from "react";

const heroKota = "/images/hero-kota.webp";
const heroBurger = "/images/hero-burger.webp";
const heroDagwood = "/images/hero-dagwood.webp";
const heroToasties = "/images/hero-toasties.webp";
const heroSandwich = "/images/hero-sandwich.webp";
const chipsImage = "/images/chips.webp";
const beveragesImage = "/images/beverages.webp";
const standardExtras = [
  { id: "cheese", name: "Extra cheese", price: 10 },
  { id: "russian", name: "Russian sausage", price: 22 },
  { id: "egg", name: "Fried egg", price: 8 },
  { id: "chips", name: "Extra chips", price: 20 },
  { id: "patty", name: "Beef patty", price: 28 },
  { id: "sauce", name: "Campus sauce", price: 5 },
];
const lightExtras = [
  { id: "cheese", name: "Extra cheese", price: 10 },
  { id: "egg", name: "Fried egg", price: 8 },
  { id: "tomato", name: "Fresh tomato", price: 5 },
  { id: "sauce", name: "Campus sauce", price: 5 },
];
const defaultCategories = [
  { id: "kotas", name: "Kotas", description: "Soweto icons, stacked your way", image: heroKota, order: 1 },
  { id: "dagwoods", name: "Dagwoods", description: "Triple-layered and fully loaded", image: heroDagwood, order: 2 },
  { id: "burgers", name: "Burgers", description: "Flame-grilled, juicy and generous", image: heroBurger, order: 3 },
  { id: "rolls", name: "Rolls", description: "Fresh rolls with serious filling", image: heroDagwood, order: 4 },
  {
    id: "sandwiches",
    name: "Sandwiches",
    description: "Toasted, stacked and satisfying",
    image: heroSandwich,
    order: 5,
  },
  {
    id: "sides",
    name: "Chips & Sides",
    description: "Chips, extras and all the trimmings",
    image: chipsImage,
    order: 6,
  },
  {
    id: "beverages",
    name: "Beverages",
    description: "Something ice-cold on the side",
    image: beveragesImage,
    order: 7,
  },
  {
    id: "specials",
    name: "Specials & Combos",
    description: "More of what you love, for less",
    image: heroToasties,
    order: 8,
  },
];
const menuItem = (id, category, name, description, price, image, order, m: any = {}) => ({
  id,
  category,
  name,
  description,
  price,
  image,
  order,
  available: m.available ?? true,
  featured: m.featured ?? false,
  popular: m.popular ?? false,
  extras: m.extras ?? (category === "beverages" || category === "sides" ? [] : standardExtras),
  options: m.options ?? (category === "beverages" || category === "sides" ? [] : ["Regular", "Spicy", "No onion"]),
});
const defaultItems = [
  menuItem(
    "kota-classic",
    "kotas",
    "Campus Classic",
    "Quarter loaf filled with seasoned chips, polony, cheese, egg, atchar and our signature Campus sauce.",
    45,
    heroKota,
    1,
    { popular: true },
  ),
  menuItem(
    "kota-russian",
    "kotas",
    "Rockville Russian",
    "A proper township favourite with chips, grilled Russian, cheese, egg, lettuce and tomato.",
    55,
    heroKota,
    2,
    { popular: true },
  ),
  menuItem(
    "kota-chicken",
    "kotas",
    "Chicken Mayo Campus",
    "Tender chicken mayo, seasoned chips, cheese, lettuce and a cool drizzle of mayo.",
    65,
    heroKota,
    3,
  ),
  menuItem(
    "kota-vienna",
    "kotas",
    "Vienna Vibe",
    "Grilled viennas, chips, cheese, fried egg, atchar and tomato sauce in fresh white bread.",
    58,
    heroKota,
    4,
  ),
  menuItem(
    "kota-beef",
    "kotas",
    "Beef & Cheddar",
    "Juicy beef patty, melted cheddar, chips, caramelised onion and Campus sauce.",
    70,
    heroKota,
    5,
    { featured: true },
  ),
  menuItem(
    "kota-double",
    "kotas",
    "Double Russian Deluxe",
    "Two grilled Russians with chips, cheese, egg, atchar and a generous sauce finish.",
    75,
    heroKota,
    6,
    { popular: true },
  ),
  menuItem(
    "kota-wings",
    "kotas",
    "Wingman Kota",
    "Three flame-grilled chicken wings, chips, cheese, coleslaw and your choice of sauce.",
    78,
    heroKota,
    7,
    { options: ["Mild", "Hot", "Extra hot"] },
  ),
  menuItem(
    "kota-steak",
    "kotas",
    "Braai Steak Kota",
    "Tender strips of marinated steak, chips, cheese, fried onion and smoky BBQ sauce.",
    85,
    heroKota,
    8,
    { featured: true },
  ),
  menuItem(
    "kota-fullhouse",
    "kotas",
    "The Full House",
    "Russian, beef patty, chicken, chips, cheese, egg, atchar and all the Campus trimmings.",
    95,
    heroKota,
    9,
    { popular: true, featured: true },
  ),
  menuItem(
    "kota-vc",
    "kotas",
    "The Vice-Chancellor",
    "Our biggest statement: double meat, double cheese, chips, egg and every signature topping.",
    110,
    heroKota,
    10,
    { featured: true },
  ),
  menuItem(
    "dag-classic",
    "dagwoods",
    "Classic Dagwood",
    "Three slices of toast layered with beef, ham, cheese, egg, lettuce, tomato and chips.",
    70,
    heroDagwood,
    1,
    { popular: true },
  ),
  menuItem(
    "dag-chicken",
    "dagwoods",
    "Chicken Stack Dagwood",
    "Grilled chicken fillet, cheese, egg, lettuce, tomato and mayo across three toasted layers.",
    78,
    heroDagwood,
    2,
  ),
  menuItem(
    "dag-double",
    "dagwoods",
    "Double Beef Dagwood",
    "Two seasoned beef patties, double cheddar, egg, onion and smoky Campus sauce.",
    95,
    heroDagwood,
    3,
    { featured: true },
  ),
  menuItem(
    "dag-tower",
    "dagwoods",
    "Rocksteady Tower",
    "The full tower: beef, chicken, Russian, cheese, egg and fresh trimmings, served with chips.",
    110,
    heroDagwood,
    4,
    { featured: true },
  ),
  menuItem(
    "burger-classic",
    "burgers",
    "Campus Beef Burger",
    "Flame-grilled beef patty, cheddar, lettuce, tomato, pickle and Campus sauce on a toasted bun.",
    55,
    heroBurger,
    1,
    { popular: true },
  ),
  menuItem(
    "burger-chicken",
    "burgers",
    "Crispy Chicken Burger",
    "Golden crispy chicken fillet, creamy slaw, cheese and peri-peri mayo on a soft toasted bun.",
    60,
    heroBurger,
    2,
    { options: ["Regular", "Peri-peri", "No mayo"] },
  ),
  menuItem(
    "burger-double",
    "burgers",
    "Big Rock Double",
    "Two juicy beef patties, double cheese, fried onion, pickles and our bold signature sauce.",
    85,
    heroBurger,
    3,
    { popular: true, featured: true },
  ),
  menuItem(
    "roll-russian",
    "rolls",
    "Russian Roll",
    "A grilled Russian in a fresh roll with fried onion, mustard and tomato sauce.",
    35,
    heroDagwood,
    1,
  ),
  menuItem(
    "roll-chicken",
    "rolls",
    "Chicken Fillet Roll",
    "Grilled chicken fillet, lettuce, tomato and creamy mayo in a soft fresh roll.",
    48,
    heroDagwood,
    2,
    { popular: true },
  ),
  menuItem(
    "roll-steak",
    "rolls",
    "Steak & Onion Roll",
    "Marinated steak strips with caramelised onion and BBQ sauce in a toasted roll.",
    58,
    heroDagwood,
    3,
    { featured: true },
  ),
  menuItem(
    "roll-cheese",
    "rolls",
    "Cheese & Egg Roll",
    "Melted cheddar, fried egg and a touch of Campus sauce in a warm roll.",
    32,
    heroDagwood,
    4,
  ),
  menuItem(
    "roll-full",
    "rolls",
    "Loaded Campus Roll",
    "Russian, beef patty, cheese, egg, fried onion and all the sauces. Small roll, big appetite.",
    65,
    heroDagwood,
    5,
  ),
  menuItem(
    "sandwich-ham",
    "sandwiches",
    "Ham & Cheese Sandwich",
    "Thick-cut ham, cheddar, tomato and lettuce on your choice of fresh or toasted bread.",
    38,
    heroSandwich,
    1,
    { extras: lightExtras, options: ["Fresh", "Toasted"] },
  ),
  menuItem(
    "sandwich-chicken",
    "sandwiches",
    "Chicken Mayo Sandwich",
    "Creamy chicken mayo, crisp lettuce and tomato on soft brown or white bread.",
    45,
    heroSandwich,
    2,
    { popular: true, extras: lightExtras, options: ["White bread", "Brown bread", "Toasted"] },
  ),
  menuItem(
    "sandwich-club",
    "sandwiches",
    "Rocksteady Club",
    "Toasted triple sandwich with chicken, bacon-style macon, egg, cheese and fresh trimmings.",
    58,
    heroToasties,
    3,
    { featured: true },
  ),
  menuItem(
    "side-smallchips",
    "sides",
    "Small Chips",
    "Golden, crisp and finished with our signature chip spice.",
    20,
    chipsImage,
    1,
    { popular: true },
  ),
  menuItem(
    "side-mediumchips",
    "sides",
    "Medium Chips",
    "A generous portion of golden chips with Campus chip spice.",
    30,
    chipsImage,
    2,
  ),
  menuItem(
    "side-largechips",
    "sides",
    "Large Chips",
    "Made for sharing, or not. A large portion of seasoned golden chips.",
    40,
    chipsImage,
    3,
    { popular: true },
  ),
  menuItem(
    "side-cheesechips",
    "sides",
    "Cheesy Chips",
    "Medium chips loaded with melted cheddar and Campus sauce.",
    42,
    chipsImage,
    4,
  ),
  menuItem("side-russian", "sides", "Russian", "One flame-grilled Russian sausage.", 22, heroKota, 5),
  menuItem("side-vienna", "sides", "Vienna", "One grilled vienna sausage.", 10, heroKota, 6),
  menuItem("side-polony", "sides", "Polony", "A classic kota filling portion.", 8, heroKota, 7),
  menuItem("side-cheese", "sides", "Cheese Slice", "One slice of creamy cheddar-style cheese.", 10, heroKota, 8),
  menuItem("side-egg", "sides", "Fried Egg", "Fresh egg, fried to order.", 8, heroKota, 9),
  menuItem("side-patty", "sides", "Beef Patty", "One seasoned flame-grilled beef patty.", 28, heroBurger, 10),
  menuItem("side-chicken", "sides", "Chicken Fillet", "One grilled or crispy chicken fillet.", 30, heroBurger, 11, {
    options: ["Grilled", "Crispy"],
  }),
  menuItem("side-steak", "sides", "Steak Strips", "A portion of marinated steak strips.", 35, heroDagwood, 12),
  menuItem("side-macon", "sides", "Macon", "Crispy beef macon strips.", 15, heroToasties, 13),
  menuItem(
    "side-wings",
    "sides",
    "Chicken Wings (3)",
    "Three flame-grilled wings in your choice of sauce.",
    35,
    heroKota,
    14,
    { options: ["Mild", "Hot", "BBQ"] },
  ),
  menuItem("side-atchar", "sides", "Atchar", "A punchy portion of traditional mango atchar.", 8, heroKota, 15),
  menuItem("side-slaw", "sides", "Coleslaw", "Cool, crunchy and creamy house coleslaw.", 12, heroSandwich, 16),
  menuItem("side-lettuce", "sides", "Lettuce", "Fresh crisp lettuce.", 4, heroSandwich, 17),
  menuItem("side-tomato", "sides", "Tomato", "Fresh sliced tomato.", 5, heroSandwich, 18),
  menuItem("side-onion", "sides", "Fried Onion", "Sweet caramelised onion portion.", 6, heroDagwood, 19),
  menuItem("side-pickle", "sides", "Pickles", "Tangy sliced pickles.", 5, heroBurger, 20),
  menuItem("side-campus", "sides", "Campus Sauce", "Our creamy, tangy house signature sauce.", 5, heroKota, 21, {
    popular: true,
  }),
  menuItem("side-bbq", "sides", "BBQ Sauce", "Smoky and sweet barbecue sauce.", 5, heroKota, 22),
  menuItem("side-peri", "sides", "Peri-Peri Sauce", "A fiery chilli kick on the side.", 5, heroKota, 23),
  menuItem("side-mayo", "sides", "Mayonnaise", "A creamy mayo portion.", 4, heroKota, 24),
  menuItem("side-tomatosauce", "sides", "Tomato Sauce", "The classic tomato sauce portion.", 4, heroKota, 25),
  menuItem(
    "drink-coke",
    "beverages",
    "Coca-Cola 440ml",
    "Ice-cold original Coca-Cola in a 440ml bottle.",
    18,
    beveragesImage,
    1,
    { popular: true, options: ["Original", "Zero Sugar"] },
  ),
  menuItem(
    "drink-fanta",
    "beverages",
    "Fanta Orange 440ml",
    "Bright, sparkling orange refreshment served ice-cold.",
    18,
    beveragesImage,
    2,
  ),
  menuItem(
    "drink-sprite",
    "beverages",
    "Sprite 440ml",
    "Crisp lemon-lime sparkle in a 440ml bottle.",
    18,
    beveragesImage,
    3,
  ),
  menuItem(
    "drink-stoney",
    "beverages",
    "Stoney Ginger Beer 440ml",
    "Bold ginger bite, served chilled.",
    18,
    beveragesImage,
    4,
  ),
  menuItem("drink-water", "beverages", "Still Water 500ml", "Refreshing bottled still water.", 12, beveragesImage, 5),
  menuItem(
    "drink-juice",
    "beverages",
    "Fruit Juice 300ml",
    "A chilled fruit juice to complete your meal.",
    16,
    beveragesImage,
    6,
    { options: ["Orange", "Apple", "Mango"] },
  ),
  menuItem(
    "combo-solo",
    "specials",
    "Solo Campus Combo",
    "Campus Classic Kota with a 440ml soft drink. Your everyday flavour fix.",
    58,
    heroKota,
    1,
    { popular: true, featured: true },
  ),
  menuItem(
    "combo-burger",
    "specials",
    "Burger Night Combo",
    "Campus Beef Burger, medium chips and a 440ml soft drink.",
    85,
    heroBurger,
    2,
    { featured: true },
  ),
  menuItem(
    "combo-duo",
    "specials",
    "Rockville Duo",
    "Two Rockville Russian Kotas and two 440ml soft drinks for the crew.",
    130,
    heroKota,
    3,
    { popular: true },
  ),
  menuItem(
    "combo-family",
    "specials",
    "Campus Family Feast",
    "Two beef burgers, two Russian rolls, large chips and four soft drinks.",
    240,
    heroToasties,
    4,
    { featured: true },
  ),
];
const defaultHeroSlides = [
  {
    id: "hero-1",
    image: heroKota,
    title: "Big flavour. Generous portions. Real township taste.",
    text: "Freshly prepared kotas, dagwoods, burgers and more, stacked with quality ingredients and served with true Rockville heart.",
  },
  {
    id: "hero-2",
    image: heroBurger,
    title: "Your new burger obsession starts here.",
    text: "Juicy patties, melted cheese and our bold Campus sauce. Built fresh when you order, never before.",
  },
  {
    id: "hero-3",
    image: heroDagwood,
    title: "Three layers. Zero shortcuts.",
    text: "Our dagwoods bring big township energy to every bite. Generous fillings, fresh trimmings, proper flavour.",
  },
  {
    id: "hero-4",
    image: heroToasties,
    title: "Feed the crew. Rocksteady style.",
    text: "From quick lunches to family feasts, there is always enough flavour to go around.",
  },
  {
    id: "hero-5",
    image: heroSandwich,
    title: "Freshly made. Proudly Soweto.",
    text: "Quality ingredients, honest prices and a warm Rockville welcome, every single day.",
  },
];
const defaultGallery = [
  { id: "g1", src: heroKota, title: "The Vice-Chancellor Kota", category: "Kotas & Dagwoods", order: 1 },
  { id: "g2", src: heroBurger, title: "Big Rock Double", category: "Burgers & Sandwiches", order: 2 },
  { id: "g3", src: heroDagwood, title: "Steak & Onion, stacked high", category: "Kotas & Dagwoods", order: 3 },
  { id: "g4", src: heroToasties, title: "Fresh off the grill", category: "Food Preparation", order: 4 },
  { id: "g5", src: heroSandwich, title: "Made fresh in Rockville", category: "Burgers & Sandwiches", order: 5 },
  { id: "g6", src: "/images/kitchen-fire.webp", title: "Behind the flavour", category: "Food Preparation", order: 6 },
  {
    id: "g7",
    src: "/images/community-soweto.webp",
    title: "Good food, good people",
    category: "Our Community",
    order: 7,
  },
  {
    id: "g8",
    src: "/images/friends-feast.webp",
    title: "A table full of favourites",
    category: "Our Community",
    order: 8,
  },
];
const defaultReviews = [
  {
    id: "r1",
    name: "Naledi M.",
    rating: 5,
    text: "The Full House is genuinely generous and everything tasted fresh. My order was ready when I arrived and the service was warm.",
    date: "2026-10-28",
    status: "approved",
    meal: "The Full House",
  },
  {
    id: "r2",
    name: "Sipho K.",
    rating: 5,
    text: "Best chips in Rockville, and that Campus sauce needs its own fan club. Proper flavour at a price that makes sense.",
    date: "2026-10-21",
    status: "approved",
    meal: "Rockville Russian",
  },
  {
    id: "r3",
    name: "Thandi R.",
    rating: 5,
    text: "Ordered the family feast for Sunday lunch and everyone was happy. Easy ordering, big portions and no fuss.",
    date: "2026-10-14",
    status: "approved",
    meal: "Campus Family Feast",
  },
  {
    id: "r4",
    name: "Kagiso D.",
    rating: 4,
    text: "The Big Rock Double lives up to its name. Juicy, fresh and filling. I will definitely be back with the guys.",
    date: "2026-10-06",
    status: "approved",
    meal: "Big Rock Double",
  },
  {
    id: "r5",
    name: "Lerato S.",
    rating: 5,
    text: "You can taste that it is made to order. Loved the chicken mayo sandwich and the friendly WhatsApp updates.",
    date: "2026-09-29",
    status: "approved",
    meal: "Chicken Mayo Sandwich",
  },
];
const defaultContent = {
  announcement: "Free delivery in Rockville on orders over R350",
  homeHeroPrimary: "Order now",
  homeHeroSecondary: "Explore our menu",
  categoriesTitle: "Pick your favourite.",
  categoriesText: "From iconic kotas to flame-grilled burgers, every order is made fresh and packed with flavour.",
  bestsellersTitle: "The meals everyone talks about.",
  bestsellersText: "Big on flavour, generous by nature. Meet the orders our regulars keep coming back for.",
  promoTitle: "More flavour. Less spend.",
  promoText: "The Solo Campus Combo is a Campus Classic Kota and a 440ml soft drink for R58.",
  promoButton: "Grab the combo",
  whyTitle: "We don’t do small flavour.",
  whyText: "Good food should fill you up, bring people together and never cost more than it should.",
  whyOneTitle: "Fresh, every order",
  whyOneText: "Your meal hits the grill when you order. No shortcuts, no warming trays, just fresh flavour.",
  whyTwoTitle: "Portions that deliver",
  whyTwoText: "We stack generously because a Rocksteady meal should leave you properly satisfied.",
  whyThreeTitle: "Proudly Rockville",
  whyThreeText: "Local heart, local flavour and a warm welcome for every person who walks through our door.",
  reviewsTitle: "Soweto has spoken.",
  reviewsText: "Real reviews from the people who make our campus a community.",
  locationTitle: "Find us in Rockville.",
  locationText: "Collection is quick, delivery is easy, and there is always something delicious coming off the grill.",
  aboutHeroTitle: "This is more than a takeaway.",
  aboutHeroText: "Rocksteady Campus is where Rockville comes for generous food, honest value and the kind of welcome that feels like home.",
  storyTitle: "Born in Rockville. Built on flavour.",
  storyTextOne: "Rocksteady Campus started with a simple belief: township food deserves to be celebrated. From our home on Makapane Street, we set out to serve the meals our community loves with the care, consistency and generosity they deserve.",
  storyTextTwo: "Every kota tells a Soweto story: resourceful, bold and made to be shared. We honour that story by doing the basics brilliantly: fresh bread, quality fillings, seasoned chips and service with heart.",
  passionTitle: "The grill is our love language.",
  passionText: "We get excited about the sizzle of a fresh patty, perfectly golden chips and that first bite of a fully loaded kota. That passion is in every order, whether it is a quick roll or a feast for the whole crew.",
  qualityTitle: "Good ingredients. No shortcuts.",
  qualityText: "We choose dependable suppliers, prepare fresh throughout the day and cook every meal to order. Quality is not a slogan here; it is the standard we hold ourselves to, from prep to handover.",
  portionsTitle: "Generous by nature. Affordable by design.",
  portionsText: "We know value matters. Our menu is built around honest prices and portions that satisfy, so students, families, workers and neighbours can all enjoy a proper meal.",
  communityTitle: "Rockville is in every bite.",
  communityText: "We are proud to serve the people who make this place what it is. Rocksteady Campus is a meeting point, a lunch break, a payday treat and a familiar face. We are a small business with a big commitment to its neighbourhood.",
  qualityCardOneTitle: "Quality ingredients",
  qualityCardOneText: "Dependable suppliers, fresh bread, quality fillings and produce prepared with care.",
  qualityCardTwoTitle: "Freshly prepared",
  qualityCardTwoText: "We cook to order so your meal reaches you hot, crisp and exactly as it should be.",
  qualityCardThreeTitle: "Consistently good",
  qualityCardThreeText: "The same attention to flavour and presentation, whether it is your first visit or your fiftieth.",
  menuBottomTitle: "Need a little something extra?",
  menuBottomText: "Open any meal to choose your style and add your favourite extras.",
  reviewsFormTitle: "How was your Rocksteady?",
  reviewsFormText: "Your feedback helps us keep the flavour high and the service sharp. Reviews are checked by our team before they appear here.",
  contactWhatsappTitle: "Let’s talk on WhatsApp.",
  contactWhatsappText: "Ask about the menu, a large order or your delivery. We will get back to you during opening hours.",
  contactFormTitle: "Send us a message.",
  contactFormText: "Planning a crew order or have a question? Leave your details and the Campus team will get back to you.",
  menuHeroTitle: "What’s your flavour?",
  menuHeroText: "Made fresh. Stacked generously. Customise your meal, add your extras and make it yours.",
  orderHeroTitle: "Build your order.",
  orderHeroText: "Choose your favourites, customise every bite and select collection or delivery.",
  galleryHeroTitle: "Looks good. Tastes even better.",
  galleryHeroText: "Behind the grill, around the table and everywhere big flavour brings people together.",
  reviewsHeroTitle: "The Rockville review.",
  reviewsHeroText: "See what our customers are saying, then tell us about your Rocksteady experience.",
  contactHeroTitle: "Come through. Say hello.",
  contactHeroText: "Find us in the heart of Rockville, call ahead or send us a WhatsApp. We are ready to make your next favourite meal.",
};
function createDefaultData() {
  return {
    content: { ...defaultContent },
    images: {
      logo: "/images/rocksteady-logo.png",
      aboutStory: "/images/community-soweto.webp",
      aboutKitchen: "/images/kitchen-fire.webp",
      aboutCommunity: "/images/friends-feast.webp",
      promo: "/images/hero-kota.webp",
      contact: "/images/hero-dagwood.webp",
      menuHero: "/images/hero-kota.webp",
      orderHero: "/images/hero-toasties.webp",
      galleryHero: "/images/hero-burger.webp",
      reviewsHero: "/images/hero-sandwich.webp",
    },
    heroSlides: defaultHeroSlides.map((a) => ({ ...a })),
    categories: defaultCategories.map((a) => ({ ...a })),
    items: defaultItems.map((a) => ({ ...a, extras: a.extras.map((i) => ({ ...i })), options: [...a.options] })),
    gallery: defaultGallery.map((a) => ({ ...a })),
    reviews: defaultReviews.map((a) => ({ ...a })),
    orders: [],
    customers: [],
    promotions: [
      {
        id: "p1",
        code: "CAMPUS10",
        title: "Campus Welcome",
        description: "10% off your first online order over R100.",
        value: 10,
        type: "percent",
        minSpend: 100,
        active: true,
        expires: "2027-12-31",
      },
      {
        id: "p2",
        code: "ROCKVILLE20",
        title: "Rockville Regular",
        description: "R20 off orders over R250.",
        value: 20,
        type: "fixed",
        minSpend: 250,
        active: true,
        expires: "2027-12-31",
      },
    ],
    settings: {
      businessName: "Rocksteady Campus",
      address: "1563 Makapane Street, Rockville, Soweto, 1818, South Africa",
      phone: "063 104 4361",
      whatsapp: "27631044361",
      email: "hello@rocksteadycampus.co.za",
      hoursWeek: "Monday – Saturday: 11:00 – 20:00",
      hoursSunday: "Sunday: Closed",
      deliveryFee: 25,
      freeDeliveryAbove: 350,
      deliveryEnabled: true,
      collectionEnabled: true,
      instagram: "https://www.instagram.com/",
      facebook: "https://www.facebook.com/",
      tiktok: "https://www.tiktok.com/",
      paymentProvider: "Not connected",
      paymentConfigured: false,
      orderNotifications: true,
    },
    enquiries: [],
  };
}
export const formatRand = (a) => `R${a.toFixed(2).replace(".00", "")}`;
const DATA_KEY = "rocksteady-campus-data-v4";
const CART_KEY = "rocksteady-campus-cart-v2";
const SESSION_KEY = "rocksteady-campus-session-v2";
function loadData() {
  const a = createDefaultData();
  try {
    const i = localStorage.getItem(DATA_KEY);
    if (!i) return a;
    const o = JSON.parse(i);
    return {
      ...a,
      ...o,
      content: { ...a.content, ...(o.content || {}) },
      images: { ...a.images, ...(o.images || {}) },
      settings: { ...a.settings, ...(o.settings || {}) },
    };
  } catch {
    return a;
  }
}
function loadJson(a, i) {
  try {
    const o = localStorage.getItem(a);
    return o ? JSON.parse(o) : i;
  } catch {
    return i;
  }
}
async function hashPassword(a, i) {
  const o = new TextEncoder().encode(`${i}:${a}:rocksteady-campus`);
  const r = await crypto.subtle.digest("SHA-256", o);
  return Array.from(new Uint8Array(r))
    .map((c) => c.toString(16).padStart(2, "0"))
    .join("");
}
function createSalt() {
  const a = crypto.getRandomValues(new Uint8Array(12));
  return Array.from(a)
    .map((i) => i.toString(16).padStart(2, "0"))
    .join("");
}
const StoreContext = React.createContext(null);
export function StoreProvider({ children }: any) {
  const [data, setData] = React.useState(loadData);
  const [cart, setCart] = React.useState(() => loadJson(CART_KEY, []));
  const [session, setSession] = React.useState(() => loadJson(SESSION_KEY, null));
  const [cartOpen, setCartOpen] = React.useState(false);
  const [activeItem, openItem] = React.useState(null);
  const [toast, setToast] = React.useState("");
  const w = React.useRef(null);
  React.useEffect(() => {
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
  }, [data]);
  React.useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);
  React.useEffect(() => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }, [session]);
  const notify = React.useCallback((Z) => {
    setToast(Z);
    if (w.current) {
      clearTimeout(w.current);
    }
    w.current = setTimeout(() => setToast(""), 3200);
  }, []);
  const getLinePrice = React.useCallback(
    (Z) => {
      const it = data.items.find((ct) => ct.id === Z.itemId);
      return it ? (it.price + Z.extras.reduce((ct, J) => ct + J.price, 0)) * Z.quantity : 0;
    },
    [data.items],
  );
  const N = React.useMemo(() => cart.reduce((Z, it) => Z + getLinePrice(it), 0), [cart, getLinePrice]);
  const cartCount = React.useMemo(() => cart.reduce((Z, it) => Z + it.quantity, 0), [cart]);
  const addToCart = React.useCallback(
    (Z, quantity, extras, option, instructions) => {
      const key = `${Z.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setCart((K) => [...K, { key, itemId: Z.id, quantity, extras, option, instructions }]);
      openItem(null);
      notify(`${Z.name} added to your order`);
      setCartOpen(true);
    },
    [notify],
  );
  const updateCartQuantity = React.useCallback((Z, quantity) => {
    if (quantity <= 0) {
      setCart((ct) => ct.filter((J) => J.key !== Z));
    } else {
      setCart((ct) => ct.map((J) => (J.key === Z ? { ...J, quantity } : J)));
    }
  }, []);
  const placeOrder = React.useCallback(
    (Z) => {
      if (!cart.length) throw new Error("Your cart is empty.");
      const lines = cart.map((ft) => {
        const Xt = data.items.find((Se) => Se.id === ft.itemId);
        return {
          itemId: Xt.id,
          name: Xt.name,
          quantity: ft.quantity,
          unitPrice: Xt.price + ft.extras.reduce((Se, kn) => Se + kn.price, 0),
          extras: ft.extras,
          option: ft.option,
          instructions: ft.instructions,
        };
      });
      const subtotal = lines.reduce((ft, Xt) => ft + Xt.unitPrice * Xt.quantity, 0);
      const J = data.promotions.find((ft) => ft.active && ft.code.toLowerCase() === Z.promoCode?.trim().toLowerCase());
      const X =
        J && subtotal >= J.minSpend
          ? Math.min(subtotal, J.type === "percent" ? (subtotal * J.value) / 100 : J.value)
          : 0;
      const deliveryFee =
        Z.fulfilment === "Delivery" ? (subtotal >= data.settings.freeDeliveryAbove ? 0 : data.settings.deliveryFee) : 0;
      const K = new Date();
      const ht = {
        id: crypto.randomUUID(),
        number: `RSC-${String(K.getFullYear()).slice(2)}${String(K.getMonth() + 1).padStart(2, "0")}-${Math.floor(1e3 + Math.random() * 9e3)}`,
        customerId: session?.role === "customer" ? session.id : undefined,
        customerName: Z.customerName,
        phone: Z.phone,
        email: Z.email,
        fulfilment: Z.fulfilment,
        address: Z.address,
        instructions: Z.instructions,
        payment: Z.payment,
        lines,
        subtotal,
        deliveryFee,
        discount: Math.round(X * 100) / 100,
        total: Math.round((subtotal + deliveryFee - X) * 100) / 100,
        status: "Received",
        createdAt: K.toISOString(),
        history: [{ status: "Received", at: K.toISOString() }],
        location: Z.location,
      };
      setData((ft) => ({ ...ft, orders: [ht, ...ft.orders] }));
      setCart([]);
      setCartOpen(false);
      notify(`Order ${ht.number} received`);
      return ht;
    },
    [cart, data.items, data.promotions, data.settings, notify, session],
  );
  const updateOrderStatus = React.useCallback(
    (Z, status) => {
      setData((ct) => ({
        ...ct,
        orders: ct.orders.map((J) =>
          J.id === Z ? { ...J, status, history: [...J.history, { status, at: new Date().toISOString() }] } : J,
        ),
      }));
      notify(`Order updated to ${status}`);
    },
    [notify],
  );
  const submitReview = React.useCallback(
    (Z) => {
      const it = { ...Z, id: crypto.randomUUID(), date: new Date().toISOString().slice(0, 10), status: "pending" };
      setData((ct) => ({ ...ct, reviews: [it, ...ct.reviews] }));
      notify("Thank you, your review is awaiting approval");
    },
    [notify],
  );
  const submitEnquiry = React.useCallback(
    (Z) => {
      setData((it) => ({
        ...it,
        enquiries: [
          { ...Z, id: crypto.randomUUID(), createdAt: new Date().toISOString(), read: false },
          ...it.enquiries,
        ],
      }));
      notify("Message sent. We will be in touch");
    },
    [notify],
  );
  const login = React.useCallback(
    async (Z, it, ct) => {
      if (ct === "admin")
        return Z.trim().toLowerCase() === "admin@rocksteady.co.za" && it === "Rocksteady2026!"
          ? (setSession({ id: "admin", name: "Campus Administrator", email: "admin@rocksteady.co.za", role: "admin" }),
            { ok: true, message: "Welcome back, Administrator" })
          : { ok: false, message: "Those administrator credentials are not correct." };
      const J = data.customers.find((W) => W.email.toLowerCase() === Z.trim().toLowerCase());
      return !J || !J.active
        ? { ok: false, message: "We could not find an active account with that email." }
        : (await hashPassword(it, J.salt)) !== J.passwordHash
          ? { ok: false, message: "Your email or password is not correct." }
          : (setSession({ id: J.id, name: J.name, email: J.email, role: "customer" }),
            { ok: true, message: `Welcome back, ${J.name.split(" ")[0]}` });
    },
    [data.customers],
  );
  const register = React.useCallback(
    async (Z, it, ct, J) => {
      if (data.customers.some((ht) => ht.email.toLowerCase() === it.trim().toLowerCase()))
        return { ok: false, message: "An account already exists for this email." };
      const salt = createSalt();
      const passwordHash = await hashPassword(J, salt);
      const K = {
        id: crypto.randomUUID(),
        name: Z.trim(),
        email: it.trim().toLowerCase(),
        phone: ct.trim(),
        passwordHash,
        salt,
        addresses: [],
        role: "customer",
        active: true,
        createdAt: new Date().toISOString(),
      };
      setData((ht) => ({ ...ht, customers: [...ht.customers, K] }));
      setSession({ id: K.id, name: K.name, email: K.email, role: "customer" });
      return { ok: true, message: "Your Campus account is ready" };
    },
    [data.customers],
  );
  const resetPassword = React.useCallback(
    async (Z, it) => {
      const ct = data.customers.find((W) => W.email.toLowerCase() === Z.trim().toLowerCase());
      if (!ct) return { ok: false, message: "No customer account uses that email." };
      const salt = createSalt();
      const passwordHash = await hashPassword(it, salt);
      setData((W) => ({
        ...W,
        customers: W.customers.map((K) => (K.id === ct.id ? { ...K, salt, passwordHash } : K)),
      }));
      return { ok: true, message: "Password updated. You can now sign in." };
    },
    [data.customers],
  );
  const vt = {
    data,
    setData,
    cart,
    cartCount,
    subtotal: N,
    cartOpen,
    setCartOpen,
    activeItem,
    openItem,
    closeItem: () => openItem(null),
    addToCart,
    updateCartQuantity,
    removeFromCart: (Z) => setCart((it) => it.filter((ct) => ct.key !== Z)),
    clearCart: () => setCart([]),
    getLinePrice,
    placeOrder,
    updateOrderStatus,
    submitReview,
    submitEnquiry,
    session,
    login,
    register,
    resetPassword,
    logout: () => setSession(null),
    toast,
    notify,
    resetWebsite: () => {
      setData(createDefaultData());
      setCart([]);
      notify("Website content restored to the original version");
    },
  };
  return <StoreContext.Provider value={vt}>{children}</StoreContext.Provider>;
}
export function useStore() {
  const a = React.useContext(StoreContext);
  if (!a) throw new Error("useStore must be used inside StoreProvider");
  return a;
}
