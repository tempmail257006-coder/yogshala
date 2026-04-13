import { YOGSHALALevel } from "./types";

export type AsanaClassificationLevel = {
  id: YOGSHALALevel["id"];
  title: string;
  description: string;
  poseIds: string[];
};

export const ASANA_CLASSIFICATION: AsanaClassificationLevel[] = [
  {
    id: "beginner",
    title: "Beginner Level Asanas",
    description: "These poses are suitable for beginners and help build basic flexibility, posture, and breathing control.",
    poseIds: ["tadasana", "padmasana", "savasana", "mukonasanam", "parvatasana"],
  },
  {
    id: "intermediate",
    title: "Intermediate Level Asanas",
    description: "These poses require moderate flexibility and body control. They strengthen muscles and improve spinal mobility.",
    poseIds: ["ardha_matsyendrasana", "dhanurasana", "matsyasana", "paschimottanasana", "salabhasana"],
  },
  {
    id: "advanced",
    title: "Advanced Level Asanas",
    description: "These poses require strong balance, flexibility, and experience in YOGSHALA practice.",
    poseIds: ["sarvangasana", "ustrasana", "veerabadhrasana", "yerasanam", "mulagal_thalai_asanam"],
  },
];
