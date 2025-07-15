const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const LazyMintNFT = await hre.ethers.getContractFactory("LazyMintNFT");
  const contract = await LazyMintNFT.deploy(deployer.address);
  await contract.waitForDeployment();

  console.log("LazyMintNFT deployed to:", contract.target);
  console.log("Signer address:", deployer.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 