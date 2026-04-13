import type { UserProfile, YOGSHALAPose, YOGSHALALevel, YOGSHALAStyle } from "../types";
import type { BeginnerPracticeItem } from "../beginnerPracticeData";

export type AppLanguage = "en" | "ta";

export const LANGUAGE_STORAGE_KEY = "yogshala_language";
export const PENDING_NAME_STORAGE_KEY = "yogshala_pending_name";

export const getLanguageLocale = (language: AppLanguage) => (language === "ta" ? "ta-IN" : "en-US");

const UI_TEXT: Record<string, { en: string; ta: string }> = {
  home: { en: "Home", ta: "முகப்பு" },
  practice: { en: "Practice", ta: "பயிற்சி" },
  aiChat: { en: "AI Chat", ta: "ஏஐ உரையாடல்" },
  goals: { en: "Goals", ta: "இலக்குகள்" },
  profile: { en: "Profile", ta: "சுயவிவரம்" },
  configurationRequired: { en: "Configuration Required", ta: "அமைப்பு தேவை" },
  resetPassword: { en: "Reset Password", ta: "கடவுச்சொல்லை மீட்டமை" },
  welcomeBack: { en: "Welcome Back", ta: "மீண்டும் வரவேற்கிறோம்" },
  joinYogshala: { en: "Join YOGSHALA", ta: "யோக்ஷாலாவில் சேருங்கள்" },
  signIn: { en: "Sign In", ta: "உள்நுழை" },
  signUp: { en: "Sign Up", ta: "பதிவு செய்" },
  sendResetLink: { en: "Send Reset Link", ta: "மீட்டமைப்பு இணைப்பை அனுப்பு" },
  backToSignIn: { en: "Back to Sign In", ta: "உள்நுழைவுக்கு திரும்பு" },
  forgotPassword: { en: "Forgot Password?", ta: "கடவுச்சொல் மறந்துவிட்டதா?" },
  fullName: { en: "Full Name", ta: "முழுப் பெயர்" },
  emailAddress: { en: "Email Address", ta: "மின்னஞ்சல் முகவரி" },
  password: { en: "Password", ta: "கடவுச்சொல்" },
  confirmPassword: { en: "Confirm Password", ta: "கடவுச்சொல்லை உறுதிப்படுத்து" },
  language: { en: "Language", ta: "மொழி" },
  english: { en: "English", ta: "ஆங்கிலம்" },
  tamil: { en: "Tamil", ta: "தமிழ்" },
  orContinueWith: { en: "or continue with", ta: "அல்லது தொடர" },
  noAccount: { en: "Don't have an account? Sign Up", ta: "கணக்கு இல்லையா? பதிவு செய்" },
  haveAccount: { en: "Already have an account? Sign In", ta: "ஏற்கனவே கணக்கு உள்ளதா? உள்நுழை" },
  namaste: { en: "Namaste", ta: "வணக்கம்" },
  wellnessJourneyContinues: { en: "Your wellness journey continues", ta: "உங்கள் நலப் பயணம் தொடர்கிறது" },
  recommendedForYou: { en: "Recommended for you", ta: "உங்களுக்கான பரிந்துரை" },
  startNow: { en: "Start Now", ta: "இப்போது தொடங்கு" },
  streak: { en: "Streak", ta: "தொடர் நாள்" },
  energy: { en: "Energy", ta: "ஆற்றல்" },
  dailyWisdom: { en: "Daily Wisdom", ta: "இன்றைய சிந்தனை" },
  quickStart: { en: "Quick Start", ta: "விரைவு தொடக்கம்" },
  yogshalaLevels: { en: "YOGSHALA Levels", ta: "யோக்ஷாலா நிலைகள்" },
  aiGuide: { en: "AI YOGSHALA Guide", ta: "ஏஐ யோக்ஷாலா வழிகாட்டி" },
  alwaysHere: { en: "Always here to help", ta: "உதவ எப்போதும் தயாராக" },
  askAboutPoses: { en: "Ask about poses or routines...", ta: "ஆசனங்கள் அல்லது பயிற்சி முறைகள் பற்றி கேளுங்கள்..." },
  typingError: { en: "I'm having trouble connecting right now. Please try again.", ta: "இப்போது இணைப்பில் சிக்கல் உள்ளது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்." },
  suggestedFlexibility: { en: "Flexibility", ta: "நெகிழ்வு" },
  suggestedBackPain: { en: "Back Pain", ta: "முதுகு வலி" },
  suggestedBeginner: { en: "Beginner Routine", ta: "தொடக்கப் பயிற்சி" },
  suggestedStress: { en: "Stress Relief", ta: "மனஅழுத்த நிவாரணம்" },
  wellnessScore: { en: "Wellness Score", ta: "நல மதிப்பெண்" },
  consistency: { en: "Consistency", ta: "தொடர்ச்சி" },
  flexibility: { en: "Flexibility", ta: "நெகிழ்வு" },
  editProfile: { en: "Edit Profile", ta: "சுயவிவரத்தை திருத்து" },
  goal: { en: "Goal", ta: "இலக்கு" },
  level: { en: "Level", ta: "நிலை" },
  cancel: { en: "Cancel", ta: "ரத்து" },
  save: { en: "Save", ta: "சேமி" },
  saving: { en: "Saving...", ta: "சேமிக்கப்படுகிறது..." },
  practiceSection: { en: "Practice", ta: "பயிற்சி" },
  preferences: { en: "Preferences", ta: "விருப்பங்கள்" },
  support: { en: "Support", ta: "ஆதரவு" },
  chooseLanguage: { en: "Choose Language", ta: "மொழியை தேர்வு செய்" },
  myJourney: { en: "My Journey", ta: "என் பயணம்" },
  flexibilityTest: { en: "Flexibility Test", ta: "நெகிழ்வு சோதனை" },
  smartReminders: { en: "Smart Reminders", ta: "நுண்ணறிவு நினைவூட்டல்கள்" },
  testVoice: { en: "Test Voice", ta: "குரலை சோதிக்க" },
  testingVoice: { en: "Testing voice...", ta: "குரல் சோதிக்கப்படுகிறது..." },
  privacySecurity: { en: "Privacy & Security", ta: "தனியுரிமை மற்றும் பாதுகாப்பு" },
  helpSupport: { en: "Help & Support", ta: "உதவி மற்றும் ஆதரவு" },
  privacyStatusTitle: { en: "Account Status", ta: "கணக்கு நிலை" },
  privacyStatusValue: { en: "Protected with sign-in and saved preferences", ta: "உள்நுழைவு மற்றும் சேமிக்கப்பட்ட விருப்பங்களுடன் பாதுகாக்கப்பட்டுள்ளது" },
  privacyPermissionTitle: { en: "Permissions in Use", ta: "பயன்பாட்டில் உள்ள அனுமதிகள்" },
  privacyPermissionValue: { en: "Camera, speech, notifications, and local language settings", ta: "கேமரா, குரல், அறிவிப்புகள், மற்றும் உள்ளக மொழி அமைப்புகள்" },
  privacyStorageTitle: { en: "Stored Data", ta: "சேமிக்கப்பட்ட தரவு" },
  privacyStorageValue: { en: "Profile name, level, goal, streak, practice time, and language preference", ta: "சுயவிவரப் பெயர், நிலை, இலக்கு, தொடர் நாள், பயிற்சி நேரம், மற்றும் மொழி விருப்பம்" },
  supportFaqTitle: { en: "Quick Support", ta: "விரைவு உதவி" },
  supportFaqValue: { en: "Voice test, language change, and reminder tools are available in this settings page", ta: "குரல் சோதனை, மொழி மாற்றம், மற்றும் நினைவூட்டல் கருவிகள் இந்த அமைப்புகள் பக்கத்தில் உள்ளன" },
  supportVersionTitle: { en: "App Version", ta: "ஆப் பதிப்பு" },
  supportVersionValue: { en: "YOGSHALA v1.0.0", ta: "YOGSHALA v1.0.0" },
  supportResponseTitle: { en: "Suggested Response", ta: "பரிந்துரைக்கப்பட்ட பதில்" },
  supportResponseValue: { en: "Share the screen name, language, and the step that failed so support can reproduce the issue quickly.", ta: "திரை பெயர், மொழி, மற்றும் தோல்வியுற்ற படியை பகிர்ந்தால் ஆதரவு குழு சிக்கலை விரைவாக மீண்டும் உருவாக்க முடியும்." },
  privacyOverview: { en: "Your profile, language preference, and practice progress are used only to personalize your YOGSHALA experience.", ta: "உங்கள் சுயவிவரம், மொழி விருப்பம், மற்றும் பயிற்சி முன்னேற்றம் ஆகியவை யோக்ஷாலா அனுபவத்தை தனிப்பயனாக்க மட்டுமே பயன்படுத்தப்படுகின்றன." },
  privacyProfileData: { en: "Profile details are stored with your account so your settings and progress stay available across sessions.", ta: "உங்கள் அமைப்புகள் மற்றும் முன்னேற்றம் ஒவ்வொரு அமர்விலும் கிடைக்க, சுயவிவர விவரங்கள் உங்கள் கணக்கில் சேமிக்கப்படுகின்றன." },
  privacyPermissions: { en: "Camera, speech, and notification permissions are used only for practice guidance, voice playback, and reminders.", ta: "கேமரா, குரல், மற்றும் அறிவிப்பு அனுமதிகள் பயிற்சி வழிகாட்டல், குரல் ஒலிபரப்பு, மற்றும் நினைவூட்டல்களுக்கு மட்டுமே பயன்படுத்தப்படுகின்றன." },
  privacySecurityTip: { en: "Use a strong password and sign out on shared devices to keep your account secure.", ta: "உங்கள் கணக்கை பாதுகாப்பாக வைத்திருக்க வலுவான கடவுச்சொல்லைப் பயன்படுத்தி, பகிரப்பட்ட சாதனங்களில் இருந்து வெளியேறவும்." },
  privacyControl: { en: "You can update your profile, language, reminders, and voice preferences anytime from settings.", ta: "உங்கள் சுயவிவரம், மொழி, நினைவூட்டல்கள், மற்றும் குரல் விருப்பங்களை அமைப்புகளில் எப்போது வேண்டுமானாலும் மாற்றலாம்." },
  helpOverview: { en: "Need help? Start with these quick checks to get the app working smoothly.", ta: "உதவி வேண்டுமா? ஆப் சரியாக செயல்பட இந்த விரைவு சரிபார்ப்புகளுடன் தொடங்குங்கள்." },
  helpVoiceTip: { en: "If guide speech is unclear, test the voice from settings and make sure your device TTS and media volume are turned on.", ta: "வழிகாட்டி குரல் தெளிவாக இல்லையெனில், அமைப்புகளில் இருந்து குரலை சோதித்து, உங்கள் சாதனத்தின் TTS மற்றும் மீடியா ஒலி இயங்குகிறதா என உறுதிசெய்யவும்." },
  helpLanguageTip: { en: "If text is showing in the wrong language, switch the app language again from settings to refresh the localized content.", ta: "உரை தவறான மொழியில் தெரிந்தால், உள்ளூர்மயமான உள்ளடக்கத்தை புதுப்பிக்க அமைப்புகளில் இருந்து ஆப் மொழியை மீண்டும் மாற்றவும்." },
  helpPracticeTip: { en: "If a practice screen is not responding, pause the session, go back once, and reopen the practice item.", ta: "பயிற்சி திரை பதிலளிக்கவில்லை என்றால், அமர்வை நிறுத்தி, ஒரு முறை பின்னுக்கு சென்று, பயிற்சி உருப்படியை மீண்டும் திறக்கவும்." },
  helpSupportLine: { en: "For persistent issues, contact your app support team with the screen name and what action you tapped.", ta: "தொடர்ச்சியான சிக்கல்களுக்கு, எந்த திரையிலும் எந்த செயலைத் தட்டினீர்கள் என்பதை குறிப்பிட்டு உங்கள் ஆப் ஆதரவு குழுவை தொடர்புகொள்ளவும்." },
  logout: { en: "Logout", ta: "வெளியேறு" },
  morning: { en: "Morning", ta: "காலை" },
  evening: { en: "Evening", ta: "மாலை" },
  done: { en: "Done", ta: "முடிந்தது" },
  yourScore: { en: "Your Score:", ta: "உங்கள் மதிப்பெண்:" },
  analyzingFlexibility: { en: "Analyzing your flexibility...", ta: "உங்கள் நெகிழ்வை பகுப்பாய்வு செய்கிறது..." },
  setReminders: { en: "Set reminders to help you stay consistent with your YOGSHALA practice.", ta: "யோக்ஷாலா பயிற்சியில் தொடர்ந்து இருக்க நினைவூட்டல்கள் அமைக்கவும்." },
  currentActivity: { en: "Current Activity", ta: "தற்போதைய செயல்" },
  nextPose: { en: "Next pose", ta: "அடுத்த ஆசனம்" },
};

export const t = (key: keyof typeof UI_TEXT, language: AppLanguage) => UI_TEXT[key][language];

const TEXT_MAP: Record<string, { ta: string }> = {
  "Password reset email sent! Check your inbox.": { ta: "கடவுச்சொல் மீட்டமைப்பு மின்னஞ்சல் அனுப்பப்பட்டது. உங்கள் இன்பாக்ஸை பாருங்கள்." },
  "Firebase is not configured. Please set your Firebase keys.": { ta: "Firebase அமைக்கப்படவில்லை. தயவுசெய்து உங்கள் Firebase விசைகளை அமைக்கவும்." },
  "No Google account found on this device. Please add a Google account and try again.": { ta: "இந்த சாதனத்தில் Google கணக்கு இல்லை. Google கணக்கை சேர்த்து மீண்டும் முயற்சிக்கவும்." },
  "Google sign-in failed to return an ID token.": { ta: "Google உள்நுழைவு ID token ஐ வழங்கவில்லை." },
  "Google Sign-In setup error (code 10). Please add the SHA-1/SHA-256 of your app to Firebase and re-download google-services.json.": { ta: "Google உள்நுழைவு அமைப்பு பிழை (code 10). உங்கள் app இன் SHA-1/SHA-256 ஐ Firebase இல் சேர்த்து google-services.json ஐ மீண்டும் பதிவிறக்கவும்." },
  "The user you are helping has the following profile:": { ta: "நீங்கள் உதவ வேண்டிய பயனரின் விவரம்:" },
  "Pose not found": { ta: "ஆசனம் கிடைக்கவில்லை" },
  "Please choose a pose from the level library.": { ta: "நிலை நூலகத்திலிருந்து ஒரு ஆசனத்தைத் தேர்ந்தெடுக்கவும்." },
  "Back to Levels": { ta: "நிலைகளுக்கு திரும்பு" },
  "About": { ta: "அறிமுகம்" },
  "Steps": { ta: "படிகள்" },
  "Breathing": { ta: "சுவாசம்" },
  "Benefits": { ta: "நன்மைகள்" },
  "Safety Tips": { ta: "பாதுகாப்பு குறிப்புகள்" },
  "Level not found": { ta: "நிலை கிடைக்கவில்லை" },
  "Please choose a valid training level.": { ta: "சரியான பயிற்சி நிலையைத் தேர்ந்தெடுக்கவும்." },
  "Practice Gallery": { ta: "பயிற்சி புகைப்படங்கள்" },
  "Photos you added for this level": { ta: "இந்த நிலைக்காக நீங்கள் சேர்த்த புகைப்படங்கள்" },
  "YOGSHALA Styles": { ta: "யோக்ஷாலா முறைகள்" },
  "Pick a style to match your mood": { ta: "உங்கள் மனநிலைக்கு ஏற்ற முறையைத் தேர்ந்தெடுக்கவும்" },
  "Pose Library": { ta: "ஆசன நூலகம்" },
  "Video": { ta: "வீடியோ" },
  "Style not found": { ta: "முறை கிடைக்கவில்லை" },
  "Please choose a valid beginner practice type.": { ta: "சரியான தொடக்கப் பயிற்சி வகையைத் தேர்ந்தெடுக்கவும்." },
  "Back to Practice Types": { ta: "பயிற்சி வகைகளுக்கு திரும்பு" },
  "Back to Practice": { ta: "பயிற்சிக்குத் திரும்பு" },
  "Back to Practice Library": { ta: "பயிற்சி நூலகத்திற்குத் திரும்பு" },
  "Back to Hatha Practice": { ta: "ஹத யோகா பயிற்சிக்குத் திரும்பு" },
  "Back to Iyengar Practice": { ta: "ஐயங்கார் பயிற்சிக்குத் திரும்பு" },
  "Beginner Practice": { ta: "தொடக்கப் பயிற்சி" },
  "Beginner level not found": { ta: "தொடக்க நிலை கிடைக்கவில்லை" },
  "Practice item not found": { ta: "பயிற்சி உருப்படி கிடைக்கவில்லை" },
  "Practice Types": { ta: "பயிற்சி வகைகள்" },
  "Start Beginner Practice": { ta: "தொடக்கப் பயிற்சியைத் தொடங்கு" },
  "Padmasana Basics": { ta: "பத்மாசன அடிப்படைகள்" },
  "Learn how to settle into Lotus Pose safely with a steady breath and upright spine.": { ta: "சீரான மூச்சும் நிமிர்ந்த முதுகுத்தண்டும் உடன் பத்மாசனத்தில் பாதுகாப்பாக அமர கற்றுக்கொள்ளுங்கள்." },
  "Deep Savasana Relaxation": { ta: "ஆழ்ந்த சவாசன ஓய்வு" },
  "A guided cooldown to release full-body tension and recover after practice.": { ta: "முழு உடல் பிடிப்பை விடுவித்து, பயிற்சிக்குப் பிறகு மீள உதவும் வழிகாட்டும் ஓய்வு அமர்வு." },
  "Grounding Hatha Sequence": { ta: "நிலைத்த ஹத யோகா தொடர்" },
  "A short foundational routine for posture, flexibility, and calm focus.": { ta: "உடல் நிலை, நெகிழ்வு, மற்றும் அமைதியான கவனத்திற்கான சுருக்கமான அடிப்படை பயிற்சி." },
  "Iyengar Alignment Drill": { ta: "ஐயங்கார் ஒழுங்கமைப்பு பயிற்சி" },
  "Foundational Standing Alignment": { ta: "அடிப்படை நின்ற நிலை ஒழுங்கமைப்பு" },
  "A beginner Iyengar-style practice focused on precise foot, hip, and shoulder alignment.": { ta: "பாதம், இடுப்பு, மற்றும் தோள் ஒழுங்கமைப்பைத் துல்லியமாக கவனிக்கும் தொடக்கநிலை ஐயங்கார் பயிற்சி." },
  "Improves postural awareness": { ta: "உடல் நிலை விழிப்புணர்வை மேம்படுத்தும்" },
  "Builds lower-body stability": { ta: "கீழ் உடல் நிலைத்தன்மையை வளர்க்கும்" },
  "Reduces alignment stress": { ta: "தவறான ஒழுங்கமைப்பால் ஏற்படும் அழுத்தத்தை குறைக்கும்" },
  "Inhale to lengthen the spine, exhale to ground evenly through both feet.": { ta: "உள்ளிழுத்து முதுகுத்தண்டை நீட்டவும்; வெளியேற்றி இரண்டு பாதங்களிலும் சமமாக நிலைநிறுத்தவும்." },
  "Iyengar Rest and Recover": { ta: "ஐயங்கார் ஓய்வு மற்றும் மீட்பு" },
  "Supported Breath and Recovery": { ta: "ஆதரவு பெற்ற மூச்சும் மீட்சியும்" },
  "A restorative Iyengar-inspired flow that emphasizes control, hold quality, and release.": { ta: "கட்டுப்பாடு, நிலைத்திருக்கும் தரம், மற்றும் தளர்வை வலியுறுத்தும் ஐயங்கார் ஊக்கமளித்த மீளுருவாக்க ஓட்டம்." },
  "Calms the nervous system": { ta: "நரம்பு அமைப்பை அமைதிப்படுத்தும்" },
  "Improves breathing quality": { ta: "மூச்சின் தரத்தை மேம்படுத்தும்" },
  "Supports controlled recovery": { ta: "கட்டுப்படுத்தப்பட்ட மீட்சிக்கு ஆதரவாகும்" },
  "Keep long, quiet nasal breaths with slightly longer exhalations.": { ta: "மூக்கின் வழியாக நீளமான அமைதியான மூச்சுகளை எடுத்து, வெளியேற்றத்தை சற்றே நீளமாக வைத்திருக்கவும்." },
  "Improves circulation": { ta: "இரத்த ஓட்டத்தை மேம்படுத்தும்" },
  "Supports thyroid health": { ta: "தைராய்டு ஆரோக்கியத்திற்கு ஆதரவாகும்" },
  "Master every movement with precision": { ta: "ஒவ்வொரு அசைவையும் துல்லியமாக கற்றுக்கொள்ளுங்கள்" },
  "Pose of the Day": { ta: "இன்றைய ஆசனம்" },
  "Learn More": { ta: "மேலும் அறிக" },
  "Search poses...": { ta: "ஆசனங்களைத் தேடுங்கள்..." },
  "All": { ta: "அனைத்தும்" },
  "Meditation": { ta: "தியானம்" },
  "Stretching": { ta: "நீட்டிப்பு" },
  "Back Pain Relief": { ta: "முதுகு வலி நிவாரணம்" },
  "Weight Loss": { ta: "எடை குறைப்பு" },
  "Mistakes": { ta: "பிழைகள்" },
  "Safety": { ta: "பாதுகாப்பு" },
  "Got it, thanks!": { ta: "புரிந்தது, நன்றி!" },
  "Practice Library": { ta: "பயிற்சி நூலகம்" },
  "Guided steps": { ta: "வழிகாட்டும் படிகள்" },
  "Practice Flow": { ta: "பயிற்சி ஓட்டம்" },
  "Step-by-step Guide": { ta: "படிப்படியான வழிகாட்டி" },
  "Instructions": { ta: "வழிமுறைகள்" },
  "Step": { ta: "படி" },
  "of": { ta: "இல்" },
  "Got it": { ta: "புரிந்தது" },
  "Voice": { ta: "குரல்" },
  "Voice options": { ta: "குரல் விருப்பங்கள்" },
  "Male": { ta: "ஆண்" },
  "Female": { ta: "பெண்" },
  "Detected:": { ta: "கண்டறிந்தது:" },
  "Loading pose library...": { ta: "ஆசன நூலகம் ஏற்றப்படுகிறது..." },
  "Pose library unavailable": { ta: "ஆசன நூலகம் கிடைக்கவில்லை" },
  "Pose library unavailable.": { ta: "ஆசன நூலகம் கிடைக்கவில்லை." },
  "Pose library couldn't be loaded.": { ta: "ஆசன நூலகத்தை ஏற்ற முடியவில்லை." },
  "Pose not recognized": { ta: "ஆசனம் அடையாளம் காணப்படவில்லை" },
  "Pose not recognized.": { ta: "ஆசனம் அடையாளம் காணப்படவில்லை." },
  "Likely": { ta: "அநேகமாக" },
  "Pose tracking isn't supported.": { ta: "ஆசன கண்காணிப்பு ஆதரிக்கப்படவில்லை." },
  "Camera/pose tracking isn't supported on this device.": { ta: "இந்த சாதனத்தில் கேமரா அல்லது ஆசன கண்காணிப்பு ஆதரிக்கப்படவில்லை." },
  "Camera permission denied or not supported on this device.": { ta: "கேமரா அனுமதி மறுக்கப்பட்டது அல்லது இந்த சாதனத்தில் ஆதரிக்கப்படவில்லை." },
  "Practice Levels": { ta: "பயிற்சி நிலைகள்" },
  "Select your level to begin practice": { ta: "பயிற்சியைத் தொடங்க உங்கள் நிலையைத் தேர்வு செய்யுங்கள்" },
  "Select Level": { ta: "நிலையைத் தேர்வு செய்" },
  "Finish Session": { ta: "அமர்வை முடிக்க" },
  "Analyzing pose...": { ta: "ஆசனம் பகுப்பாய்வு செய்யப்படுகிறது..." },
  "Great alignment! Keep breathing steadily.": { ta: "சிறந்த ஒழுங்கமைப்பு! மூச்சை சீராகத் தொடருங்கள்." },
  "Adjust gently to match the reference pose.": { ta: "குறிப்பு ஆசனத்துடன் பொருந்துமாறு மெதுவாகச் சரிசெய்யுங்கள்." },
  "Hatha Practice": { ta: "ஹத யோகா பயிற்சி" },
  "Iyengar Practice": { ta: "ஐயங்கார் பயிற்சி" },
  "Practice Videos": { ta: "பயிற்சி வீடியோக்கள்" },
  "Videos": { ta: "வீடியோக்கள்" },
  "View Practice Videos": { ta: "பயிற்சி வீடியோக்களைப் பார்" },
  "Classify YOGSHALA Asanas by Difficulty": { ta: "யோக்ஷாலா ஆசனங்களை சிரம நிலைப்படி வகைப்படுத்து" },
  "Explore beginner, intermediate, and advanced asanas with short explanations and benefits.": { ta: "தொடக்க, இடைநிலை மற்றும் மேம்பட்ட ஆசனங்களைச் சுருக்கமான விளக்கங்களுடன் அறியுங்கள்." },
  "Educational Guide": { ta: "கற்றல் வழிகாட்டி" },
  "Summary Table": { ta: "சுருக்க அட்டவணை" },
  "Quick reference by level": { ta: "நிலைப்படி விரைவு குறிப்பு" },
  "Use this classification to create structured practice sessions or educational material.": { ta: "கட்டமைக்கப்பட்ட பயிற்சி அமர்வுகள் அல்லது கற்றல் உள்ளடக்கம் உருவாக்க இந்த வகைப்பாட்டைப் பயன்படுத்தவும்." },
  "Difficulty": { ta: "சிரமம்" },
  "Start Training": { ta: "பயிற்சி தொடங்கு" },
  "Active Journey": { ta: "செயலில் உள்ள பயணம்" },
  "30-Day YOGSHALA Flow": { ta: "30 நாள் யோக்ஷாலா ஓட்டம்" },
  "Transform your body and mind in one month.": { ta: "ஒரு மாதத்தில் உடலும் மனமும் மாற்றமடையட்டும்." },
  "Progress": { ta: "முன்னேற்றம்" },
  "Daily Routine": { ta: "தினசரி நடைமுறை" },
  "Current Streak:": { ta: "தற்போதைய தொடர்:" },
  "Streak Broken on Day": { ta: "தொடர் முறிந்த நாள்" },
  "Milestone Badges": { ta: "மைல்கல் பதக்கங்கள்" },
  "First Step": { ta: "முதல் படி" },
  "Complete Day 1": { ta: "1ஆம் நாளை முடி" },
  "Consistency": { ta: "தொடர்ச்சி" },
  "7 Day Streak": { ta: "7 நாள் தொடர்" },
  "YOGSHALA Master": { ta: "யோக்ஷாலா நிபுணர்" },
  "Complete 30 Days": { ta: "30 நாட்கள் முடி" },
  "Dedicated": { ta: "அர்ப்பணிப்பு" },
  "10 Total Sessions": { ta: "மொத்தம் 10 அமர்வுகள்" },
  "Recover": { ta: "மீட்டு" },
  "Recovering...": { ta: "மீட்டெடுக்கப்படுகிறது..." },
  "Recover Day": { ta: "நாளை மீட்டு" },
  "You missed Day": { ta: "நீங்கள் தவறவிட்ட நாள்" },
  "You can use your Energy to restore your streak and unlock this day's progress.": { ta: "உங்கள் ஆற்றலைப் பயன்படுத்தி தொடரை மீட்டெடுத்து இந்த நாள் முன்னேற்றத்தை திறக்கலாம்." },
  "Cost": { ta: "செலவு" },
  "Your Energy": { ta: "உங்கள் ஆற்றல்" },
  "poses": { ta: "ஆசனங்கள்" },
  "items": { ta: "உருப்படிகள்" },
  "videos": { ta: "வீடியோக்கள்" },
  "Choose your training path and grow with structured, level-based practice.": { ta: "கட்டமைக்கப்பட்ட நிலைபடி பயிற்சியுடன் உங்கள் பயிற்சி பாதையைத் தேர்ந்து வளருங்கள்." },
  "Beginner Level": { ta: "தொடக்க நிலை" },
  "Intermediate Level": { ta: "இடைநிலை" },
  "Advanced Level": { ta: "மேம்பட்ட நிலை" },
  "Build a strong foundation with mindful alignment and breath-led movement.": { ta: "கவனமான உடற்கட்டமைப்பும் மூச்சுடன் இணைந்த அசைவுகளும் மூலம் வலுவான அடித்தளத்தை உருவாக்குங்கள்." },
  "Build strength, stamina, and deeper flexibility with dynamic flows.": { ta: "செயல்மிகு ஓட்டங்களுடன் பலம், சகிப்புத்தன்மை, ஆழமான நெகிழ்வை வளர்த்துக்கொள்ளுங்கள்." },
  "Master advanced inversions, backbends, and refined body control.": { ta: "மேம்பட்ட தலைகீழ் நிலைகள், பின்வளைப்புகள் மற்றும் நுணுக்கமான உடல் கட்டுப்பாட்டை கற்றுக்கொள்ளுங்கள்." },
  "Designed for people new to YOGSHALA. Focus on basic poses, correct alignment, and connecting breathing with movement.": { ta: "யோக்ஷாலாவிற்கு புதியவர்களுக்காக வடிவமைக்கப்பட்டது. அடிப்படை ஆசனங்கள், சரியான உடற்கட்டமைப்பு மற்றும் மூச்சுடன் அசைவைக் இணைப்பதில் கவனம்." },
  "For users who already understand basic YOGSHALA and want to build strength, stamina, and deeper flexibility.": { ta: "அடிப்படை யோக்ஷாலாவை அறிந்திருக்கும் மற்றும் பலம், சகிப்புத்தன்மை, ஆழமான நெகிழ்வை வளர்க்க விரும்பும் பயனர்களுக்கு." },
  "For experienced practitioners who have strong flexibility, balance, and body control.": { ta: "உயர் நெகிழ்வு, சமநிலை மற்றும் உடல் கட்டுப்பாடு கொண்ட அனுபவமிக்க பயிற்சியாளர்களுக்கு." },
  "Hatha Basics": { ta: "ஹத அடிப்படை" },
  "Restorative Reset": { ta: "மீளுருவாக்க ஓய்வு" },
  "Vinyasa Flow": { ta: "வின்யாச ஓட்டம்" },
  "Iyengar Alignment": { ta: "ஐயங்கார் ஒழுங்கமைப்பு" },
  "Slow-paced foundations focused on alignment, breath control, and posture awareness.": { ta: "உடற்கட்டமைப்பு, மூச்சுக் கட்டுப்பாடு மற்றும் உடல் நிலை விழிப்புணர்வில் கவனம் செலுத்தும் மெதுவான அடிப்படை பயிற்சி." },
  "Gentle poses with longer holds to release tension and calm the nervous system.": { ta: "பிடிப்பை விடுவித்து நரம்பு அமைப்பை அமைதிப்படுத்த நீண்டநேரம் நிலைத்திருக்கும் மென்மையான ஆசனங்கள்." },
  "Beginner-friendly movement flow linking breath with smooth transitions.": { ta: "மூச்சையும் மென்மையான மாற்றங்களையும் இணைக்கும் தொடக்கநிலை நட்பு ஓட்டப் பயிற்சி." },
  "Precision-focused practice emphasizing stability, posture, and mindful form.": { ta: "நிலைத்தன்மை, உடல் நிலை மற்றும் கவனமான வடிவமைப்பில் வலியுறுத்தும் துல்லியப் பயிற்சி." },
  "Alignment": { ta: "ஒழுங்கமைப்பு" },
  "Breath Awareness": { ta: "மூச்சு விழிப்புணர்வு" },
  "Mobility": { ta: "இயங்குதிறன்" },
  "Body Balance": { ta: "உடல் சமநிலை" },
};

export const translateText = (text: string, language: AppLanguage) => {
  if (language === "en") return text;
  if (TEXT_MAP[text]?.ta) return TEXT_MAP[text].ta;
  if (text.startsWith("Day ")) {
    return text.replace(/^Day (\d+): /, "நாள் $1: ");
  }
  if (text.startsWith("Current Streak: ")) {
    return `தற்போதைய தொடர்: ${text.replace("Current Streak: ", "")}`;
  }
  if (text.startsWith("Streak Broken on Day ")) {
    return `தொடர் முறிந்த நாள் ${text.replace("Streak Broken on Day ", "")}`;
  }
  if (text.startsWith("Recover Day ")) {
    return text.replace("Recover Day ", "நாளை மீட்டு ");
  }
  if (text.startsWith("You missed Day ")) {
    return text.replace("You missed Day ", "நீங்கள் தவறவிட்ட நாள் ");
  }
  return text;
};

const EXACT_INSTRUCTION_TRANSLATIONS: Record<string, string> = {
  "Stand with your big toes touching and heels slightly apart.": "பெருவிரல்கள் ஒன்றோடொன்று தொடவும், குதிகால்கள் சற்றே விலகி நிற்கவும்.",
  "Lift and spread your toes and the balls of your feet, then lay them softly back down.": "கால் விரல்களையும் பாத முன்பகுதியையும் விரித்து, மெதுவாக மீண்டும் தரையில் வைக்கவும்.",
  "Engage your quadriceps to lift your kneecaps.": "தொடை முன்தசைகளைச் செயல்படுத்தி முழங்கால்களை மெதுவாக உயர்த்தவும்.",
  "Tuck your tailbone slightly and draw your belly in.": "வால் எலும்பை சற்றே உள்ளே இழுத்து, வயிற்றைப் பிடிப்பாக வைத்துக்கொள்ளவும்.",
  "Roll your shoulders back and down, letting your arms hang naturally.": "தோள்களை பின்புறமும் கீழ்புறமும் தளர்த்தி, கைகளை இயல்பாக விடவும்.",
  "Gaze straight ahead and breathe deeply.": "நேராக முன்னோக்கிப் பார்த்து ஆழமாக சுவாசிக்கவும்.",
  "Start in Mountain Pose.": "தாடாசனத்தில் தொடங்குங்கள்.",
  "Shift your weight to your left foot.": "உங்கள் உடல் எடையை இடது பாதத்தில் மாற்றுங்கள்.",
  "Bring your hands to prayer position at your chest.": "கைகளை மார்பின் முன் நமஸ்கார நிலையில் கொண்டு வாருங்கள்.",
  "Find a steady point to gaze at.": "ஒரு நிலையான புள்ளியை நோக்கிப் பாருங்கள்.",
  "Hold for several breaths, then switch sides.": "சில மூச்சுகள் வரை நிலையைத் தக்கவைத்து, பிறகு மறுபுறம் மாற்றுங்கள்.",

  "Sit on the floor and place one foot on the opposite thigh.": "தரையில் அமர்ந்து, ஒரு பாதத்தை எதிர்ப்புற தொடையின் மேல் வைக்கவும்.",
  "Place the other foot on the first thigh.": "மற்ற பாதத்தையும் முதல் தொடையின் மேல் வைக்கவும்.",
  "Keep your spine straight and hands on your knees.": "முதுகுத்தண்டை நேராக வைத்து, கைகளை முழங்கால்களின் மீது வைக்கவும்.",
  "Sit tall and breathe deeply.": "நிமிர்ந்து அமர்ந்து ஆழமாக சுவாசிக்கவும்.",
  "Lie flat on your back with your arms and legs relaxed.": "முதுகில் நேராக படுத்து, கைகளையும் கால்களையும் தளர்வாக விடவும்.",
  "Close your eyes and breathe naturally.": "கண்களை மூடி இயல்பாக சுவாசிக்கவும்.",
  "Release all tension from your body.": "உடலிலுள்ள அனைத்து பிடிப்பையும் விடுங்கள்.",
  "Stay in the pose for several minutes.": "இந்த நிலையில் சில நிமிடங்கள் அமைதியாக இருங்கள்.",
  "Stand with your feet about 3-4 feet apart.": "கால்களை சுமார் 3 முதல் 4 அடி வரை அகலமாக வைத்து நிற்கவும்.",
  "Turn your right foot out and keep your left foot slightly in.": "வலது பாதத்தை வெளியே திருப்பி, இடது பாதத்தை சற்றே உள்ளே வைத்துக்கொள்ளவும்.",
  "Inhale and extend your arms out to the sides.": "உள்ளிழுத்து, கைகளை இருபுறமும் நீட்டவும்.",
  "Exhale and reach your right hand toward your shin or a block.": "வெளியேற்றி, வலது கையை கால்சதையில் அல்லது யோகா கட்டையில் நோக்கி நீட்டவும்.",
  "Extend your left arm upward and keep your chest open.": "இடது கையை மேலே நீட்டி, மார்பைப் திறந்தபடி வைத்திருக்கவும்.",
  "Sit in a comfortable cross-legged position.": "சௌகரியமான கால்மடக்கி அமர்ந்த நிலையில் அமரவும்.",
  "Interlace your fingers and turn your palms upward.": "விரல்களை ஒன்றோடொன்று கோர்த்து, உள்ளங்கைகளை மேலே திருப்பவும்.",
  "Inhale and lift your arms overhead, keeping shoulders relaxed.": "உள்ளிழுத்து, தோள்களை தளர்த்தியபடி கைகளை தலைக்கு மேல் உயர்த்தவும்.",
  "Lengthen the spine and sit tall.": "முதுகுத்தண்டை நீட்டித்து நிமிர்ந்து அமரவும்.",
  "Hold for a few breaths, then release.": "சில மூச்சுகள் வரை தங்கி, பின்னர் தளர்த்தவும்.",
  "Sit with legs extended, then bend your right knee and place the foot outside your left thigh.": "கால்களை நீட்டி அமர்ந்து, பின்னர் வலது முழங்காலை மடக்கி பாதத்தை இடது தொடையின் வெளிப்புறத்தில் வைக்கவும்.",
  "Bend your left knee and tuck the foot near your right hip or keep it extended.": "இடது முழங்காலையும் மடக்கி பாதத்தை வலது இடுப்பருகே கொண்டு வாருங்கள் அல்லது அதை நீட்டியவாறே வைத்திருக்கவும்.",
  "Inhale to lengthen the spine.": "உள்ளிழுத்து முதுகுத்தண்டை நீட்டவும்.",
  "Exhale and twist to the right, placing your left elbow outside your right knee.": "வெளியேற்றி வலப்புறம் திரும்பி, இடது முழங்கை வலது முழங்காலின் வெளிப்புறத்தில் வருமாறு வைக்கவும்.",
  "Gaze over the right shoulder and breathe steadily.": "வலது தோளுக்கு மேல் நோக்கிப் பார்த்து சீராக சுவாசிக்கவும்.",
  "Lie on your back with legs extended and arms by your sides.": "முதுகில் படுத்து, கால்களை நீட்டி கைகளை உடலின் இருபுறமும் வைத்துக்கொள்ளவும்.",
  "Slide your hands under your hips, palms down.": "கைகளை இடுப்பின் கீழ் நுழைத்து, உள்ளங்கைகள் தரையை நோக்க வைத்திருக்கவும்.",
  "Inhale and lift your chest, arching the upper back.": "உள்ளிழுத்து மார்பைப் உயர்த்தி, மேல்முதுகை மெதுவாக வளைத்துக்கொள்ளவும்.",
  "Lower the crown of your head lightly toward the mat.": "தலையின் உச்சிப் பகுதியை மெதுவாக மேட்டின் மீது தாழ்த்தவும்.",
  "Keep weight in the forearms and breathe evenly.": "எடையை முன்கைகளில் தாங்கி, சீராக சுவாசிக்கவும்.",
  "Lie on your belly with arms alongside your body.": "வயிற்றுப்புறமாக படுத்து, கைகளை உடலின் அருகே வைத்திருக்கவும்.",
  "Inhale and lift your chest, arms, and legs off the floor.": "உள்ளிழுத்து மார்பு, கைகள், கால்கள் ஆகியவற்றை தரையிலிருந்து உயர்த்தவும்.",
  "Keep your gaze forward and neck long.": "முன்னோக்கிப் பார்த்து, கழுத்தை நீளமாக வைத்திருக்கவும்.",
  "Engage your glutes and lengthen through the toes.": "இடுப்புத் தசைகளைச் செயல்படுத்தி, கால் விரல்கள் வரை நீட்டவும்.",
  "Lie on your back with arms by your sides.": "முதுகில் படுத்து, கைகளை உடலின் இருபுறமும் வைத்திருக்கவும்.",
  "Lift your legs and hips, supporting your back with your hands.": "கால்களையும் இடுப்பையும் உயர்த்தி, கைகளால் முதுகை தாங்கிக்கொள்ளவும்.",
  "Stack hips over shoulders and keep legs straight.": "இடுப்பை தோள்களின் மேல் வருமாறு வைத்து, கால்களை நேராக வைத்திருக்கவும்.",
  "Press into the shoulders and keep the neck long.": "தோள்களில் மெதுவாக அழுத்தம் கொடுத்து, கழுத்தை நீளமாக வைத்திருக்கவும்.",
  "Hold with slow breaths, then lower with control.": "மெதுவான மூச்சுகளுடன் நிலையைத் தக்கவைத்து, பின்னர் கட்டுப்பாட்டுடன் கீழிறக்கவும்.",
  "Kneel with knees hip-width apart and toes tucked.": "முழங்கால்களை இடுப்பளவு அகலத்தில் வைத்து முட்டிக்காலில் அமர்ந்து, பாத விரல்களை உள்ளே மடக்கிக்கொள்ளவும்.",
  "Place hands on your lower back and lift the chest.": "கைகளை கீழ்முதுகின் மீது வைத்து, மார்பைப் உயர்த்தவும்.",
  "Reach back to hold the heels one at a time.": "பின்புறமாக கைகளை நீட்டி, ஒவ்வொரு கையாலும் குதிகால்களைப் பிடிக்கவும்.",
  "Press hips forward and keep the neck long.": "இடுப்பைப் முன்னோக்கித் தள்ளி, கழுத்தை நீளமாக வைத்திருக்கவும்.",
  "Breathe steadily, then return slowly.": "சீராக சுவாசித்து, பின்னர் மெதுவாக பழைய நிலைக்கு திரும்பவும்.",
  "Stand with feet wide and turn the front foot out.": "கால்களை அகலமாக வைத்து நின்று, முன்புற பாதத்தை வெளியே திருப்பவும்.",
  "Bend the front knee over the ankle.": "முன்புற முழங்காலை குதிகாலின் மேல் வருமாறு மடக்கவும்.",
  "Square the hips and extend your arms.": "இடுப்பை சமநிலைப்படுத்தி, கைகளை நீட்டவும்.",
  "Lift through the chest and engage the core.": "மார்பைப் உயர்த்தி, மையத் தசைகளைச் செயல்படுத்தவும்.",
  "Interlace fingers and place forearms on the mat.": "விரல்களை கோர்த்து, முன்கைகளை மேட்டின் மீது வைக்கவும்.",
  "Place the crown of your head lightly on the floor.": "தலையின் உச்சிப் பகுதியை மெதுவாக தரையில் வைக்கவும்.",
  "Lift your hips and walk feet toward your head.": "இடுப்பை உயர்த்தி, பாதங்களை தலையினை நோக்கி மெதுவாக நகர்த்தவும்.",
  "Engage the core and lift the legs upward.": "மையத் தசைகளைச் செயல்படுத்தி, கால்களை மேலே உயர்த்தவும்.",
  "Start from a stable kneeling position with forearms grounded.": "முன்கைகள் தரையில் உறுதியாக இருக்கும் நிலையான முட்டிக்கால் நிலையில் தொடங்கவும்.",
  "Create a firm base and place the head gently in position.": "உறுதியான அடிப்படை அமைத்து, தலையை மெதுவாக சரியான இடத்தில் வைக்கவும்.",
  "Engage the core and lift the hips over the shoulders.": "மையத் தசைகளைச் செயல்படுத்தி, இடுப்பை தோள்களின் மேல் உயர்த்தவும்.",
  "Balance with controlled breaths and a long neck.": "கட்டுப்படுத்தப்பட்ட மூச்சுகளுடன் சமநிலையைப் பேணி, கழுத்தை நீளமாக வைத்திருக்கவும்.",
  "Exit slowly and rest in Child's Pose.": "மெதுவாக வெளியே வந்து, பாலாசனத்தில் ஓய்வு எடுக்கவும்.",
  "Stand tall with feet parallel and evenly rooted.": "கால்களை சமமாக வைத்து, தரையில் உறுதியாக நிற்கவும்.",
  "Lift through the chest while relaxing the shoulders down.": "தோள்களை தளர்த்தியபடி மார்பை உயர்த்தவும்.",
  "Engage thighs gently and keep knees soft, not locked.": "தொடைத் தசைகளை மெதுவாகச் செயல்படுத்தி, முழங்கால்களை பூட்டாமல் மென்மையாக வைத்துக்கொள்ளவும்.",
  "Keep the chin neutral and gaze straight ahead.": "தாடையை சமநிலையுடன் வைத்து, நேராக முன்னோக்கிப் பாருங்கள்.",
  "Begin seated and elongate the spine before each movement.": "அமர்ந்த நிலையிலிருந்து தொடங்கி, ஒவ்வொரு அசைவுக்கும் முன் முதுகுத்தண்டை நீட்டவும்.",
  "Move into a gentle forward fold and hold with smooth breathing.": "மென்மையான முன்வளைப்பிற்குச் சென்று, சீரான மூச்சுகளுடன் தங்கி இருக்கவும்.",
  "Transition to a reclined rest and release tension from jaw and shoulders.": "படுக்கை ஓய்வு நிலைக்கு மாறி, தாடை மற்றும் தோள்களில் உள்ள பிடிப்பை விடுங்கள்.",
  "Close the practice in stillness with natural breathing.": "இயல்பான மூச்சுகளுடன் அமைதியாக பயிற்சியை முடிக்கவும்.",
};

const POSE_NAME_TRANSLATIONS: Record<string, string> = {
  tadasana: "தாடாசனம்",
  vrikshasana: "விருக்ஷாசனம்",
  balasana: "பாலாசனம்",
  marjaryasana: "மார்ஜாரியாசனம்",
  bitilasana: "பிடிலாசனம்",
  adho_mukha_svanasana: "அதோ முக ஸ்வானாசனம்",
  bhujangasana: "புஜங்காசனம்",
  setu_bandhasana: "சேது பந்தாசனம்",
  vajrasana: "வஜ்ராசனம்",
  padmasana: "பத்மாசனம்",
  savasana: "சவாசனம்",
};

export const localizePoseName = (pose: Pick<YOGSHALAPose, "id" | "name" | "sanskritName">, language: AppLanguage) => {
  if (language === "en") return pose.name;
  return POSE_NAME_TRANSLATIONS[pose.id] ?? pose.sanskritName.split("(")[0].trim() ?? pose.name;
};

export const localizeInstruction = (text: string, language: AppLanguage) => {
  if (language === "en") return text;
  return EXACT_INSTRUCTION_TRANSLATIONS[text] ?? translateText(text, language);
};

export const localizeSpeech = (text: string, language: AppLanguage) => {
  if (language === "en") return text;
  return EXACT_INSTRUCTION_TRANSLATIONS[text] ?? translateText(text, language);
};

export const localizePose = (pose: YOGSHALAPose, language: AppLanguage): YOGSHALAPose => {
  if (language === "en") return pose;
  return {
    ...pose,
    name: localizePoseName(pose, language),
    description: translateText(pose.description, language),
    benefits: pose.benefits.map((benefit) => translateText(benefit, language)),
    instructions: pose.instructions.map((step) => localizeInstruction(step, language)),
    breathing: translateText(pose.breathing, language),
    commonMistakes: pose.commonMistakes.map((item) => translateText(item, language)),
    safetyTips: pose.safetyTips.map((item) => translateText(item, language)),
  };
};

export const localizeStyle = (style: YOGSHALAStyle, language: AppLanguage): YOGSHALAStyle => {
  if (language === "en") return style;
  return {
    ...style,
    name: translateText(style.name, language),
    description: translateText(style.description, language),
  };
};

export const localizeLevel = (level: YOGSHALALevel, language: AppLanguage): YOGSHALALevel => {
  if (language === "en") return level;
  return {
    ...level,
    title: translateText(level.title, language),
    shortDescription: translateText(level.shortDescription, language),
    description: translateText(level.description, language),
    difficulty: translateText(level.difficulty, language) as YOGSHALALevel["difficulty"],
    styles: level.styles.map((style) => localizeStyle(style, language)),
    focusAreas: level.focusAreas.map((focus) => translateText(focus, language)),
  };
};

export const localizePracticeItem = (item: BeginnerPracticeItem, language: AppLanguage): BeginnerPracticeItem => {
  if (language === "en") return item;
  if (item.type === "custom") {
    return {
      ...item,
      title: translateText(item.title, language),
      subtitle: item.subtitle ? translateText(item.subtitle, language) : item.subtitle,
      description: translateText(item.description, language),
      steps: item.steps.map((step) => localizeInstruction(step, language)),
      benefits: item.benefits.map((benefit) => translateText(benefit, language)),
      breathing: translateText(item.breathing, language),
    };
  }
  return {
    ...item,
    title: translateText(item.title, language),
    description: translateText(item.description, language),
  };
};

export const buildLocalizedPoseIntro = (
  pose: Pick<YOGSHALAPose, "id" | "name" | "sanskritName" | "instructions">,
  language: AppLanguage
) => {
  if (language === "en") {
    return `Next pose: ${pose.name}. ${pose.instructions[0] ?? ""}`.trim();
  }
  const poseName = localizePoseName(pose, language);
  const firstInstruction = localizeInstruction(pose.instructions[0] ?? "", language);
  return firstInstruction ? `அடுத்த ஆசனம்: ${poseName}. ${firstInstruction}` : `அடுத்த ஆசனம்: ${poseName}.`;
};

export const getLocalizedGreeting = (profile: UserProfile | null, language: AppLanguage) => {
  const firstName = profile?.name?.split(" ")[0] || "";
  if (language === "ta") {
    return `வணக்கம் ${firstName}! நான் உங்கள் யோக்ஷாலா ஏஐ உதவியாளர். இன்று உங்கள் ${profile?.YOGSHALALevel || "Beginner"} யோக்ஷாலா பயிற்சிக்கு எப்படி உதவலாம்?`;
  }
  return `Hello ${firstName}! I am your YOGSHALA AI Assistant. How can I help you with your ${profile?.YOGSHALALevel?.toLowerCase() || ""} YOGSHALA practice today?`;
};
