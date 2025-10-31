const recommendationRequestFixtures = {
  oneRequest: {
    "id": 1,
      "requesteremail": "cgaucho@ucsb.edu\t",
      "professoremail": "phtcon@ucsb.edu\t",
      "explanation": "BS/MS program\t",
      "daterequested": "2022-04-20T00:00:00",
      "dateneeded": "2022-05-01T23:59:59",
      "done": false
  },
  threeRequests: [
    {
      "id": 1,
      "requesteremail": "cgaucho@ucsb.edu\t",
      "professoremail": "phtcon@ucsb.edu\t",
      "explanation": "BS/MS program\t",
      "daterequested": "2022-04-20T00:00:00",
      "dateneeded": "2022-05-01T23:59:59",
      "done": false
    },
    {
      "id": 2,
      "requesteremail": "ldelplaya@ucsb.edu",
      "professoremail": "richert@ucsb.edu",
      "explanation": "PhD CS Stanford",
      "daterequested": "2022-05-20T00:00:00",
      "dateneeded": "2022-11-15T23:59:59",
      "done": false
    },
    {
      "id": 4,
      "requesteremail": "ldelplaya@ucsb.edu",
      "professoremail": "phtcon@ucsb.edu",
      "explanation": "PhD CS Stanford",
      "daterequested": "2022-05-20T00:00:00",
      "dateneeded": "2022-11-15T23:59:59",
      "done": false
    }
  ],
};

export { recommendationRequestFixtures };
