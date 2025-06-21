const { ethers } = require("hardhat");
const { parseUnits } = require("ethers");

async function main() {
  const [deployer] = await ethers.getSigners();

  const SparkToken = await ethers.getContractFactory("SparkToken");
  const initialSupply = parseUnits("1000000", 18); 
  const sparkToken = await SparkToken.deploy(initialSupply);
  await sparkToken.waitForDeployment();

  const sparkTokenAddress = await sparkToken.getAddress();
  console.log("SparkToken deployed to:", sparkTokenAddress);

  const Profile = await ethers.getContractFactory("Profile");
  const profile = await Profile.deploy(sparkTokenAddress);
  await profile.waitForDeployment();

  const profileAddress = await profile.getAddress();
  console.log("Profile deployed to:", profileAddress);

  const rewardAmount = parseUnits("10000", 18); 
  const transferTx = await sparkToken.transfer(profileAddress, rewardAmount);
  await transferTx.wait();

  console.log("Transferred reward tokens to Profile contract");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
