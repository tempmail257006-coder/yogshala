export type BeginnerPracticeItem =
  | {
      id: string;
      title: string;
      description: string;
      type: "pose";
      poseId: string;
    }
  | {
      id: string;
      title: string;
      description: string;
      type: "collection";
      poseIds: string[];
    }
  | {
      id: string;
      title: string;
      subtitle?: string;
      description: string;
      type: "custom";
      videoUrl: string;
      posterUrl: string;
      steps: string[];
      benefits: string[];
      breathing: string;
      durationSeconds?: number;
    };

// Demo videos removed; use image guidance instead.
const DEFAULT_VIDEO_URL = "";

export const BEGINNER_HATHA_ITEMS: BeginnerPracticeItem[] = [
  {
    id: "padmasana_intro",
    title: "Padmasana Basics",
    description: "Learn how to settle into Lotus Pose safely with a steady breath and upright spine.",
    type: "pose",
    poseId: "padmasana",
  },
  {
    id: "savasana_relaxation",
    title: "Deep Savasana Relaxation",
    description: "A guided cooldown to release full-body tension and recover after practice.",
    type: "pose",
    poseId: "savasana",
  },
  {
    id: "grounding_sequence",
    title: "Grounding Hatha Sequence",
    description: "A short foundational routine for posture, flexibility, and calm focus.",
    type: "collection",
    poseIds: ["tadasana", "vajrasana", "balasana", "setu_bandhasana", "savasana"],
  },
];

export const BEGINNER_IYENGAR_ITEMS: BeginnerPracticeItem[] = [
  {
    id: "iyengar_alignment_1",
    title: "Iyengar Alignment Drill",
    subtitle: "Foundational Standing Alignment",
    description: "A beginner Iyengar-style practice focused on precise foot, hip, and shoulder alignment.",
    type: "custom",
    videoUrl: DEFAULT_VIDEO_URL,
    posterUrl: "https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?auto=format&fit=crop&q=80&w=1200",
    steps: [
      "Stand tall with feet parallel and evenly rooted.",
      "Lift through the chest while relaxing the shoulders down.",
      "Engage thighs gently and keep knees soft, not locked.",
      "Keep the chin neutral and gaze straight ahead.",
    ],
    benefits: ["Improves postural awareness", "Builds lower-body stability", "Reduces alignment stress"],
    breathing: "Inhale to lengthen the spine, exhale to ground evenly through both feet.",
    durationSeconds: 150,
  },
  {
    id: "iyengar_restorative_1",
    title: "Iyengar Rest and Recover",
    subtitle: "Supported Breath and Recovery",
    description: "A restorative Iyengar-inspired flow that emphasizes control, hold quality, and release.",
    type: "custom",
    videoUrl: DEFAULT_VIDEO_URL,
    posterUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1200",
    steps: [
      "Begin seated and elongate the spine before each movement.",
      "Move into a gentle forward fold and hold with smooth breathing.",
      "Transition to a reclined rest and release tension from jaw and shoulders.",
      "Close the practice in stillness with natural breathing.",
    ],
    benefits: ["Calms the nervous system", "Improves breathing quality", "Supports controlled recovery"],
    breathing: "Keep long, quiet nasal breaths with slightly longer exhalations.",
    durationSeconds: 180,
  },
];
