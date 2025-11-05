const helpRequestFixtures = {
  oneHelpRequest: {
    id: 1,
    requesterEmail: "hao_ding@ucsb.edu",
    teamId: "13",
    tableOrBreakoutRoom: "12",
    requestTime: "2005-06-16T23:55:39",
    explanation: "I need help with team01!!!",
    solved: true
  },
  threeHelpRequests: [
    {
      id: 2,
      requesterEmail: "hao_ding@ucsb.edu",
      teamId: "1",
      tableOrBreakoutRoom: "2",
      requestTime: "2013-06-16T23:55:39",
      explanation: "Mvn clean install is not working!!!",
      solved: true
    },
    {
      id: 3,
      requesterEmail: "zhangchi@ucsb.edu",
      teamId: "13",
      tableOrBreakoutRoom: "5",
      requestTime: "2005-06-14T23:55:39",
      explanation: "Help me please!!!",
      solved: false
    },
    {
      id: 4,
      requesterEmail: "zhz@ucsb.edu",
      teamId: "13",
      tableOrBreakoutRoom: "7",
      requestTime: "2023-06-15T23:55:39",
      explanation: "I have a question about the project!!!",
      solved: true
    },
  ],
};

export { helpRequestFixtures };
