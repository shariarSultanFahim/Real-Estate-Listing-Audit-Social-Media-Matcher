import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const SEEDED_OFFICES = [
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

export const REAL_ESTATE_AGENTS = [
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
    phone: "(251) 555-0161",
    officeState: "AL" as const,
    serviceAreas: ["Orange Beach", "Gulf Shores", "Foley"],
    facebookPageUrl: "https://facebook.com/sandydavenportcoastal",
    instagramPageUrl: "https://instagram.com/sandydavenport_beach",
    crossPostPreference: "all" as const,
  },
  {
    id: "agent-amanda-mitternight",
    name: "Amanda Mitternight",
    email: "amanda.mitternight@cresentsothebys.com",
    phone: "(504) 555-0122",
    officeState: "LA" as const,
    serviceAreas: ["New Orleans", "Metairie", "Gentilly"],
    facebookPageUrl: "https://facebook.com/amandamitternightrealty",
    instagramPageUrl: "https://instagram.com/amanda_mitternight",
    crossPostPreference: "all" as const,
  },
  {
    id: "agent-erica-adams",
    name: "Erica Adams",
    email: "erica.adams@cresentsothebys.com",
    phone: "(504) 555-0123",
    officeState: "LA" as const,
    serviceAreas: ["New Orleans", "Gentilly"],
    facebookPageUrl: "https://facebook.com/ericaadamsrealty",
    instagramPageUrl: "https://instagram.com/ericaadams_nola",
    crossPostPreference: "all" as const,
  },
  {
    id: "agent-holly-gibbs",
    name: "Holly Gibbs",
    email: "holly.gibbs@cresentsothebys.com",
    phone: "(228) 555-0174",
    officeState: "MS" as const,
    serviceAreas: ["Saucier", "Gulfport", "Biloxi"],
    facebookPageUrl: "https://facebook.com/hollygibbsrealty",
    instagramPageUrl: "https://instagram.com/hollygibbs_homes",
    crossPostPreference: "all" as const,
  },
  {
    id: "agent-rachel-ringen",
    name: "Rachel Ringen",
    email: "rachel.ringen@cresentsothebys.com",
    phone: "(504) 555-0103",
    officeState: "LA" as const,
    serviceAreas: ["Metairie", "Kenner", "New Orleans"],
    facebookPageUrl: "https://facebook.com/rachelringenrealty",
    instagramPageUrl: "https://instagram.com/rachel_ringen",
    crossPostPreference: "all" as const,
  },
  {
    id: "agent-suzanne-lamore",
    name: "Suzanne Lamore",
    email: "suzanne.lamore@cresentsothebys.com",
    phone: "(504) 555-0115",
    officeState: "LA" as const,
    serviceAreas: ["New Orleans", "Uptown"],
    facebookPageUrl: "https://facebook.com/suzannelamorerealty",
    instagramPageUrl: "https://instagram.com/suzanne_lamore",
    crossPostPreference: "all" as const,
  },
  {
    id: "agent-ninh-tran",
    name: "Ninh N. Tran",
    email: "ninh.tran@cresentsothebys.com",
    phone: "(504) 555-0116",
    officeState: "LA" as const,
    serviceAreas: ["New Orleans", "Uptown"],
    facebookPageUrl: "https://facebook.com/ninhtranrealty",
    instagramPageUrl: "https://instagram.com/ninh_tran_nola",
    crossPostPreference: "all" as const,
  },
  {
    id: "agent-dawnne-keeney",
    name: "Dawnne Keeney",
    email: "dawnne.keeney@cresentsothebys.com",
    phone: "(504) 555-0116",
    officeState: "LA" as const,
    serviceAreas: ["New Orleans", "French Quarter", "Marigny"],
    facebookPageUrl: "https://facebook.com/dawnnekeeneyrealty",
    instagramPageUrl: "https://instagram.com/dawnne_keeney",
    crossPostPreference: "all" as const,
  },
  {
    id: "agent-katie-martin",
    name: "Katie Martin",
    email: "katie.martin@cresentsothebys.com",
    phone: "(985) 555-0133",
    officeState: "LA" as const,
    serviceAreas: ["Covington", "Mandeville", "Madisonville"],
    facebookPageUrl: "https://facebook.com/katiemartinrealty",
    instagramPageUrl: "https://instagram.com/katiemartin_homes",
    crossPostPreference: "all" as const,
  },
  {
    id: "agent-tuesday-edwards",
    name: "Tuesday Edwards",
    email: "tuesday.edwards@cresentsothebys.com",
    phone: "(985) 555-0154",
    officeState: "LA" as const,
    serviceAreas: ["Ponchatoula", "Hammond"],
    facebookPageUrl: "https://facebook.com/tuesdayedwardsrealty",
    instagramPageUrl: "https://instagram.com/tuesday_edwards",
    crossPostPreference: "all" as const,
  },
  {
    id: "agent-kim-prokop",
    name: "Kim Prokop",
    email: "kim.prokop@cresentsothebys.com",
    phone: "(985) 555-0155",
    officeState: "LA" as const,
    serviceAreas: ["Ponchatoula", "Hammond"],
    facebookPageUrl: "https://facebook.com/kimprokoprealty",
    instagramPageUrl: "https://instagram.com/kim_prokop",
    crossPostPreference: "all" as const,
  },
];

async function seedAgentsAndOffices() {
  console.log("🌱 Seeding Offices...");
  for (const office of SEEDED_OFFICES) {
    await prisma.listingOffice.upsert({
      where: { id: office.id },
      update: office,
      create: office,
    });
  }
  console.log(`  ✓ ${SEEDED_OFFICES.length} offices ready.`);

  console.log("🌱 Seeding Real Estate Agents from listing dataset...");
  for (const agent of REAL_ESTATE_AGENTS) {
    await prisma.agent.upsert({
      where: { email: agent.email },
      update: agent,
      create: agent,
    });
  }
  console.log(`  ✓ ${REAL_ESTATE_AGENTS.length} agents seeded successfully!`);
}

seedAgentsAndOffices()
  .catch((e) => {
    console.error("Error seeding agents:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
