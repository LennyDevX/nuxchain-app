import { PinataSDK } from "pinata-web3";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pinataJwt = process.env.VITE_PINATA_JWT;
const pinataGateway = process.env.VITE_PINATA_GATEWAY || "gateway.pinata.cloud";

if (!pinataJwt) {
  console.error("❌ VITE_PINATA_JWT not found in .env file");
  process.exit(1);
}

const pinata = new PinataSDK({
  pinataJwt: pinataJwt,
  pinataGateway: pinataGateway,
});

async function uploadMetadata() {
  try {
    console.log("🚀 Starting metadata upload to Pinata...");

    // 1. Upload the image
    const imagePath = path.join(__dirname, "nux-logo.png");
    
    if (!fs.existsSync(imagePath)) {
      console.error(`❌ Logo file not found at ${imagePath}`);
      console.log("Please place your logo image as 'nux-logo.png' in the scripts/setup folder.");
      process.exit(1);
    }

    console.log("🖼️ Uploading logo image...");
    const imageFile = new File(
      [fs.readFileSync(imagePath)],
      "nux-logo.png",
      { type: "image/png" }
    );
    
    const imageUpload = await pinata.upload.file(imageFile);
    const imageUrl = `https://${pinataGateway}/ipfs/${imageUpload.IpfsHash}`;
    console.log(`✅ Logo uploaded successfully: ${imageUrl}`);

    // 2. Create the metadata JSON with new description
    const metadata = {
      name: "Nuxchain",
      symbol: "NUX",
      description: "Nuxchain is a cross-chain platform designed to bridge scalability, usability, and real-world utility. Inspired by leading blockchain protocols, it leverages Solana for high-performance, user-friendly adoption and Polygon for ecosystem depth and scalable infrastructure. The platform develops innovative DeFi services that enhance capital productivity while unlocking practical, real-world applications for NFTs. NUX powers this ecosystem as its native utility token — aligning incentives, enabling cross-chain rewards, and driving participation across staking, digital assets, and decentralized financial tools.",
      image: imageUrl,
      attributes: [
        {
          trait_type: "Ecosystem",
          value: "NuxChain"
        },
        {
          trait_type: "Type",
          value: "Utility Token"
        },
        {
          trait_type: "Chains",
          value: "Solana & Polygon"
        }
      ]
    };

    console.log("\n📄 Uploading new metadata JSON...");
    const jsonUpload = await pinata.upload.json(metadata);
    const jsonUrl = `https://${pinataGateway}/ipfs/${jsonUpload.IpfsHash}`;
    
    console.log(`\n✅ Metadata uploaded successfully!`);
    console.log(`📍 JSON URI: ${jsonUrl}`);

    // Save the URI to a file for reference
    fs.writeFileSync(
      path.join(__dirname, "nux-metadata-uri.txt"),
      jsonUrl
    );
    console.log(`\n💾 URI saved to: scripts/setup/nux-metadata-uri.txt`);
    
    console.log(`\n✨ Ready to use in deploy-nux-token.ts`);

  } catch (error) {
    console.error("❌ Error uploading to Pinata:", error);
  }
}

uploadMetadata();
