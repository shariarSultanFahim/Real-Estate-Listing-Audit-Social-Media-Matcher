/**
 * Reset and Discrepancy Injection Script
 * Cleans the DB, seeds 15 listings from Listings.json with real direct property images,
 * and creates simulated Zillow snapshots to generate genuine price, address, description, photo order, and not-found discrepancies.
 */

import "dotenv/config";
import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { compareListingToSnapshot } from "../src/services/comparison.service";
import { createOrUpdate } from "../src/modules/discrepancies/discrepancies.service";

const prisma = new PrismaClient();

const OFFICES = [
  {
    id: "off-la-01",
    name: "Crescent Sotheby's — Louisiana",
    state: "LA" as const,
    address: "1400 Canal Street, New Orleans, LA 70112",
    phone: "(504) 555-0100",
    email: "la@cresentsothebys.com",
  },
  {
    id: "off-ms-01",
    name: "Crescent Sotheby's — Mississippi",
    state: "MS" as const,
    address: "2500 25th Avenue, Gulfport, MS 39501",
    phone: "(228) 555-0100",
    email: "ms@cresentsothebys.com",
  },
  {
    id: "off-al-01",
    name: "Crescent Sotheby's — Alabama",
    state: "AL" as const,
    address: "201 Government Street, Mobile, AL 36602",
    phone: "(251) 555-0100",
    email: "al@cresentsothebys.com",
  },
];

const AGENTS = [
  {
    id: "agent-liz-baer",
    name: "Liz Baer, J.D.",
    email: "liz.baer@cresentsothebys.com",
    phone: "(504) 555-0112",
    officeState: "LA" as const,
    serviceAreas: ["New Orleans", "French Quarter", "Downtown"],
    facebookPageUrl: "https://facebook.com/lizbaerrealestate",
    instagramPageUrl: "https://instagram.com/lizbaer_nola",
    crossPostPreference: "all" as const,
  },
  {
    id: "agent-ronnie-ranatza",
    name: "Ronnie Ranatza JR",
    email: "ronnie.ranatza@cresentsothebys.com",
    phone: "(985) 555-0147",
    officeState: "LA" as const,
    serviceAreas: ["Madisonville", "Covington", "Mandeville"],
    facebookPageUrl: "https://facebook.com/ronnieranatzajr",
    instagramPageUrl: "https://instagram.com/ronnie_ranatza",
    crossPostPreference: "all" as const,
  },
  {
    id: "agent-puddy-robinson",
    name: "Puddy Robinson",
    email: "puddy.robinson@cresentsothebys.com",
    phone: "(985) 555-0135",
    officeState: "LA" as const,
    serviceAreas: ["Covington", "Mandeville", "Northshore"],
    facebookPageUrl: "https://facebook.com/puddyrobinsonrealty",
    instagramPageUrl: "https://instagram.com/puddyrobinson_homes",
    crossPostPreference: "all" as const,
  },
  {
    id: "agent-katie-huguet",
    name: "Katie Huguet",
    email: "katie.huguet@cresentsothebys.com",
    phone: "(985) 555-0103",
    officeState: "LA" as const,
    serviceAreas: ["Hammond", "Ponchatoula"],
    facebookPageUrl: "https://facebook.com/katiehuguethomes",
    instagramPageUrl: "https://instagram.com/katiehuguet_realty",
    crossPostPreference: "all" as const,
  },
  {
    id: "agent-lesley-troncoso",
    name: "Lesley Troncoso",
    email: "lesley.troncoso@cresentsothebys.com",
    phone: "(228) 555-0171",
    officeState: "MS" as const,
    serviceAreas: ["Pass Christian", "Gulfport", "Bay St. Louis"],
    facebookPageUrl: "https://facebook.com/lesleytroncosorealty",
    instagramPageUrl: "https://instagram.com/lesley_coastal",
    crossPostPreference: "all" as const,
  },
  {
    id: "agent-sandy-davenport",
    name: "Sandy Davenport",
    email: "sandy.davenport@cresentsothebys.com",
    phone: "(251) 555-0122",
    officeState: "AL" as const,
    serviceAreas: ["Orange Beach", "Gulf Shores", "Foley"],
    facebookPageUrl: "https://facebook.com/sandydavenportrealestate",
    instagramPageUrl: "https://instagram.com/sandydavenport_coastal",
    crossPostPreference: "all" as const,
  },
  {
    id: "agent-amanda-mitternight",
    name: "Amanda Mitternight",
    email: "amanda.mitternight@cresentsothebys.com",
    phone: "(504) 555-0188",
    officeState: "LA" as const,
    serviceAreas: ["New Orleans", "Gentilly", "Lakeview"],
    facebookPageUrl: "https://facebook.com/amandamitternightrealty",
    instagramPageUrl: "https://instagram.com/amanda_nola_homes",
    crossPostPreference: "all" as const,
  },
  {
    id: "agent-rachel-ringen",
    name: "Rachel Ringen",
    email: "rachel.ringen@cresentsothebys.com",
    phone: "(504) 555-0199",
    officeState: "LA" as const,
    serviceAreas: ["Metairie", "Kenner", "Jefferson Parish"],
    facebookPageUrl: "https://facebook.com/rachelringenrealty",
    instagramPageUrl: "https://instagram.com/rachelringen_realestate",
    crossPostPreference: "all" as const,
  },
  {
    id: "agent-suzanne-lamore",
    name: "Suzanne Lamore",
    email: "suzanne.lamore@cresentsothebys.com",
    phone: "(504) 555-0166",
    officeState: "LA" as const,
    serviceAreas: ["Uptown New Orleans", "Garden District"],
    facebookPageUrl: "https://facebook.com/suzannelamorerealty",
    instagramPageUrl: "https://instagram.com/suzannelamore_nola",
    crossPostPreference: "all" as const,
  },
  {
    id: "agent-dawnne-keeney",
    name: "Dawnne Keeney",
    email: "dawnne.keeney@cresentsothebys.com",
    phone: "(504) 555-0144",
    officeState: "LA" as const,
    serviceAreas: ["French Quarter", "Marigny", "Bywater"],
    facebookPageUrl: "https://facebook.com/dawnnekeeneyrealty",
    instagramPageUrl: "https://instagram.com/dawnne_nola_estates",
    crossPostPreference: "all" as const,
  },
  {
    id: "agent-katie-martin",
    name: "Katie Martin",
    email: "katie.martin@cresentsothebys.com",
    phone: "(985) 555-0177",
    officeState: "LA" as const,
    serviceAreas: ["Covington", "Mandeville", "Abita Springs"],
    facebookPageUrl: "https://facebook.com/katiemartinrealty",
    instagramPageUrl: "https://instagram.com/katiemartin_luxury",
    crossPostPreference: "all" as const,
  },
];

const LISTINGS = [
  {
    mlsNumber: "2573656",
    street: "1201 Canal Street Unit 251",
    city: "New Orleans",
    state: "LA",
    zip: "70112",
    price: 259000,
    beds: 2,
    fullBaths: 1,
    halfBaths: 0,
    buildingAreaSqft: 1000,
    lotSizeAcres: 0.01,
    propertyType: "ResidentialCondominium",
    listingType: "Residential Sales",
    status: "active" as const,
    description: "Experience luxury downtown living at its best in this distinctive 2-bedroom, 1-bath condominium in the historic Krauss Building, formerly Krauss Department Store—one of New Orleans' leading department stores for more than 90 years before its conversion into luxury residences in 2009. The light-filled interior features soaring 16-foot ceilings, beautiful wood floors, granite countertops and striking architectural character. Recent improvements include a new washer and dryer and a new water heater.\nResidents enjoy exceptional amenities, including a rooftop saltwater pool with sweeping city views, fitness center, sauna, meeting rooms, 24-hour security, valet parking and a dedicated parking space. Centrally located on Canal Street at the edge of the French Quarter, this prized address is next to the iconic Saenger and Joy Theaters and just blocks from the medical corridor, including Tulane Medical Center, LSU Health Sciences Center and the VA Medical Center. Historic New Orleans character, modern amenities and an unbeatable downtown location!",
    agentEmail: "liz.baer@cresentsothebys.com",
    officeId: "off-la-01",
    mlsSource: "NOMAR MLS",
    photos: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  {
    mlsNumber: "2573263",
    street: "800 LA-1085",
    city: "Madisonville",
    state: "LA",
    zip: "70447",
    price: 150000,
    beds: 3,
    fullBaths: 2,
    halfBaths: 0,
    buildingAreaSqft: 1337,
    lotSizeAcres: 0.3,
    propertyType: "ResidentialMobile/Manufactured Home",
    listingType: "Residential Sales",
    status: "active" as const,
    description: "Calling all investors, renovators, and buyers looking for an opportunity in the Madisonville area! This 3 bedroom, 2 bath home sits on a spacious corner lot of just over 1/3 acre along the desirable Highway 1085 corridor. The property features a large fenced yard, mature trees, and a detached garage offering plenty of room for storage, a workshop, or your next project. The location is the real standout. Enjoy the space and flexibility of a larger homesite while remaining convenient to Madisonville, Covington, Mandeville, shopping, dining, recreation, and major Northshore thoroughfares. The area is also served by sought after Madisonville area public schools. The home offers plenty of potential for an investor, renovation project, rental property, or buyer ready to bring their own vision. With a great lot, useful outbuilding, convenient location, and room to add value, there is plenty of opportunity here. Bring your ideas and make it your own! Call today to schedule a private showing.",
    agentEmail: "ronnie.ranatza@cresentsothebys.com",
    officeId: "off-la-01",
    mlsSource: "NOMAR MLS",
    photos: [
      "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  {
    mlsNumber: "2565907",
    street: "74438 Holly Lane",
    city: "Covington",
    state: "LA",
    zip: "70435",
    price: 850000,
    beds: 3,
    fullBaths: 3,
    halfBaths: 0,
    buildingAreaSqft: 3243,
    lotSizeAcres: 2.44,
    propertyType: "ResidentialSingle Family Detached",
    listingType: "Residential Sales",
    status: "active" as const,
    description: "Nestled among mature oaks and pines on 2.4 private, wooded acres just 10 minutes from town, this exceptional custom-designed 3-bedroom home combines architectural character with everyday livability. The exterior showcases real stucco with striking gable rooflines and a durable standing seam metal roof, while 6\" exterior walls with blown-in insulation deliver energy efficiency you can feel. Multiple sets of French doors — framed in rich black trim — open onto the wooded lot, and a custom iron-railed balcony off the second floor adds old-world charm. Step inside to soaring high ceilings and an open-concept layout where the great room flows seamlessly into a chef's kitchen built for entertaining.",
    agentEmail: "puddy.robinson@cresentsothebys.com",
    officeId: "off-la-01",
    mlsSource: "NOMAR MLS",
    photos: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  {
    mlsNumber: "2573655",
    street: "13092 East Coles Creek Loop",
    city: "Hammond",
    state: "LA",
    zip: "70403",
    price: 360000,
    beds: 3,
    fullBaths: 2,
    halfBaths: 0,
    buildingAreaSqft: 1752,
    lotSizeAcres: 0.26,
    propertyType: "ResidentialSingle Family Detached",
    listingType: "Residential Sales",
    status: "active" as const,
    description: "This French Country inspired home has been exceptionally well maintained and thoughtfully updated, complete with a 420 sq ft detached guest suite. As you arrive, you will notice the beautifully maintained landscaping, well cared for yard and extra touches that make this property exceptional. An additional parking pad provides convenient parking for the detached guest suite, which has its own private entry.",
    agentEmail: "katie.huguet@cresentsothebys.com",
    officeId: "off-la-01",
    mlsSource: "NOMAR MLS",
    photos: [
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  {
    mlsNumber: "4159867",
    street: "132 Vista Drive",
    city: "Pass Christian",
    state: "MS",
    zip: "39571",
    price: 85000,
    beds: 0,
    fullBaths: 0,
    halfBaths: 0,
    buildingAreaSqft: 0,
    lotSizeAcres: 0.19,
    propertyType: "ResidentialResidential Lot",
    listingType: "Residential Sales",
    status: "active" as const,
    description: "Build your dream home and embrace the coastal lifestyle on this spacious, cleared lot in the Beach Vista community of Pass Christian. The homesite offers a wonderful blank canvas for creating a primary residence or relaxing weekend retreat on the Mississippi Gulf Coast. Enjoy access to the community pool included in your HOA fees, take a short stroll to the beach, or hop on your golf cart for a ride to Downtown Pass Christian, where you'll find local restaurants, shops, entertainment, and the harbor.",
    agentEmail: "lesley.troncoso@cresentsothebys.com",
    officeId: "off-ms-01",
    mlsSource: "MLS United",
    photos: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  {
    mlsNumber: "409364",
    street: "23008 Perdido Beach Blvd 606",
    city: "Orange Beach",
    state: "AL",
    zip: "36561",
    price: 1245000,
    beds: 2,
    fullBaths: 3,
    halfBaths: 0,
    buildingAreaSqft: 1549,
    lotSizeAcres: 0,
    propertyType: "ResidentialOther Residential",
    listingType: "Residential Sales",
    status: "active" as const,
    description: "Beautiful NEW beachfront condo. This fabulous condominium offers generous living space featuring a very spacious, open floor plan. Absolutely gorgeous views through the floor to ceiling glass windows and doors, and plenty of it in the extra-large living space. Fine, coastal design with fabulous upgrades including a built-in fireplace, Quartz countertops, counter-height bar, modern hood vent over stove, bar-front tile, upgraded paint throughout.",
    agentEmail: "sandy.davenport@cresentsothebys.com",
    officeId: "off-al-01",
    mlsSource: "Baldwin County Association of Realtors",
    photos: [
      "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  {
    mlsNumber: "2571857",
    street: "2441-43 Gladiolus Street",
    city: "New Orleans",
    state: "LA",
    zip: "70122",
    price: 364000,
    beds: 7,
    fullBaths: 3,
    halfBaths: 0,
    buildingAreaSqft: 2800,
    lotSizeAcres: 0,
    propertyType: "ResidentialDuplex",
    listingType: "Residential Sales",
    status: "active" as const,
    description: "Spacious Multifamily in Prime Gentilly Location! Located in a sought-after Gentilly neighborhood, this impressive two-story multifamily property offers 2,800 sq ft of living space and an excellent investment opportunity. The downstairs unit features 3 bedrooms and 1 bath, while the upstairs unit has 4 bedrooms and 2 bath – allowing maximum rental income. Currently generating $38,100 in annual rents, this property is a strong income producer.",
    agentEmail: "amanda.mitternight@cresentsothebys.com",
    officeId: "off-la-01",
    mlsSource: "NOMAR MLS",
    photos: [
      "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1556912173-3bb406ef7e77?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  {
    mlsNumber: "407058",
    street: "455 East Beach Boulevard Unit 1813",
    city: "Gulf Shores",
    state: "AL",
    zip: "36542",
    price: 715000,
    beds: 2,
    fullBaths: 2,
    halfBaths: 0,
    buildingAreaSqft: 1161,
    lotSizeAcres: 0,
    propertyType: "ResidentialCondominium",
    listingType: "Residential Sales",
    status: "active" as const,
    description: "Corner unit with wrap balcony! Rare and utterly unique, this 2-bedroom corner unit with a bunk room condominium at Lighthouse offers a Gulf-front experience unlike other two-bedroom units. Direct views of the Gulf and a west-facing wrap balcony that captures amazing sunsets. Soothing coastal interiors blend with calming decor and tasteful finishes throughout.",
    agentEmail: "sandy.davenport@cresentsothebys.com",
    officeId: "off-al-01",
    mlsSource: "Baldwin Realtors",
    photos: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1502005229762-ee1b2b8ab275?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  {
    mlsNumber: "4158391",
    street: "19505 Wallace Way",
    city: "Saucier",
    state: "MS",
    zip: "39574",
    price: 360000,
    beds: 3,
    fullBaths: 2,
    halfBaths: 0,
    buildingAreaSqft: 2011,
    lotSizeAcres: 1.5,
    propertyType: "ResidentialSingle Family Detached",
    listingType: "Residential Sales",
    status: "active" as const,
    description: "Peaceful country living on 1.5 acres in Saucier! This well-kept 3-bedroom, 2-bath home features an open floor plan with high ceilings, crown molding, and beautiful flooring throughout. The kitchen boasts custom cabinets, granite countertops, and stainless steel appliances.",
    agentEmail: "lesley.troncoso@cresentsothebys.com",
    officeId: "off-ms-01",
    mlsSource: "MLS United",
    photos: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  {
    mlsNumber: "2571279",
    street: "38043 Strawn Lane",
    city: "Ponchatoula",
    state: "LA",
    zip: "70454",
    price: 245000,
    beds: 3,
    fullBaths: 2,
    halfBaths: 0,
    buildingAreaSqft: 1450,
    lotSizeAcres: 0.22,
    propertyType: "ResidentialSingle Family Detached",
    listingType: "Residential Sales",
    status: "active" as const,
    description: "Charming cottage in a quiet Ponchatoula neighborhood! Beautiful open concept with custom kitchen finishes, large fenced backyard, and a covered back patio perfect for weekend crawfish boils and relaxing.",
    agentEmail: "katie.huguet@cresentsothebys.com",
    officeId: "off-la-01",
    mlsSource: "NOMAR MLS",
    photos: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  {
    mlsNumber: "2571943",
    street: "6009 Rosalie Court",
    city: "Metairie",
    state: "LA",
    zip: "70003",
    price: 290000,
    beds: 3,
    fullBaths: 2,
    halfBaths: 0,
    buildingAreaSqft: 1501,
    lotSizeAcres: 0.14,
    propertyType: "ResidentialSingle Family Detached",
    listingType: "Residential Sales",
    status: "active" as const,
    description: "Beautifully updated home in the heart of Metairie just two blocks from Lafreniere Park! This well-maintained property features an updated kitchen with granite countertops and stainless steel appliances, along with newer windows that enhance both efficiency and natural light. The fortified roof, only one year old, offers added durability and peace of mind.",
    agentEmail: "rachel.ringen@cresentsothebys.com",
    officeId: "off-la-01",
    mlsSource: "NOMAR MLS",
    photos: [
      "https://images.unsplash.com/photo-1598228723793-52759bba239c?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1556911073-38141963c9e0?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  {
    mlsNumber: "2569945",
    street: "729 Lyons Street #A",
    city: "New Orleans",
    state: "LA",
    zip: "70115",
    price: 2200,
    beds: 2,
    fullBaths: 2,
    halfBaths: 0,
    buildingAreaSqft: 792,
    lotSizeAcres: 0.03,
    propertyType: "ResidentialCondominium",
    listingType: "Rental",
    status: "active" as const,
    description: "One level, ground floor living just two short blocks to all Magazine Street has to offer, this 2 Bedroom 2 Bath condo on the first floor of a 3-plex is a hidden gem with an open kitchen/dining/living space, tasteful updates including marble kitchen countertops and stainless appliances, and a mudroom PLUS ample storage off the kitchen.",
    agentEmail: "suzanne.lamore@cresentsothebys.com",
    officeId: "off-la-01",
    mlsSource: "NOMAR MLS",
    photos: [
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  {
    mlsNumber: "2565319",
    street: "623 Kerlerec Street",
    city: "New Orleans",
    state: "LA",
    zip: "70116",
    price: 4250,
    beds: 2,
    fullBaths: 2,
    halfBaths: 1,
    buildingAreaSqft: 1380,
    lotSizeAcres: 0.13,
    propertyType: "ResidentialDuplex",
    listingType: "Rental",
    status: "active" as const,
    description: "Furnished half double available for 6-12 month terms! Completely restored Victorian Double in the heart of the vibrant Frenchmen Street scene. With a vibe as sultry as the New Orleans summer, this fully furnished unit features a soothing gray-blue-green color palate, two ensuite bedrooms (one on each floor) with full baths and full-size closets.",
    agentEmail: "dawnne.keeney@cresentsothebys.com",
    officeId: "off-la-01",
    mlsSource: "NOMAR MLS",
    photos: [
      "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  {
    mlsNumber: "2572211",
    street: "11 Tolawa Lane",
    city: "Covington",
    state: "LA",
    zip: "70433",
    price: 1750000,
    beds: 5,
    fullBaths: 3,
    halfBaths: 2,
    buildingAreaSqft: 4618,
    lotSizeAcres: 1.56,
    propertyType: "ResidentialSingle Family Attached",
    listingType: "Residential Sales",
    status: "active" as const,
    description: "Refined transitional European estate set on 1.56 acres just minutes from I-12 and the Causeway. Thoughtfully designed with timeless architecture and quiet luxury, this home welcomes you with a circular drive, porte-cochère, and multiple garage spaces, including a golf cart storage garage. Inside, warm hardwood floors and classic millwork frame a chef's kitchen featuring a 48\" range, double ovens, and built-in refrigerator/freezer columns.",
    agentEmail: "katie.martin@cresentsothebys.com",
    officeId: "off-la-01",
    mlsSource: "NOMAR MLS",
    photos: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  {
    mlsNumber: "2572776",
    street: "TBD Tolawa Lane",
    city: "Covington",
    state: "LA",
    zip: "70433",
    price: 175000,
    beds: 0,
    fullBaths: 0,
    halfBaths: 0,
    buildingAreaSqft: 0,
    lotSizeAcres: 1.62,
    propertyType: "ResidentialResidential Lot",
    listingType: "Residential Sales",
    status: "active" as const,
    description: "Tucked away on quiet Tolawa Lane, this future homesite offers a rare sense of privacy while keeping you close to everything Covington has to offer. Surrounded by a peaceful, tucked-away setting, it feels removed from the everyday hustle yet is conveniently located near Lakeview Hospital with easy access to I-12 and the Causeway.",
    agentEmail: "katie.martin@cresentsothebys.com",
    officeId: "off-la-01",
    mlsSource: "NOMAR MLS",
    photos: [
      "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1000&q=80",
    ],
  },
  {
    mlsNumber: "2568606",
    street: "41325 Crown Drive Extension",
    city: "Ponchatoula",
    state: "LA",
    zip: "70454",
    price: 349000,
    beds: 3,
    fullBaths: 2,
    halfBaths: 0,
    buildingAreaSqft: 1820,
    lotSizeAcres: 0.28,
    propertyType: "ResidentialSingle Family Detached",
    listingType: "Residential Sales",
    status: "active" as const,
    description: "Spacious family home on Crown Drive with high ceilings, formal dining area, master ensuite with soaking tub and double vanity, and a fenced backyard with plenty of space for a pool.",
    agentEmail: "katie.huguet@cresentsothebys.com",
    officeId: "off-la-01",
    mlsSource: "NOMAR MLS",
    photos: [
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=1000&q=80",
    ],
  },
];

type FakeSnapshot = null | {
  price?: number;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  description?: string;
  reorderPhotos?: boolean;
  missingPhotos?: boolean;
  extraPhoto?: boolean;
};

const ZILLOW_OVERRIDES: Record<string, FakeSnapshot> = {
  // 📸 PHOTO ORDER MISMATCH: Zillow promoted Living Room photo to primary slot
  "2573656": {
    price: 259000,
    street: "1201 Canal Street Unit 251",
    city: "New Orleans",
    state: "LA",
    zip: "70112",
    reorderPhotos: true,
  },

  // 💰 PRICE MISMATCH: Zillow shows $165,000 instead of $150,000
  "2573263": {
    price: 165000,
    street: "800 LA-1085",
    city: "Madisonville",
    state: "LA",
    zip: "70447",
  },

  // 💰 PRICE MISMATCH + 📸 PHOTO ORDER MISMATCH: Zillow reordered interior first
  "2565907": {
    price: 899000,
    street: "74438 Holly Lane",
    city: "Covington",
    state: "LA",
    zip: "70435",
    reorderPhotos: true,
  },

  // 🏠 ADDRESS TYPO: Zillow has wrong street number (1309 instead of 13092)
  "2573655": {
    price: 360000,
    street: "1309 East Coles Creek Loop",
    city: "Hammond",
    state: "LA",
    zip: "70403",
  },

  // ❌ NOT FOUND on Zillow
  "4159867": null,

  // 💰 PRICE MISMATCH + 📸 MISSING PHOTOS: Only 1 of 3 photos on Zillow
  "409364": {
    price: 1195000,
    street: "23008 Perdido Beach Blvd 606",
    city: "Orange Beach",
    state: "AL",
    zip: "36561",
    missingPhotos: true,
  },

  // 📝 DESCRIPTION MISMATCH: Zillow has different copy
  "2571857": {
    price: 364000,
    street: "2441-43 Gladiolus Street",
    city: "New Orleans",
    state: "LA",
    zip: "70122",
    description: "Multi-family investment property in New Orleans. 7 beds total across two units. Currently tenant occupied.",
  },

  // ✅ No discrepancy — exact match
  "407058": {
    price: 715000,
    street: "455 East Beach Boulevard Unit 1813",
    city: "Gulf Shores",
    state: "AL",
    zip: "36542",
  },

  // ❌ NOT FOUND on Zillow
  "4158391": null,

  // 💰 PRICE MISMATCH: Zillow shows $255,000 instead of $245,000
  "2571279": {
    price: 255000,
    street: "38043 Strawn Lane",
    city: "Ponchatoula",
    state: "LA",
    zip: "70454",
  },

  // ❌ NOT FOUND on Zillow
  "2571943": null,

  // 💰 PRICE MISMATCH (Rental): Zillow shows $2,400/mo instead of $2,200/mo
  "2569945": {
    price: 2400,
    street: "729 Lyons Street #A",
    city: "New Orleans",
    state: "LA",
    zip: "70115",
  },

  // 📝 DESCRIPTION MISMATCH + 📸 EXTRA PHOTO: Zillow has extra unverified photo
  "2565319": {
    price: 4250,
    street: "623 Kerlerec Street",
    city: "New Orleans",
    state: "LA",
    zip: "70116",
    description: "Furnished duplex unit near Frenchmen Street. 2BR/2.5BA. Available for rent. Contact agent for details.",
    extraPhoto: true,
  },

  // 💰 PRICE MISMATCH + 📸 PHOTO ORDER MISMATCH: Zillow shows $1,850,000 + reordered photos
  "2572211": {
    price: 1850000,
    street: "11 Tolawa Lane",
    city: "Covington",
    state: "LA",
    zip: "70433",
    reorderPhotos: true,
  },

  // ✅ No discrepancy — exact match
  "2572776": {
    price: 175000,
    street: "TBD Tolawa Lane",
    city: "Covington",
    state: "LA",
    zip: "70433",
  },

  // 💰 PRICE MISMATCH: Zillow shows $375,000 instead of $349,000
  "2568606": {
    price: 375000,
    street: "41325 Crown Drive Extension",
    city: "Ponchatoula",
    state: "LA",
    zip: "70454",
  },
};

const REALTOR_OVERRIDES: Record<string, FakeSnapshot> = {
  // 💰 PRICE MISMATCH: Realtor shows $265,000 instead of $259,000
  "2573656": {
    price: 265000,
    street: "1201 Canal Street Unit 251",
    city: "New Orleans",
    state: "LA",
    zip: "70112",
  },

  // 🏠 ADDRESS TYPO: Realtor shows 800 Louisiana 1085
  "2573263": {
    price: 150000,
    street: "800 Louisiana 1085",
    city: "Madisonville",
    state: "LA",
    zip: "70447",
  },

  // 📸 PHOTO ORDER MISMATCH: Realtor placed photo 3 first
  "2565907": {
    price: 850000,
    street: "74438 Holly Lane",
    city: "Covington",
    state: "LA",
    zip: "70435",
    reorderPhotos: true,
  },

  // 💰 PRICE MISMATCH: Realtor shows $369,000 instead of $360,000
  "2573655": {
    price: 369000,
    street: "13092 East Coles Creek Loop",
    city: "Hammond",
    state: "LA",
    zip: "70403",
  },

  // ❌ NOT FOUND on Realtor
  "4159867": null,

  // 💰 PRICE MISMATCH + 📸 MISSING PHOTOS: $1,295,000 & 1 photo
  "409364": {
    price: 1295000,
    street: "23008 Perdido Beach Blvd 606",
    city: "Orange Beach",
    state: "AL",
    zip: "36561",
    missingPhotos: true,
  },

  // 💰 PRICE MISMATCH + 🏠 ADDRESS TYPO: $370,000 & 2441 Gladiolus St
  "2571857": {
    price: 370000,
    street: "2441 Gladiolus St",
    city: "New Orleans",
    state: "LA",
    zip: "70122",
  },

  // ✅ No discrepancy on Realtor — exact match
  "407058": {
    price: 715000,
    street: "455 East Beach Boulevard Unit 1813",
    city: "Gulf Shores",
    state: "AL",
    zip: "36542",
  },

  // ❌ NOT FOUND on Realtor
  "4158391": null,

  // 📸 PHOTO ORDER MISMATCH: Realtor reordered photos
  "2571279": {
    price: 245000,
    street: "38043 Strawn Lane",
    city: "Ponchatoula",
    state: "LA",
    zip: "70454",
    reorderPhotos: true,
  },

  // ❌ NOT FOUND on Realtor
  "2571943": null,

  // 💰 PRICE MISMATCH (Rental): Realtor shows $2,350/mo instead of $2,200/mo
  "2569945": {
    price: 2350,
    street: "729 Lyons Street #A",
    city: "New Orleans",
    state: "LA",
    zip: "70115",
  },

  // 📝 DESCRIPTION MISMATCH: Realtor has different description
  "2565319": {
    price: 4250,
    street: "623 Kerlerec Street",
    city: "New Orleans",
    state: "LA",
    zip: "70116",
    description: "Victorian double near Frenchmen Street scene. 2 suites with full baths.",
  },

  // 💰 PRICE MISMATCH: Realtor shows $1,795,000 instead of $1,750,000
  "2572211": {
    price: 1795000,
    street: "11 Tolawa Lane",
    city: "Covington",
    state: "LA",
    zip: "70433",
  },

  // ✅ No discrepancy on Realtor — exact match
  "2572776": {
    price: 175000,
    street: "TBD Tolawa Lane",
    city: "Covington",
    state: "LA",
    zip: "70433",
  },

  // 📝 DESCRIPTION MISMATCH: Realtor has different copy
  "2568606": {
    price: 349000,
    street: "41325 Crown Drive Extension",
    city: "Ponchatoula",
    state: "LA",
    zip: "70454",
    description: "Spacious rural estate with workshop and storage. Contact agent for details.",
  },
};

async function main() {
  console.log("\n🗑️  Step 1: Wiping database...");
  await prisma.approvedPhotoArrangement.deleteMany();
  await prisma.discrepancyNote.deleteMany();
  await prisma.discrepancyHistory.deleteMany();
  await prisma.discrepancy.deleteMany();
  await prisma.siteSnapshotHistory.deleteMany();
  await prisma.siteSnapshot.deleteMany();
  await prisma.externalListing.deleteMany();
  await prisma.auditRun.deleteMany();
  await prisma.listingPhoto.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.agent.deleteMany();
  await prisma.listingOffice.deleteMany();
  await prisma.user.deleteMany();
  console.log("   ✓ All tables cleared.\n");

  console.log("🌱 Step 2: Seeding admin, offices, agents...");
  const passwordHash = await bcrypt.hash("CrescentDemo2026!", 12);
  await prisma.user.create({
    data: {
      id: "usr-admin-001",
      name: "Super Admin",
      email: "admin@cresentsothebys.com",
      passwordHash,
      accountType: "superAdmin",
      permissions: [
        "listings:create", "listings:edit", "listings:delete",
        "discrepancies:resolve",
        "agents:create", "agents:edit", "agents:delete",
        "socialMatcher:use",
        "users:create", "users:edit",
      ],
    },
  });
  for (const o of OFFICES) {
    await prisma.listingOffice.create({ data: o });
  }
  for (const a of AGENTS) {
    await prisma.agent.create({ data: a });
  }
  console.log(`   ✓ 1 admin, ${OFFICES.length} offices, ${AGENTS.length} agents ready.\n`);

  console.log("🏠 Step 3: Seeding 15 Source of Truth listings with high quality photos...");
  const listingIdMap: Record<string, string> = {};
  for (const item of LISTINGS) {
    const agent = await prisma.agent.findUnique({ where: { email: item.agentEmail } });
    if (!agent) {
      console.warn(`   ⚠ Agent not found: ${item.agentEmail} — skipping ${item.mlsNumber}`);
      continue;
    }
    const listing = await prisma.listing.create({
      data: {
        mlsNumber: item.mlsNumber,
        street: item.street,
        city: item.city,
        state: item.state,
        zip: item.zip,
        price: new Prisma.Decimal(item.price),
        beds: item.beds,
        fullBaths: item.fullBaths,
        halfBaths: item.halfBaths,
        buildingAreaSqft: new Prisma.Decimal(item.buildingAreaSqft),
        lotSizeAcres: new Prisma.Decimal(item.lotSizeAcres),
        propertyType: item.propertyType,
        propertyStyle: "Traditional",
        listingType: item.listingType,
        status: item.status,
        description: item.description,
        legalDescription: "Official recorded parcel & legal plat on file",
        mlsSource: item.mlsSource,
        listDate: new Date(),
        expirationDate: new Date(Date.now() + 180 * 86400000),
        listingAgentId: agent.id,
        listingOfficeId: item.officeId,
        photos: {
          create: item.photos.map((url, idx) => ({
            url,
            position: idx + 1,
            source: "client",
          })),
        },
      },
    });
    listingIdMap[item.mlsNumber] = listing.id;
    console.log(`   ✓ ${item.mlsNumber} — ${item.street}, ${item.city} (${item.photos.length} photos)`);
  }

  console.log(`\n🔍 Step 4: Creating audit run record...`);
  const auditRun = await prisma.auditRun.create({
    data: {
      triggeredBy: "reset-script",
      platform: null,
      status: "running",
      startedAt: new Date(),
    },
  });

  const PLATFORMS_TO_INJECT = [
    { site: "zillow" as const, overrides: ZILLOW_OVERRIDES, label: "Zillow", domain: "zillow.com" },
    { site: "realtor" as const, overrides: REALTOR_OVERRIDES, label: "Realtor.com", domain: "realtor.com" },
  ];

  let totalDiscrepancies = 0;
  let totalMatched = 0;
  let totalNotFound = 0;

  for (const portal of PLATFORMS_TO_INJECT) {
    console.log(`\n🕵️  Step 5: Injecting ${portal.label} snapshots & calculating discrepancies...\n`);

    for (const item of LISTINGS) {
      const listingId = listingIdMap[item.mlsNumber];
      if (!listingId) continue;

      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
        include: { photos: true, listingAgent: true },
      });
      if (!listing) continue;

      const override = portal.overrides[item.mlsNumber];

      // Build snapshot photo list (support reordering, missing, and extra photos for testing)
      let snapshotPhotos: { url: string; order: number }[] = [];
      if (override && item.photos.length > 0) {
        if (override.reorderPhotos && item.photos.length >= 2) {
          snapshotPhotos = [
            { url: item.photos[1], order: 1 },
            { url: item.photos[0], order: 2 },
            ...item.photos.slice(2).map((url, idx) => ({ url, order: idx + 3 })),
          ];
        } else if (override.missingPhotos) {
          snapshotPhotos = [{ url: item.photos[0], order: 1 }];
        } else if (override.extraPhoto) {
          snapshotPhotos = [
            ...item.photos.map((url, idx) => ({ url, order: idx + 1 })),
            { url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80", order: item.photos.length + 1 },
          ];
        } else {
          snapshotPhotos = item.photos.map((url, idx) => ({ url, order: idx + 1 }));
        }
      }

      const snapshotData = override
        ? {
            listingId,
            site: portal.site,
            price: new Prisma.Decimal(override.price ?? item.price),
            street: override.street ?? item.street,
            city: override.city ?? item.city,
            state: override.state ?? item.state,
            zip: override.zip ?? item.zip,
            description: override.description ?? item.description,
            sourceUrl: `https://${portal.domain}/homes/${item.mlsNumber}`,
            fetchedAt: new Date(),
            photos: snapshotPhotos,
          }
        : null;

      let snapshot = null;
      if (snapshotData) {
        snapshot = await prisma.siteSnapshot.upsert({
          where: { listingId_site: { listingId, site: portal.site } },
          update: snapshotData,
          create: snapshotData,
        });

        await prisma.siteSnapshotHistory.create({
          data: {
            listingId,
            site: portal.site,
            auditRunId: auditRun.id,
            price: snapshotData.price,
            street: snapshotData.street,
            city: snapshotData.city,
            state: snapshotData.state,
            zip: snapshotData.zip,
            description: snapshotData.description,
            photos: snapshotPhotos,
            sourceUrl: snapshotData.sourceUrl,
          },
        });
        totalMatched++;
      } else {
        totalNotFound++;
      }

      // Run comparison
      const diffs = await compareListingToSnapshot({
        listing,
        snapshot,
        site: portal.site,
      });

      if (diffs.length === 0) {
        console.log(`   ✅ [${portal.label}] ${item.mlsNumber} — ${item.street.substring(0, 30)} — Synced (No Discrepancies)`);
      } else {
        console.log(`   ⚠️  [${portal.label}] ${item.mlsNumber} — ${item.street.substring(0, 30)} — ${diffs.length} discrepancy(s):`);
        for (const d of diffs) {
          console.log(`       • [${d.field}] MLS: "${d.sourceValue}" vs ${portal.label}: "${d.siteValue}"`);
        }
      }

      for (const diff of diffs) {
        await createOrUpdate({
          listingId,
          site: portal.site,
          field: diff.field,
          sourceValue: diff.sourceValue,
          siteValue: diff.siteValue,
          note: diff.note,
        });
        totalDiscrepancies++;
      }
    }
  }

  await prisma.auditRun.update({
    where: { id: auditRun.id },
    data: {
      status: "completed",
      completedAt: new Date(),
      listingsProcessed: LISTINGS.length * PLATFORMS_TO_INJECT.length,
      listingsMatched: totalMatched,
      listingsUnmatched: totalNotFound,
      discrepanciesFound: totalDiscrepancies,
    },
  });

  console.log(`\n🎉 Reset complete!`);
  console.log(`   • Listings seeded: ${LISTINGS.length}`);
  console.log(`   • Snapshots generated across platforms: ${totalMatched}`);
  console.log(`   • Unmatched/Missing across platforms: ${totalNotFound}`);
  console.log(`   • Total Discrepancies injected (Zillow + Realtor): ${totalDiscrepancies}\n`);
}

main()
  .catch((e) => {
    console.error("❌ Reset script error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
