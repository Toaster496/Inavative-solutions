const hre = require("hardhat");

async function main() {
  console.log("Deploying ComputeCoin and ComputeMarketplace to BSC Testnet...");

  // Deploy ComputeCoin token
  const ComputeCoin = await hre.ethers.getContractFactory("ComputeCoin");
  const computeCoin = await ComputeCoin.deploy();
  await computeCoin.waitForDeployment();
  
  const coinAddress = await computeCoin.getAddress();
  console.log("ComputeCoin deployed to:", coinAddress);

  // Deploy ComputeMarketplace
  const ComputeMarketplace = await hre.ethers.getContractFactory("ComputeMarketplace");
  const marketplace = await ComputeMarketplace.deploy(coinAddress);
  await marketplace.waitForDeployment();
  
  const marketplaceAddress = await marketplace.getAddress();
  console.log("ComputeMarketplace deployed to:", marketplaceAddress);

  // Verify contracts on BSCScan
  console.log("Waiting for block confirmations...");
  await new Promise(resolve => setTimeout(resolve, 30000));

  try {
    await hre.run("verify:verify", {
      address: coinAddress,
      constructorArguments: []
    });
    console.log("ComputeCoin verified on BSCScan");
  } catch (e) {
    console.log("ComputeCoin verification skipped:", e.message);
  }

  try {
    await hre.run("verify:verify", {
      address: marketplaceAddress,
      constructorArguments: [coinAddress]
    });
    console.log("ComputeMarketplace verified on BSCScan");
  } catch (e) {
    console.log("ComputeMarketplace verification skipped:", e.message);
  }

  console.log("\n=== Deployment Summary ===");
  console.log("ComputeCoin (CPT):", coinAddress);
  console.log("ComputeMarketplace:", marketplaceAddress);
  console.log("\nRemember to set these addresses in your web and desktop clients!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
