 const costTiers = [
    { timeRange: "0-30 seconds", cost: 50, description: "Quick reset" },
    { timeRange: "30s - 2 minutes", cost: 60, description: "Short session" },
    { timeRange: "2 - 5 minutes", cost: 70, description: "Medium session" },
    { timeRange: "5 - 10 minutes", cost: 85, description: "Long session" },
    {
      timeRange: "10 - 20 minutes",
      cost: 100,
      description: "Extended session",
    },
    { timeRange: "20+ minutes", cost: 120, description: "Very long session" },
  ];
  export default costTiers