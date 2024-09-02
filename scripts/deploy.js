import { ethers } from "hardhat";

async function main() {
  const Profile = await ethers.getContractFactory("Profile");
  const profile = await Profile.deploy();
  await profile.waitForDeployment();

  console.log("Profile deployed to:", await profile.getAddress());

  const Post = await ethers.getContractFactory("Post");
  const post = await Post.deploy();
  await post.waitForDeployment();

  console.log("Post deployed to:", await post.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });