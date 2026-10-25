import { OnboardingNavigator } from "@/components/onboarding/OnboardingNavigator";
import { MissingBookPrompt } from "@/components/shared/MissingBookPrompt";
import BadgesScreen from "@/screens/BadgesScreen";
import { BookChatScreen } from "@/screens/BookChatScreen";
import { BookDetailsScreen } from "@/screens/BookDetailsScreen";
import { FullScreenNotesScreen } from "@/screens/FullScreenNotesScreen";
import { ReaderScreen } from "@/screens/ReaderScreen";
import SkillsScreen from "@/screens/SkillsScreen";
import StatsScreen from "@/screens/StatsScreen";
import { WebDavImportBrowserScreen } from "@/screens/library/WebDavImportBrowserScreen";
import AISettingsScreen from "@/screens/settings/AISettingsScreen";
import AboutScreen from "@/screens/settings/AboutScreen";
import AppearanceSettingsScreen from "@/screens/settings/AppearanceSettingsScreen";
import FeedbackDetailScreen from "@/screens/settings/FeedbackDetailScreen";
import FeedbackScreen from "@/screens/settings/FeedbackScreen";
import FontSettingsScreen from "@/screens/settings/FontSettingsScreen";
import { SettingsHubScreen } from "@/screens/settings/SettingsHubScreen";
import SyncSettingsScreen from "@/screens/settings/SyncSettingsScreen";
import TTSSettingsScreen from "@/screens/settings/TTSSettingsScreen";
import TranslationSettingsScreen from "@/screens/settings/TranslationSettingsScreen";
import VectorModelSettingsScreen from "@/screens/settings/VectorModelSettingsScreen";
import { useSettingsStore } from "@/stores";
/**
 * RootNavigator — top-level stack matching Tauri mobile App.tsx routes exactly.
 */
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { WebDavImportSource } from "@readany/core";
import { TabNavigator } from "./TabNavigator";

export type RootStackParamList = {
  Onboarding: undefined;
  Tabs: undefined;
  Reader: { bookId: string; cfi?: string; highlight?: boolean; openTTS?: boolean };
  BookDetails: { bookId: string };
  BookChat: { bookId: string; selectedText?: string; chapterTitle?: string };
  Stats: undefined;
  Badges: undefined;
  Skills: undefined;
  Settings: undefined;
  VectorModelSettings: undefined;
  AppearanceSettings: undefined;
  AISettings: undefined;
  TTSSettings: undefined;
  TranslationSettings: undefined;
  SyncSettings: undefined;
  About: undefined;
  Feedback: undefined;
  FeedbackDetail: { issueNumber: number; title: string };
  FullScreenNotes: { bookId: string };
  FontSettings: undefined;
  WebDavImportBrowser: { source: WebDavImportSource };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { hasCompletedOnboarding, _hasHydrated, einkMode } = useSettingsStore();

  const showOnboarding = !hasCompletedOnboarding && _hasHydrated;

  if (!_hasHydrated) return null;

  return (
    <>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          // E-ink screens refresh slowly, so skip the slide transition entirely.
          animation: einkMode ? "none" : "slide_from_right",
        }}
      >
        {showOnboarding ? (
          <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
        ) : (
          <>
            <Stack.Screen name="Tabs" component={TabNavigator} />
            <Stack.Screen
              name="Reader"
              component={ReaderScreen}
            />
            <Stack.Screen
              name="BookDetails"
              component={BookDetailsScreen}
            />
            <Stack.Screen
              name="BookChat"
              component={BookChatScreen}
            />
            <Stack.Screen
              name="Stats"
              component={StatsScreen}
            />
            <Stack.Screen
              name="Badges"
              component={BadgesScreen}
            />
            <Stack.Screen
              name="Skills"
              component={SkillsScreen}
            />
            <Stack.Screen name="Settings" component={SettingsHubScreen} />
            <Stack.Screen
              name="VectorModelSettings"
              component={VectorModelSettingsScreen}
            />
            <Stack.Screen name="AppearanceSettings" component={AppearanceSettingsScreen} />
            <Stack.Screen name="AISettings" component={AISettingsScreen} />
            <Stack.Screen name="TTSSettings" component={TTSSettingsScreen} />
            <Stack.Screen name="TranslationSettings" component={TranslationSettingsScreen} />
            <Stack.Screen name="SyncSettings" component={SyncSettingsScreen} />
            <Stack.Screen name="About" component={AboutScreen} />
            <Stack.Screen name="Feedback" component={FeedbackScreen} />
            <Stack.Screen
              name="FeedbackDetail"
              component={FeedbackDetailScreen}
            />
            <Stack.Screen
              name="FontSettings"
              component={FontSettingsScreen}
            />
            <Stack.Screen
              name="WebDavImportBrowser"
              component={WebDavImportBrowserScreen}
            />
            <Stack.Screen
              name="FullScreenNotes"
              component={FullScreenNotesScreen}
            />
          </>
        )}
      </Stack.Navigator>
      <MissingBookPrompt />
    </>
  );
}
