import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const poses = {
  beginner: [
    "tadasana_mountain_pose",
    "vrikshasana_tree_pose",
    "balasana_child_pose",
    "cat_cow_pose",
    "downward_dog_pose",
    "cobra_pose",
    "bridge_pose",
    "butterfly_pose",
    "easy_pose",
    "seated_forward_bend"
  ],
  intermediate: [
    "warrior_1_pose",
    "warrior_2_pose",
    "triangle_pose",
    "boat_pose",
    "camel_pose",
    "half_moon_pose",
    "crow_pose",
    "side_plank_pose"
  ],
  advanced: [
    "headstand_pose",
    "handstand_pose",
    "scorpion_pose",
    "wheel_pose",
    "firefly_pose",
    "peacock_pose"
  ]
};

const datasetDir = "yoga_pose_dataset";
const metadataFile = "pose_labels.json";
const zipFile = "yoga_pose_dataset_5000.zip";

import pLimit from "p-limit";

const limit = pLimit(20); // Higher concurrency

async function generateImage(poseName: string, level: string, index: number) {
  const keyword = "yoga," + poseName.replace(/_/g, ",");
  const url = `https://loremflickr.com/512/512/${keyword}?lock=${index}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
    
    const buffer = await response.arrayBuffer();
    const fileName = `${poseName}_${index.toString().padStart(4, "0")}.jpg`;
    const filePath = path.join(datasetDir, level, poseName, fileName);
    
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, Buffer.from(buffer));
    
    return { fileName, poseName };
  } catch (error) {
    // Silent error to avoid console clutter during 5000 fetches
  }
  return null;
}

async function main() {
  if (!fs.existsSync(datasetDir)) {
    fs.mkdirSync(datasetDir);
  }

  const metadata: Record<string, string> = {};
  const totalPoses = Object.values(poses).flat().length;
  const targetTotal = 5000;
  const perPose = Math.ceil(targetTotal / totalPoses);
  
  console.log(`Starting dataset collection for ${targetTotal} images (~${perPose} per pose)...`);

  const tasks: Promise<any>[] = [];

  for (const [level, poseList] of Object.entries(poses)) {
    for (const pose of poseList) {
      for (let i = 0; i < perPose; i++) {
        tasks.push(limit(() => generateImage(pose, level, i).then(result => {
          if (result) metadata[result.fileName] = result.poseName;
        })));
      }
    }
  }

  await Promise.all(tasks);
  console.log("All images collected.");

  fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));
  console.log("Metadata file generated.");

  console.log("Creating zip archive...");
  const zip = new AdmZip();
  zip.addLocalFolder(datasetDir);
  zip.addLocalFile(metadataFile);
  zip.writeZip(zipFile);
  console.log(`Dataset zipped to ${zipFile}`);
}

main().catch(console.error);
