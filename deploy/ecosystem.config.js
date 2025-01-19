module.exports = {
  apps: [
    {
      name: "deploy",
      script: "./dist/index.js",
      instances: "max", 
      exec_mode: "cluster", // Enable cluster mode for load balancing  
    },
  ],
};
