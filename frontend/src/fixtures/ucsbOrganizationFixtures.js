const ucsbOrganizationFixtures = {
  oneUCSBOrganization: {
    orgCode: "MTG",
    orgTranslationShort: "MTG@UCSB",
    orgTranslation: "Magic: The Gathering at UCSB",
    inactive: true,
  },

  threeUCSBOrganizations: [
    {
      orgCode: "GG",
      orgTranslationShort: "Gaucho Gaming",
      orgTranslation: "UCSB Gaucho Gaming",
      inactive: false,
    },
    {
      orgCode: "TTG",
      orgTranslationShort: "TTG@UCSB",
      orgTranslation: "UCSB Tabletop Gaming",
      inactive: false,
    },
    {
      orgCode: "CIA",
      orgTranslationShort: "Central Intelligence Agency",
      orgTranslation: "Central Intelligence Agency",
      inactive: true,
    },
  ],
};

export { ucsbOrganizationFixtures };
