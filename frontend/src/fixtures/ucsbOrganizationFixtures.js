const ucsbOrganizationFixtures = {
  oneUCSBOrganization: {
    id: 1,
    orgCode: "MTG",
    orgTranslationShort: "MTG@UCSB",
    orgTranslation: "Magic: The Gathering at UCSB",
    inactive: true,
  },

  threeUCSBOrganizations: [
    {
      id: 1,
      orgCode: "GG",
      orgTranslationShort: "Gaucho Gaming",
      orgTranslation: "UCSB Gaucho Gaming",
      inactive: false,
    },
    {
      id: 2,
      orgCode: "TTG",
      orgTranslationShort: "TTG@UCSB",
      orgTranslation: "UCSB Tabletop Gaming",
      inactive: false,
    },
    {
      id: 3,
      orgCode: "CIA",
      orgTranslationShort: "Central Intelligence Agency",
      orgTranslation: "Central Intelligence Agency",
      inactive: true,
    },
  ],
};

export { ucsbOrganizationFixtures };
