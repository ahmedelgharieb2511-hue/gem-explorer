import en from "@/messages/en.json";
import ar from "@/messages/ar.json";
import artifactsEn from "@/features/artifacts/messages/en.json";
import artifactsAr from "@/features/artifacts/messages/ar.json";
import toursEn from "@/features/tours/messages/en.json";
import toursAr from "@/features/tours/messages/ar.json";
import navigationEn from "@/features/navigation/messages/en.json";
import navigationAr from "@/features/navigation/messages/ar.json";
import recognitionEn from "@/features/ai-recognition/messages/en.json";
import recognitionAr from "@/features/ai-recognition/messages/ar.json";
import audioEn from "@/features/audio-guide/messages/en.json";
import audioAr from "@/features/audio-guide/messages/ar.json";
import questsEn from "@/features/quests/messages/en.json";
import questsAr from "@/features/quests/messages/ar.json";
import feedbackEn from "@/features/feedback/messages/en.json";
import feedbackAr from "@/features/feedback/messages/ar.json";
import type { Locale } from "@/types";
export function getMessages(locale: Locale) {
  return locale === "ar"
    ? {
        ...ar,
        artifacts: artifactsAr,
        tours: toursAr,
        navigation: navigationAr,
        recognition: recognitionAr,
        audio: audioAr,
        quests: questsAr,
        feedback: feedbackAr,
      }
    : {
        ...en,
        artifacts: artifactsEn,
        tours: toursEn,
        navigation: navigationEn,
        recognition: recognitionEn,
        audio: audioEn,
        quests: questsEn,
        feedback: feedbackEn,
      };
}
