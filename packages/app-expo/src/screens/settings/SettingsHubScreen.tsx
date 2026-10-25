import {
  ChevronRightIcon,
  CloudIcon,
  CpuIcon,
  DatabaseIcon,
  HelpCircleIcon,
  InfoIcon,
  LanguagesIcon,
  MessageSquareIcon,
  PaletteIcon,
  PuzzleIcon,
  Trash2Icon,
  TypeIcon,
  Volume2Icon,
} from "@/components/ui/Icon";
import { useEinkMode } from "@/hooks/use-eink-mode";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { clearMobileRuntimeCache, formatCacheSize } from "@/lib/platform/mobile-cache";
import { stopTTSPreview } from "@/lib/platform/tts-preview";
import type { RootStackParamList } from "@/navigation/RootNavigator";
import { useSettingsStore, useTTSStore } from "@/stores";
import type { ShelfColumnsPreference } from "@/stores/settings-store";
import { fontSize, fontWeight, radius, spacing, useColors } from "@/styles/theme";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SettingsHeader } from "./SettingsHeader";

/**
 * SettingsHubScreen — one settings surface with top tabs, grouped the way
 * e-ink readers (e.g. Hanwang) lay them out: 常规 / 阅读 / 网络 / 存储 / 系统.
 *
 * Tabs keep each page short (little scrolling on e-ink) while the individual
 * detail screens stay reusable.
 */

type Nav = NativeStackNavigationProp<RootStackParamList>;

type TabKey = "general" | "reading" | "network" | "storage" | "system";

type SettingsRoute = Extract<
  keyof RootStackParamList,
  | "AppearanceSettings"
  | "FontSettings"
  | "TTSSettings"
  | "TranslationSettings"
  | "SyncSettings"
  | "AISettings"
  | "VectorModelSettings"
  | "Skills"
  | "Feedback"
  | "About"
>;

type SettingsRow =
  | {
      key: string;
      icon: (props: { size?: number; color?: string }) => React.ReactNode;
      label: string;
      hint?: string;
      route: SettingsRoute;
    }
  | {
      key: string;
      icon: (props: { size?: number; color?: string }) => React.ReactNode;
      label: string;
      hint?: string;
      url: string;
    }
  | {
      key: string;
      icon: (props: { size?: number; color?: string }) => React.ReactNode;
      label: string;
      hint?: string;
      onPress: () => void;
    };

const TAB_KEYS: { key: TabKey; labelKey: string; fallback: string }[] = [
  { key: "general", labelKey: "settings.tabs.general", fallback: "常规" },
  { key: "reading", labelKey: "settings.tabs.reading", fallback: "阅读" },
  { key: "network", labelKey: "settings.tabs.network", fallback: "网络" },
  { key: "storage", labelKey: "settings.tabs.storage", fallback: "存储" },
  { key: "system", labelKey: "settings.tabs.system", fallback: "系统" },
];

export function SettingsHubScreen({ embedded = false }: { embedded?: boolean } = {}) {
  const colors = useColors();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const layout = useResponsiveLayout();
  const { t, i18n } = useTranslation();
  const nav = useNavigation<Nav>();
  const einkMode = useEinkMode();
  const setEinkMode = useSettingsStore((s) => s.setEinkMode);
  const shelfColumns = useSettingsStore((s) => s.shelfColumns);
  const setShelfColumns = useSettingsStore((s) => s.setShelfColumns);
  const [activeTab, setActiveTab] = useState<TabKey>("general");
  const [clearingCache, setClearingCache] = useState(false);
  const stopTTS = useTTSStore((s) => s.stop);

  const handleClearCache = useCallback(() => {
    Alert.alert(
      t("profile.clearCacheTitle", "清除缓存"),
      t(
        "profile.clearCacheConfirm",
        "将清除临时导入文件、TTS 音频缓存和其他运行缓存。书籍、笔记、设置和同步数据不会被删除。",
      ),
      [
        { text: t("common.cancel", "取消"), style: "cancel" },
        {
          text: t("profile.clearCacheAction", "清除缓存"),
          style: "destructive",
          onPress: async () => {
            setClearingCache(true);
            try {
              stopTTS();
              stopTTSPreview();
              const result = await clearMobileRuntimeCache();
              Alert.alert(
                t("profile.clearCacheDoneTitle", "缓存已清除"),
                t("profile.clearCacheDoneDesc", {
                  count: result.deletedFiles,
                  size: formatCacheSize(result.deletedBytes),
                }),
              );
            } catch (error) {
              console.error("[Settings] Failed to clear cache:", error);
              Alert.alert(
                t("profile.clearCacheFailedTitle", "清除失败"),
                error instanceof Error
                  ? error.message
                  : t("profile.clearCacheFailedDesc", "请稍后重试。"),
              );
            } finally {
              setClearingCache(false);
            }
          },
        },
      ],
    );
  }, [stopTTS, t]);

  const rowsByTab = useMemo<Record<TabKey, SettingsRow[]>>(() => {
    const helpUrl = `https://codedogqby.github.io/ReadAny/${
      i18n.language.startsWith("zh") ? "zh/" : ""
    }support/`;
    return {
      general: [
        {
          key: "appearance",
          icon: PaletteIcon,
          label: t("settings.appearance", "外观设置"),
          hint: t("settings.appearanceHint", "主题 / 语言 / 显示"),
          route: "AppearanceSettings",
        },
      ],
      reading: [
        {
          key: "fonts",
          icon: TypeIcon,
          label: t("fonts.title", "字体"),
          hint: t("settings.fontsHint", "字体、字号与排版"),
          route: "FontSettings",
        },
        {
          key: "tts",
          icon: Volume2Icon,
          label: t("tts.title", "语音朗读"),
          hint: t("settings.ttsHint", "引擎、音色与语速"),
          route: "TTSSettings",
        },
        {
          key: "translation",
          icon: LanguagesIcon,
          label: t("settings.translationTab", "翻译"),
          hint: t("settings.translationHint", "翻译服务与目标语言"),
          route: "TranslationSettings",
        },
      ],
      network: [
        {
          key: "sync",
          icon: CloudIcon,
          label: t("settings.sync", "同步"),
          hint: t("settings.syncHint", "WebDAV / S3 / 局域网"),
          route: "SyncSettings",
        },
        {
          key: "ai",
          icon: CpuIcon,
          label: t("settings.ai_title", "AI 模型"),
          hint: t("settings.aiHint", "模型端点与密钥"),
          route: "AISettings",
        },
      ],
      storage: [
        {
          key: "vector",
          icon: DatabaseIcon,
          label: t("settings.vm_title", "向量模型"),
          hint: t("settings.vectorHint", "本地索引与嵌入模型"),
          route: "VectorModelSettings",
        },
        {
          key: "clearCache",
          icon: Trash2Icon,
          label: clearingCache
            ? t("profile.clearingCache", "清除中...")
            : t("profile.clearCache", "清除缓存"),
          hint: t("profile.clearCacheShort", "临时文件 / TTS 缓存"),
          onPress: handleClearCache,
        },
      ],
      system: [
        {
          key: "skills",
          icon: PuzzleIcon,
          label: t("skills.title", "技能"),
          hint: t("settings.skillsHint", "内置与自定义 AI 技能"),
          route: "Skills",
        },
        {
          key: "feedback",
          icon: MessageSquareIcon,
          label: t("feedback.title", "反馈建议"),
          route: "Feedback",
        },
        {
          key: "help",
          icon: HelpCircleIcon,
          label: t("about.supportCenter", "帮助中心"),
          url: helpUrl,
        },
        {
          key: "about",
          icon: InfoIcon,
          label: t("settings.about", "关于"),
          route: "About",
        },
      ],
    };
  }, [clearingCache, handleClearCache, i18n.language, t]);

  const currentRows = rowsByTab[activeTab];
  const contentWidth = layout.centeredContentWidth;

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <SettingsHeader title={t("settings.title", "设置")} showBack={!embedded} />

      {/* Tabs */}
      <View style={[s.tabBarWrap, { borderBottomColor: colors.border }]}>
        <View style={[s.tabBar, { maxWidth: contentWidth }]}>
          {TAB_KEYS.map((tab) => {
            const active = tab.key === activeTab;
            return (
              <TouchableOpacity
                key={tab.key}
                style={s.tabBtn}
                onPress={() => setActiveTab(tab.key)}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    s.tabLabel,
                    {
                      color: active ? colors.primary : colors.mutedForeground,
                      fontWeight: active ? fontWeight.semibold : fontWeight.normal,
                    },
                  ]}
                >
                  {t(tab.labelKey, tab.fallback)}
                </Text>
                <View style={[s.tabIndicator, active && { backgroundColor: colors.primary }]} />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={[s.scrollContent, { maxWidth: contentWidth }]}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "general" ? (
          <>
            <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={s.switchRow}>
                <View style={s.rowTextWrap}>
                  <Text style={[s.rowLabel, { color: colors.foreground }]}>
                    {t("settings.einkMode", "电子墨水屏模式")}
                  </Text>
                  <Text style={[s.rowHint, { color: colors.mutedForeground }]}>
                    {t("settings.einkModeShort", "减少动画、翻页按钮、常驻阅读设置")}
                  </Text>
                </View>
                <Switch
                  value={einkMode}
                  onValueChange={setEinkMode}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.background}
                />
              </View>
            </View>

            <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={s.prefBlock}>
                <Text style={[s.rowLabel, { color: colors.foreground }]}>
                  {t("settings.shelfColumns", "书架列数")}
                </Text>
                <Text style={[s.rowHint, { color: colors.mutedForeground }]}>
                  {t(
                    "settings.shelfColumnsHint",
                    "自动会按屏幕高度选择填充最好的列数；也可以手动固定",
                  )}
                </Text>
                <View style={s.choiceRow}>
                  {(["auto", 3, 4, 5] as const).map((value) => {
                    const active = shelfColumns === value;
                    return (
                      <TouchableOpacity
                        key={String(value)}
                        style={[
                          s.choiceBtn,
                          { borderColor: colors.border },
                          active && {
                            borderColor: colors.primary,
                            backgroundColor: `${colors.primary}14`,
                          },
                        ]}
                        onPress={() => setShelfColumns(value as ShelfColumnsPreference)}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            s.choiceText,
                            { color: active ? colors.primary : colors.mutedForeground },
                            active && { fontWeight: fontWeight.semibold },
                          ]}
                        >
                          {value === "auto"
                            ? t("settings.shelfColumnsAuto", "自动")
                            : String(value)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>
          </>
        ) : null}

        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {currentRows.map((row, index) => {
            const Icon = row.icon;
            const handlePress = () => {
              if ("onPress" in row) {
                row.onPress();
              } else if ("url" in row) {
                void Linking.openURL(row.url);
              } else {
                nav.navigate(row.route);
              }
            };
            return (
              <TouchableOpacity
                key={row.key}
                style={[
                  s.row,
                  index < currentRows.length - 1 && {
                    borderBottomColor: colors.border,
                    borderBottomWidth: StyleSheet.hairlineWidth,
                  },
                ]}
                onPress={handlePress}
                activeOpacity={0.7}
                disabled={row.key === "clearCache" && clearingCache}
              >
                <Icon size={20} color={colors.mutedForeground} />
                <View style={s.rowTextWrap}>
                  <Text style={[s.rowLabel, { color: colors.foreground }]}>{row.label}</Text>
                  {row.hint ? (
                    <Text style={[s.rowHint, { color: colors.mutedForeground }]}>{row.hint}</Text>
                  ) : null}
                </View>
                <ChevronRightIcon size={16} color={colors.mutedForeground} />
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[s.footerHint, { color: colors.mutedForeground }]}>
          {t("settings.hubHint", "设置按类别分页，减少电纸书上的滚动。")}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1 },
    tabBarWrap: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      alignItems: "center",
    },
    tabBar: {
      width: "100%",
      flexDirection: "row",
      paddingHorizontal: spacing.lg,
    },
    tabBtn: {
      flex: 1,
      alignItems: "center",
      paddingTop: 12,
      paddingBottom: 8,
      gap: 8,
    },
    tabLabel: { fontSize: fontSize.md },
    tabIndicator: {
      width: 28,
      height: 3,
      borderRadius: 2,
      backgroundColor: "transparent",
    },
    scroll: { flex: 1 },
    scrollContent: {
      width: "100%",
      alignSelf: "center",
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xl,
      paddingBottom: 48,
      gap: 16,
    },
    card: {
      borderRadius: radius.xl,
      borderWidth: 1,
      overflow: "hidden",
    },
    prefBlock: {
      paddingHorizontal: spacing.lg,
      paddingVertical: 14,
      gap: 4,
    },
    choiceRow: {
      flexDirection: "row",
      gap: 10,
      marginTop: 10,
    },
    choiceBtn: {
      flex: 1,
      minHeight: 44,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.lg,
      borderWidth: 1,
    },
    choiceText: { fontSize: fontSize.md },
    switchRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: spacing.lg,
      paddingVertical: 14,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: spacing.lg,
      paddingVertical: 14,
    },
    rowTextWrap: { flex: 1, gap: 2 },
    rowLabel: { fontSize: fontSize.md, fontWeight: fontWeight.medium },
    rowHint: { fontSize: fontSize.xs, lineHeight: 16 },
    footerHint: { fontSize: fontSize.xs, textAlign: "center" },
  });
}
