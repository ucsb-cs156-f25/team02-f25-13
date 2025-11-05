const recommendationRequestFixtures = {
  oneRecommendationRequest: {
    id: 1,
      requesteremail: "cgaucho@ucsb.edu",
      professoremail: "phtcon@ucsb.edu",
      explanation: "BS/MS program",
      daterequested: "2022-04-20T00:00:00",
      dateneeded: "2022-05-01T23:59:59",
      done: false
  },
  threeRecommendationRequests: [
    {
      id: 1,
      requesteremail: "cgaucho@ucsb.edu",
      professoremail: "phtcon@ucsb.edu",
      explanation: "BS/MS program",
      daterequested: "2022-04-20T00:00:00",
      dateneeded: "2022-05-01T23:59:59",
      done: false
    },
    {
      id: 2,
      requesteremail: "ldelplaya@ucsb.edu",
      professoremail: "richert@ucsb.edu",
      explanation: "PhD CS Stanford",
      daterequested: "2022-05-20T00:00:00",
      dateneeded: "2022-11-15T23:59:59",
      done: false
    },
    {
      id: 4,
      requesteremail: "ldelplaya@ucsb.edu",
      professoremail: "phtcon@ucsb.edu",
      explanation: "PhD CS Stanford",
      daterequested: "2022-05-20T00:00:00",
      dateneeded: "2022-11-15T23:59:59",
      done: false
    }
  ],
};

export { recommendationRequestFixtures };
