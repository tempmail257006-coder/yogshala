import { YOGSHALALevel } from "./types";

export const YOGSHALA_LEVELS: YOGSHALALevel[] = [
  {
    id: "beginner",
    level: 1,
    title: "Beginner Level",
    shortDescription: "Build a strong foundation with mindful alignment and breath-led movement.",
    description:
      "Designed for people new to YOGSHALA. Focus on basic poses, correct alignment, and connecting breathing with movement.",
    difficulty: "Beginner",
    styles: [
      {
        id: "hatha",
        name: "Hatha Basics",
        description: "Slow-paced foundations focused on alignment, breath control, and posture awareness.",
      },
      {
        id: "restorative",
        name: "Restorative Reset",
        description: "Gentle poses with longer holds to release tension and calm the nervous system.",
      },
      {
        id: "vinyasa",
        name: "Vinyasa Flow",
        description: "Beginner-friendly movement flow linking breath with smooth transitions.",
      },
      {
        id: "iyengar",
        name: "Iyengar Alignment",
        description: "Precision-focused practice emphasizing stability, posture, and mindful form.",
      },
    ],
    poseIds: [
      "tadasana",
      "padmasana",
      "savasana",
      "mukonasanam",
      "parvatasana",
    ],
    focusAreas: ["Alignment", "Breath Awareness", "Mobility", "Body Balance"],
    galleryImages: [
      "/images/Thadasana.jpg",
      "/images/Padmasana.jpg",
      "/images/Savasanam.jpg",
      "/images/Mukonasanam.jpg",
      "/images/Paruvadhasanam.jpg",
    ],
  },
  {
    id: "intermediate",
    level: 2,
    title: "Intermediate Level",
    shortDescription: "Build strength, stamina, and deeper flexibility with dynamic flows.",
    description:
      "For users who already understand basic YOGSHALA and want to build strength, stamina, and deeper flexibility.",
    difficulty: "Intermediate",
    styles: [
      {
        id: "power_flow",
        name: "Power Flow",
        description: "Dynamic flows to build stamina, strength, and endurance with control.",
      },
      {
        id: "balance_core",
        name: "Balance and Core",
        description: "Postures that improve one-leg stability, core activation, and posture control.",
      },
      {
        id: "backbend_openers",
        name: "Backbend Openers",
        description: "Heart-opening sequences to improve thoracic mobility and spinal extension.",
      },
    ],
    poseIds: [
      "ardha_matsyendrasana",
      "dhanurasana",
      "matsyasana",
      "paschimottanasana",
      "salabhasana",
    ],
    focusAreas: ["Strength", "Stability", "Endurance", "Core Control"],
    galleryImages: [
      "/images/Arthamatseyandrasana.jpg",
      "/images/Dhanurasana.jpg",
      "/images/Machasanam.jpg",
      "/images/Patchimotasana.jpg",
      "/images/Salabasana.jpg",
    ],
  },
  {
    id: "advanced",
    level: 3,
    title: "Advanced Level",
    shortDescription: "Master advanced inversions, backbends, and refined body control.",
    description:
      "For experienced practitioners who have strong flexibility, balance, and body control.",
    difficulty: "Advanced",
    styles: [
      {
        id: "inversions",
        name: "Inversions",
        description: "Advanced upside-down work requiring shoulder stability and core precision.",
      },
      {
        id: "arm_balances",
        name: "Arm Balances",
        description: "Strength-intensive balances that demand wrist conditioning and body coordination.",
      },
      {
        id: "deep_backbends",
        name: "Deep Backbends",
        description: "High-mobility spinal extension work for experienced practitioners.",
      },
    ],
    poseIds: [
      "sarvangasana",
      "ustrasana",
      "veerabadhrasana",
      "yerasanam",
      "mulagal_thalai_asanam",
    ],
    focusAreas: ["Inversions", "Arm Strength", "Extreme Flexibility", "Body Mastery"],
    galleryImages: [
      "/images/Sarvangasanam.jpg",
      "/images/Ustrasanam.jpg",
      "/images/Veerabadhrasana.jpg",
      "/images/Yerasanam.jpg",
      "/images/Mulagal thalai asanam.jpg",
    ],
  },
];

export const LEVEL_THEME: Record<
  YOGSHALALevel["id"],
  {
    accent: string;
    badge: string;
    gradient: string;
    button: string;
    glow: string;
    activeBar: string;
  }
> = {
  beginner: {
    accent: "text-ocean-blue",
    badge: "bg-ocean-blue/10 text-ocean-blue",
    gradient: "from-ocean-blue/15 via-soft-pink/10 to-white/60",
    button: "bg-ocean-blue text-white",
    glow: "bg-ocean-blue/20",
    activeBar: "bg-ocean-blue",
  },
  intermediate: {
    accent: "text-warm-orange",
    badge: "bg-warm-orange/10 text-warm-orange",
    gradient: "from-warm-orange/15 via-ocean-blue/10 to-white/60",
    button: "bg-warm-orange text-white",
    glow: "bg-warm-orange/20",
    activeBar: "bg-warm-orange",
  },
  advanced: {
    accent: "text-deep-purple",
    badge: "bg-deep-purple/10 text-deep-purple",
    gradient: "from-deep-purple/15 via-soft-pink/10 to-white/60",
    button: "bg-deep-purple text-white",
    glow: "bg-deep-purple/20",
    activeBar: "bg-deep-purple",
  },
};


