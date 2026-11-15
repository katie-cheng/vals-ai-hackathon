# S13 critiques

Every SlopLabel label means "slop" (see `data/sloplabel/README.md`). S13 labels are listed in full; S14 (`gpt-6-luna`, same brief)
labels are listed only to record which ones match a pattern S13 also has. Crops and context shots are the labeller's own captures
of the live S13/S14 apps. Full records (selector, computed styles, outer HTML) are in `critiques.json`.

## S13 (muse-spark-1.3-max), all by katie

### #38  `src/components/Hero.tsx:117:8`  (div, viewport 1235px, scrollY 0)

- Element text: 'FREE ESTIMATES · ALL OF CONNECTICUT'
- Comment: capital mono eyebrow with the rounded corners as a tag = classic ai slop, ESPECIALLY the pulsing flashing dot on the left. usually this information here is useless too, i would just cut generally do not use capital eyebrows with smaller font size
- Crop: [38.png](../../../../data/sloplabel/shots/38.png) · context: [38_ctx.png](../../../../data/sloplabel/shots/38_ctx.png)

### #40  `src/components/Hero.tsx:125:12`  (span, viewport 1235px, scrollY 0)

- Element text: (none)
- Comment: pulsing dot animation DO NOT DO THIS
- Crop: [40.png](../../../../data/sloplabel/shots/40.png) · context: [40_ctx.png](../../../../data/sloplabel/shots/40_ctx.png)

### #46  `src/components/Hero.tsx:18:8`  (span, viewport 960px, scrollY 0)

- Element text: 'in'
- Comment: why is there such a big gap between the main text and the subtitle. should not exist
- Crop: [46.png](../../../../data/sloplabel/shots/46.png) · context: [46_ctx.png](../../../../data/sloplabel/shots/46_ctx.png)

### #51  `src/components/Header.tsx:76:10`  (nav, viewport 1107px, scrollY 0)

- Element text: 'Services Results Process Why us Pricing Areas FAQ'
- Comment: as the nav bar is narrowed, the "Why us" wraps to a second line. the nav bar should probably collapse into a button to expand instead of warping the text in it and making it wrap
- Crop: [51.png](../../../../data/sloplabel/shots/51.png) · context: [51_ctx.png](../../../../data/sloplabel/shots/51_ctx.png)

### #58  `src/components/Header.tsx:89:12`  (a, viewport 1278px, scrollY 143)

- Element text: '860-578-6207'
- Comment: the phone number should not wrap to next line when collapsed, if the viewport is too small for something then it should hide elements that are too large for it and offer an alternate way to see the nav
- Crop: [58.png](../../../../data/sloplabel/shots/58.png) · context: [58_ctx.png](../../../../data/sloplabel/shots/58_ctx.png)

### #61  `src/components/Hero.tsx:188:12`  (div, viewport 1232px, scrollY 330)

- Element text: 'Gutters · Siding · Concrete'
- Comment: When you scroll down, these secondary buttons scroll up faster than the main CTAs and overlap with them, causing text to overlap and buttons to overlap. When scrolling down, the buttons should never be overlapping; they should stay under them or disappear
- Crop: [61.png](../../../../data/sloplabel/shots/61.png) · context: [61_ctx.png](../../../../data/sloplabel/shots/61_ctx.png)

### #62  `src/components/Hero.tsx:182:8`  (div, viewport 1232px, scrollY 166)

- Element text: 'Interior + exterior glass Gutters · Siding · Concrete Streak-aware finish'
- Comment: this whole row of buttons collides with the row on top since it goes further up faster on scroll-down. it causes the buttons and text to overlap. it's one thing for the buttons to overlap (bad accessibility) but its super ugly for transparent buttons to overlap on top of each other
- Crop: [62.png](../../../../data/sloplabel/shots/62.png) · context: [62_ctx.png](../../../../data/sloplabel/shots/62_ctx.png)

### #67  `src/components/Services.tsx:260:12`  (p, viewport 1232px, scrollY 859)

- Element text: '01 / CLEANING SERVICES'
- Comment: Mono small font eyebrow is hallmark ai slop. get rid of eyebrow or make a normal title, lowercase. having left hand symbols like dots, dashes, and slashes also are major indicators of ai slop
- Crop: [67.png](../../../../data/sloplabel/shots/67.png) · context: [67_ctx.png](../../../../data/sloplabel/shots/67_ctx.png)

### #73  `src/components/Hero.tsx:223:8`  (div, viewport 1232px, scrollY 534)

- Element text: 'PRESSURE WASHING WINDOW CLEANING GUTTER CLEANING HOUSE WASHING DRIVEWAYS PATIOS FREE ESTIM'
- Comment: The area of the scroller doesnt span the entire horizontal width of the page, why does it cut off before the end? this is very weird and sloppy.
- Crop: [73.png](../../../../data/sloplabel/shots/73.png) · context: [73_ctx.png](../../../../data/sloplabel/shots/73_ctx.png)

### #75  `src/components/Services.tsx:204:14`  (p, viewport 1232px, scrollY 1021)

- Element text: '01 — PRESSURE WASHING'
- Comment: Uppercase mono small font eyebrow = is bad AI slop. i feel like this should just be the title of the section or part of the description, feels crowded My main gripe is the combo of uppercase and small font as an eyebrow. it is really ai slop.
- Crop: [75.png](../../../../data/sloplabel/shots/75.png) · context: [75_ctx.png](../../../../data/sloplabel/shots/75_ctx.png)

### #107  `src/components/Services.tsx:213:18`  (li, viewport 1232px, scrollY 1325)

- Element text: 'Driveway and sidewalk pressure washing'
- Comment: Glowing dots as bullet points are ai slop. also the bullet point is not aligned to the list item. it should at least be centered vertically with the first line of each bullet point, this one is slightly above.
- Crop: [107.png](../../../../data/sloplabel/shots/107.png) · context: [107_ctx.png](../../../../data/sloplabel/shots/107_ctx.png)

### #121  `src/components/Header.tsx:97:14`  (a, viewport 1097px, scrollY 0)

- Element text: 'Get a free quote'
- Comment: This button text wraps badly on medium width displays, the text should not wrap/manipulate within buttons. it should either hide the button when the text inside is too wide, or at least the text should stay centered within the button
- Crop: [121.png](../../../../data/sloplabel/shots/121.png) · context: [121_ctx.png](../../../../data/sloplabel/shots/121_ctx.png)

### #126  `src/components/Services.tsx:191:14`  (div, viewport 1232px, scrollY 1266)

- Element text: 'CONCRETE, PAVERS AND STUBBORN GRIME'
- Comment: feels a bit like useless info; its just adding adjectives to places and its too crowded
- Crop: [126.png](../../../../data/sloplabel/shots/126.png) · context: [126_ctx.png](../../../../data/sloplabel/shots/126_ctx.png)

### #127  `src/components/Services.tsx:204:14`  (p, viewport 1232px, scrollY 1740)

- Element text: '02 — EXTERIOR WINDOW CLEANING'
- Comment: uppercase mono eyebrow bad
- Crop: [127.png](../../../../data/sloplabel/shots/127.png) · context: [127_ctx.png](../../../../data/sloplabel/shots/127_ctx.png)

### #131  `src/components/Services.tsx:200:12`  (div, viewport 1232px, scrollY 1854)

- Element text: '02 02 — EXTERIOR WINDOW CLEANING Let Connecticut back into the room. Pollen, water spots, '
- Comment: this has way too much info, you dont need a description and then multiple bullet points, its too repetitive
- Crop: [131.png](../../../../data/sloplabel/shots/131.png) · context: [131_ctx.png](../../../../data/sloplabel/shots/131_ctx.png)

### #133  `src/components/Services.tsx:195:14`  (div, viewport 1232px, scrollY 1305)

- Element text: 'Get a pressure washing quote'
- Comment: this CTA is duplicated in the image (and only appears when you scroll?) this CTA is also in the description area of the image
- Crop: [133.png](../../../../data/sloplabel/shots/133.png) · context: [133_ctx.png](../../../../data/sloplabel/shots/133_ctx.png)

### #134  `src/components/Services.tsx:227:16`  (a, viewport 1232px, scrollY 1305)

- Element text: 'Get a pressure washing quote'
- Comment: duplicated CTA from the one in the image area
- Crop: [134.png](../../../../data/sloplabel/shots/134.png) · context: [134_ctx.png](../../../../data/sloplabel/shots/134_ctx.png)

### #135  `src/components/Services.tsx:227:16`  (a, viewport 1232px, scrollY 2018)

- Element text: 'Get an exterior window quote'
- Comment: duplicated CTA from the text area and image area
- Crop: [135.png](../../../../data/sloplabel/shots/135.png) · context: [135_ctx.png](../../../../data/sloplabel/shots/135_ctx.png)

### #136  `src/App.tsx:113:4`  (div, viewport 1232px, scrollY 656)

- Element text: 'Skip to main content THE SUDS SQUAD CONNECTICUT Services Results Process Why us Pricing Ar'
- Comment: the same card format is repeated so many times i feel like there should just be a carousel so the site isnt so long and repetitive
- Crop: [136.png](../../../../data/sloplabel/shots/136.png) · context: [136_ctx.png](../../../../data/sloplabel/shots/136_ctx.png)

### #139  `src/components/BeforeAfter.tsx:211:16`  (span, viewport 1232px, scrollY 4966)

- Element text: 'House Siding'
- Comment: font should not be bold here
- Crop: [139.png](../../../../data/sloplabel/shots/139.png) · context: [139_ctx.png](../../../../data/sloplabel/shots/139_ctx.png)

### #144  `src/components/BeforeAfter.tsx:139:8`  (span, viewport 1232px, scrollY 5232)

- Element text: (none)
- Comment: pulsing button is very ai slop, no pulsing buttons
- Crop: [144.png](../../../../data/sloplabel/shots/144.png) · context: [144_ctx.png](../../../../data/sloplabel/shots/144_ctx.png)

### #150  `src/components/BeforeAfter.tsx:89:6`  (span, viewport 1232px, scrollY 5232)

- Element text: 'AFTER'
- Comment: when the slider is moved over after, it covers after. if the slider is moved over the before label, it does not cover the before label. need more consistency
- Crop: [150.png](../../../../data/sloplabel/shots/150.png) · context: [150_ctx.png](../../../../data/sloplabel/shots/150_ctx.png)

### #157  `src/components/BeforeAfter.tsx:115:10`  (div, viewport 1232px, scrollY 5211)

- Element text: (none)
- Comment: The images are not aligned so that the panels in the wood are the same size. the panels on the right side of the wood are narrower so this ruins the panel cleaning effect..
- Crop: [157.png](../../../../data/sloplabel/shots/157.png) · context: [157_ctx.png](../../../../data/sloplabel/shots/157_ctx.png)

### #168  `src/components/BeforeAfter.tsx:231:14`  (p, viewport 1232px, scrollY 5481)

- Element text: 'HOUSE WASHING'
- Comment: uppercase small mono font eyebrow bad
- Crop: [168.png](../../../../data/sloplabel/shots/168.png) · context: [168_ctx.png](../../../../data/sloplabel/shots/168_ctx.png)

### #170  `src/components/BeforeAfter.tsx:68:8`  (img, viewport 1232px, scrollY 5208)

- Element text: (none)
- Comment: the lines in the concrete of this image dont line up either - models should be checking the images theyre putting in visually
- Crop: [170.png](../../../../data/sloplabel/shots/170.png) · context: [170_ctx.png](../../../../data/sloplabel/shots/170_ctx.png)

### #174  `src/components/BeforeAfter.tsx:115:10`  (div, viewport 1232px, scrollY 5291)

- Element text: (none)
- Comment: this is not even the same window????? this does not make me feel like its being cleaned if its two totally different windows what are we doing
- Crop: [174.png](../../../../data/sloplabel/shots/174.png) · context: [174_ctx.png](../../../../data/sloplabel/shots/174_ctx.png)

### #190  `src/components/BeforeAfter.tsx:130:8`  (div, viewport 1232px, scrollY 5162)

- Element text: (none)
- Comment: the example of cleaning an apartment literallly just has the "before" side as a tinted dark version of the same image. this does not indicate cleaning at all, as a customer i would expect a real image of an apartment before and after a cleaning. this feels like the business is fake and a scam.
- Crop: [190.png](../../../../data/sloplabel/shots/190.png) · context: [190_ctx.png](../../../../data/sloplabel/shots/190_ctx.png)

### #228  `src/components/Process.tsx:87:24`  (p, viewport 1232px, scrollY 6312)

- Element text: 'YOU REACH OUT'
- Comment: mono uppercase eyebrow in a tag is very slop, just put this info elsewhere, it makes each element really tall with a lot of negative space
- Crop: [228.png](../../../../data/sloplabel/shots/228.png) · context: [228_ctx.png](../../../../data/sloplabel/shots/228_ctx.png)

### #230  `src/components/Process.tsx:66:18`  (div, viewport 1232px, scrollY 6459)

- Element text: '1'
- Comment: the glow is very ai slop
- Crop: [230.png](../../../../data/sloplabel/shots/230.png) · context: [230_ctx.png](../../../../data/sloplabel/shots/230_ctx.png)

### #235  `src/components/Process.tsx:81:22`  (div, viewport 1232px, scrollY 6587)

- Element text: 'WE MAKE A PLAN Schedule the right clean We review the property and confirm the scope, accu'
- Comment: gradient in the corner of this is slop, dont use gradients like this
- Crop: [235.png](../../../../data/sloplabel/shots/235.png) · context: [235_ctx.png](../../../../data/sloplabel/shots/235_ctx.png)

### #237  `src/components/Process.tsx:105:18`  (div, viewport 1232px, scrollY 6734)

- Element text: (none)
- Comment: why are there empty components
- Crop: [237.png](../../../../data/sloplabel/shots/237.png) · context: [237_ctx.png](../../../../data/sloplabel/shots/237_ctx.png)

### #239  `src/components/Process.tsx:74:20`  (span, viewport 1232px, scrollY 7031)

- Element text: '3'
- Comment: this badge looks like a notification badge instead of numbering steps
- Crop: [239.png](../../../../data/sloplabel/shots/239.png) · context: [239_ctx.png](../../../../data/sloplabel/shots/239_ctx.png)

### #246  `src/components/Process.tsx:64:16`  (div, viewport 1232px, scrollY 6450)

- Element text: '1 YOU REACH OUT Request your free estimate Tell us what needs attention through the quote '
- Comment: the dashed line moving downward on top of the solid line filling up as you scroll down looks sloppy- shouldnt it be under the solid line?
- Crop: [246.png](../../../../data/sloplabel/shots/246.png) · context: [246_ctx.png](../../../../data/sloplabel/shots/246_ctx.png)

### #255  `src/components/Trust.tsx:66:14`  (div, viewport 1232px, scrollY 8222)

- Element text: '6 CLEANING SPECIALTIES One statewide residential squad'
- Comment: having big numbers seems forced. the numbers dont mean anything to me without sufficient context and its way too crowded here
- Crop: [255.png](../../../../data/sloplabel/shots/255.png) · context: [255_ctx.png](../../../../data/sloplabel/shots/255_ctx.png)

### #256  `src/components/Trust.tsx:66:14`  (div, viewport 1232px, scrollY 8222)

- Element text: '1 STATEWIDE SERVICE AREA All of Connecticut'
- Comment: the shine on the top of each of these bubbles is ai sloppy
- Crop: [256.png](../../../../data/sloplabel/shots/256.png) · context: [256_ctx.png](../../../../data/sloplabel/shots/256_ctx.png)

### #258  `src/components/Trust.tsx:75:16`  (p, viewport 1232px, scrollY 8222)

- Element text: 'SIMPLE PROCESS STEPS'
- Comment: bad mono uppercase font
- Crop: [258.png](../../../../data/sloplabel/shots/258.png) · context: [258_ctx.png](../../../../data/sloplabel/shots/258_ctx.png)

### #260  `src/components/Trust.tsx:45:12`  (p, viewport 1232px, scrollY 8071)

- Element text: '04 / COMPANY FACTS'
- Comment: bad mono uppercase font
- Crop: [260.png](../../../../data/sloplabel/shots/260.png) · context: [260_ctx.png](../../../../data/sloplabel/shots/260_ctx.png)

### #261  `src/lib/anim.tsx:95:4`  (div, viewport 1232px, scrollY 8500)

- Element text: 'Professional service Clear communication, a defined scope, and respectful work around your'
- Comment: theres two diff containers here where if i mouse around this area, the animation for the icon jumps back and forth
- Crop: [261.png](../../../../data/sloplabel/shots/261.png) · context: [261_ctx.png](../../../../data/sloplabel/shots/261_ctx.png)

### #262  `src/components/Trust.tsx:89:18`  (div, viewport 1232px, scrollY 8645)

- Element text: 'Quality results We choose the method for the surface and judge the finished result, rather'
- Comment: gradient on hover is bad/ugly/slop
- Crop: [262.png](../../../../data/sloplabel/shots/262.png) · context: [262_ctx.png](../../../../data/sloplabel/shots/262_ctx.png)

### #263  `src/lib/anim.tsx:95:4`  (div, viewport 1232px, scrollY 8645)

- Element text: 'Reliable scheduling Your time matters. We agree on the plan, confirm the work, and keep th'
- Comment: the animation plays and resets over and over again if you hover your cursor here because i think the hitbox for the animation is wrong and as it hovers up it overlaps?
- Crop: [263.png](../../../../data/sloplabel/shots/263.png) · context: [263_ctx.png](../../../../data/sloplabel/shots/263_ctx.png)

### #264  `src/components/PricingAreas.tsx:40:14`  (div, viewport 1232px, scrollY 9427)

- Element text: 'CUSTOM ESTIMATES Larger jobs need a look first. Gutter cleaning, house washing, driveways,'
- Comment: too much info like why is tehre so much in the hierarchy its too crowded, prob cut the eyebrow or one of the captions
- Crop: [264.png](../../../../data/sloplabel/shots/264.png) · context: [264_ctx.png](../../../../data/sloplabel/shots/264_ctx.png)

### #266  `src/components/PricingAreas.tsx:70:18`  (p, viewport 1232px, scrollY 9427)

- Element text: 'LARGE WINDOWS'
- Comment: bad mono uppercase title
- Crop: [266.png](../../../../data/sloplabel/shots/266.png) · context: [266_ctx.png](../../../../data/sloplabel/shots/266_ctx.png)

### #268  `src/components/PricingAreas.tsx:96:16`  (svg, viewport 1232px, scrollY 10239)

- Element text: 'HartfordMeridenWallingfordDanburyGreenwich'
- Comment: the text is underneath a lot of the points its overlapping
- Crop: [268.png](../../../../data/sloplabel/shots/268.png) · context: [268_ctx.png](../../../../data/sloplabel/shots/268_ctx.png)

### #270  `src/components/PricingAreas.tsx:177:14`  (p, viewport 1232px, scrollY 10239)

- Element text: 'REPRESENTATIVE SERVICE TOWNS'
- Comment: bad uppercase label
- Crop: [270.png](../../../../data/sloplabel/shots/270.png) · context: [270_ctx.png](../../../../data/sloplabel/shots/270_ctx.png)

### #274  `src/components/PricingAreas.tsx:93:14`  (p, viewport 1232px, scrollY 10195)

- Element text: 'CONNECTICUT SERVICE MAP'
- Comment: repetitive info between title and subtitle
- Crop: [274.png](../../../../data/sloplabel/shots/274.png) · context: [274_ctx.png](../../../../data/sloplabel/shots/274_ctx.png)

### #277  `src/components/PricingAreas.tsx:171:14`  (p, viewport 1232px, scrollY 10295)

- Element text: 'We serve homes throughout Connecticut, from the Capitol Region to the shoreline and Fairfi'
- Comment: this is repeitive with the captions on the image
- Crop: [277.png](../../../../data/sloplabel/shots/277.png) · context: [277_ctx.png](../../../../data/sloplabel/shots/277_ctx.png)

### #279  `src/components/Faq.tsx:56:18`  (button, viewport 1232px, scrollY 10852)

- Element text: '05 Do you clean inside windows? +'
- Comment: loading in with blur is pretty ai sloppy
- Crop: [279.png](../../../../data/sloplabel/shots/279.png) · context: [279_ctx.png](../../../../data/sloplabel/shots/279_ctx.png)

### #280  `src/components/Quote.tsx:233:10`  (div, viewport 1232px, scrollY 12310)

- Element text: 'Free quote request CONNECTICUT ONLY PROPERTY AND CONTACT DETAILS FULL NAME * PHONE * EMAIL'
- Comment: the glow at the top edge of this section is ai slop
- Crop: [280.png](../../../../data/sloplabel/shots/280.png) · context: [280_ctx.png](../../../../data/sloplabel/shots/280_ctx.png)

### #281  `src/components/Quote.tsx:310:20`  (span, viewport 1232px, scrollY 12310)

- Element text: 'CONNECTICUT ONLY'
- Comment: bad uppercase label
- Crop: [281.png](../../../../data/sloplabel/shots/281.png) · context: [281_ctx.png](../../../../data/sloplabel/shots/281_ctx.png)

### #284  `src/components/Footer.tsx:148:12`  (p, viewport 1232px, scrollY 13667)

- Element text: 'Connecticut window cleaning, gutter cleaning, and pressure washing.'
- Comment: footer section repetitive with the footer right above it; it repeats the site name and the subtitle
- Crop: [284.png](../../../../data/sloplabel/shots/284.png) · context: [284_ctx.png](../../../../data/sloplabel/shots/284_ctx.png)

### #285  `src/components/Footer.tsx:79:14`  (button, viewport 1232px, scrollY 13667)

- Element text: 'Share this website'
- Comment: can prob just be an icon
- Crop: [285.png](../../../../data/sloplabel/shots/285.png) · context: [285_ctx.png](../../../../data/sloplabel/shots/285_ctx.png)

### #287  `src/components/Footer.tsx:75:14`  (p, viewport 1232px, scrollY 13667)

- Element text: 'Residential window cleaning, gutter care, house washing, and pressure washing throughout C'
- Comment: repeitive caption with the footer underneath it
- Crop: [287.png](../../../../data/sloplabel/shots/287.png) · context: [287_ctx.png](../../../../data/sloplabel/shots/287_ctx.png)

### #292  `src/components/Services.tsx:188:14`  (div, viewport 390px, scrollY 1154)

- Element text: (none)
- Comment: sprinkler animation is overlayed on top of an image making it look very sloppy and crowded, also the sprinkler animation loads in first before the image so it looks bad upon load-in
- Crop: [292.png](../../../../data/sloplabel/shots/292.png) · context: [292_ctx.png](../../../../data/sloplabel/shots/292_ctx.png)

### #297  `src/components/Services.tsx:213:18`  (li, viewport 390px, scrollY 3364)

- Element text: 'Interior window washing, not just the outside'
- Comment: each element fading in from the left is very ai sloppy, they should not be fading in from left
- Crop: [297.png](../../../../data/sloplabel/shots/297.png) · context: [297_ctx.png](../../../../data/sloplabel/shots/297_ctx.png)

## S14 (gpt-6-luna) labels that match an S13 pattern

| S14 # | Comment | S13 pattern |
| --- | --- | --- |
| [#307](../../../../data/sloplabel/shots/307_ctx.png) | bad uppercase little eyebrow, very ai slop | uppercase eyebrow (same as #67) |
| [#310](../../../../data/sloplabel/shots/310_ctx.png) | pulsing circle animation is very ai slop | pulsing dot (same as #40) |
| [#317](../../../../data/sloplabel/shots/317_ctx.png) | bad uppercase small font eyebrow, ai slop | uppercase eyebrow (same as #67) |
| [#318](../../../../data/sloplabel/shots/318_ctx.png) | bad em dash usage, slop | em dash usage in copy (S13 uses em dashes in service eyebrows and the town confirmation line) |
| [#322](../../../../data/sloplabel/shots/322_ctx.png) | dot on the left side of elements is ai slop | dot on the left of elements (same as #67 / #107) |
| [#327](../../../../data/sloplabel/shots/327_ctx.png) | these photos are not relevant at all, they are not the same surface being cleaned at all, some of the befores arent even dirty | before/after photos are not the same surface (same as #157 #170 #174 #190) |
| [#332](../../../../data/sloplabel/shots/332_ctx.png) | when the text animates in, it animates up from a bottom line which reveals the baseline its animating up from, looks very sloppy | headline words animate up out of a clip line (S13 SplitWords/HeroWords use the same clip-mask reveal) |
| [#334](../../../../data/sloplabel/shots/334_ctx.png) | bad uppercase small eyebrow, having stuff on the left of the titles of each section is very sloplike | uppercase eyebrow with left-hand mark (same as #67) |
| [#338](../../../../data/sloplabel/shots/338_ctx.png) | these arrow buttons dont do anything when clicked, slop | carousel arrows must work (relevant to #136 if a carousel is introduced) |
| [#340](../../../../data/sloplabel/shots/340_ctx.png) | scorll gets hijacked here to scroll sideways, does not feel natural at all, very unintuitive | no scroll hijacking (relevant to #136 if a carousel is introduced) |
| [#342](../../../../data/sloplabel/shots/342_ctx.png) | this caption feels useless and repetitive with the info below it | caption repeats the info below it (same as #131) |
| [#346](../../../../data/sloplabel/shots/346_ctx.png) | these look like notification badges not numbers for items | step numbers look like notification badges (same as #239) |
| [#347](../../../../data/sloplabel/shots/347_ctx.png) | bad pulsing dot it is slop | pulsing dot (same as #40) |
| [#350](../../../../data/sloplabel/shots/350_ctx.png) | bad uppercase eyebrow with left hand thing | uppercase eyebrow with left-hand mark (same as #67) |
| [#351](../../../../data/sloplabel/shots/351_ctx.png) | gradient on hover is slop | gradient on hover (same as #262) |
| [#363](../../../../data/sloplabel/shots/363_ctx.png) | repetitive labeling - do we really need a subtitle tagline here? i dont think so | repetitive labelling in custom-estimates card (same as #264) |
| [#369](../../../../data/sloplabel/shots/369_ctx.png) | this label is random and not centered | random, uncentered label in custom-estimates card (same as #264) |
| [#371](../../../../data/sloplabel/shots/371_ctx.png) | lots of negative space | negative space in custom-estimates card (same as #264) |
| [#374](../../../../data/sloplabel/shots/374_ctx.png) | The LOGO of the site should not wrap, it should either get smaller or hide when the viewport gets too narrow. when it wraps the line spacing between lines is also really big | logo must not wrap in a narrow header (same as #51 #58) |
| [#378](../../../../data/sloplabel/shots/378_ctx.png) | do not wrap parts of the nav when the viewport gets too small, it looks super messy. hide parts of the nav and add an option to expand, or clip the sides maybe? | nav must not wrap; collapse instead (same as #51) |
| [#381](../../../../data/sloplabel/shots/381_ctx.png) | do not let phone number button wrap | phone button must not wrap (same as #58) |
| [#382](../../../../data/sloplabel/shots/382_ctx.png) | do not let the text here wrap, and if it really has to wrap, make sure the line height isnt so big | header CTA text must not wrap (same as #121) |

## S14 labels with no matching S13 pattern

| S14 # | Comment | Why not applied |
| --- | --- | --- |
| [#304](../../../../data/sloplabel/shots/304_ctx.png) | the chevron down button is really long at the bottom, somehow the text seems to be wrapping to a new line? obviously a mistake here, and its getting cut off by the moving row underneath it | S13's scroll cue is a separate round button that does not wrap or get cut off |
| [#306](../../../../data/sloplabel/shots/306_ctx.png) | as you scroll down the page, this hero area is getting covered by the section underneath | S13's hero is not covered by the next section on scroll (it fades its own content) |
| [#308](../../../../data/sloplabel/shots/308_ctx.png) | this scroll to explore text gets covered by the hero on scroll down, it overlaps and looks super bad | S13's scroll cue fades out before the next section arrives |
| [#344](../../../../data/sloplabel/shots/344_ctx.png) | (empty) | no comment text |
| [#345](../../../../data/sloplabel/shots/345_ctx.png) | the bottom of these cards are covered by the section below it | S13 service rows are not covered by the following section |
| [#349](../../../../data/sloplabel/shots/349_ctx.png) | (empty) | no comment text |
| [#352](../../../../data/sloplabel/shots/352_ctx.png) | overuse of icons | 'overuse of icons' has no specific S13 element; flagged as ambiguous, not applied globally |
| [#356](../../../../data/sloplabel/shots/356_ctx.png) | there is no map just points? its totally missing the map of connecticut | Same pattern in S13: the Connecticut outline and town dots never become visible (their `whileInView` reveal never fires, so they stay at opacity 0); only the labels show. Fix: make the outline and dots render. |
