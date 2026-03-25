import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "@/hooks/use-color-scheme";

const LIGHT_THEME = {
  background: "#ffffff",
  surface: "#f8fafc",
  surfaceStrong: "#ffffff",
  border: "#d1d5db",
  text: "#111827",
  muted: "#667085",
  button: "#2563eb",
  buttonText: "#ffffff",
};

const DARK_THEME = {
  background: "#020617",
  surface: "#0b1220",
  surfaceStrong: "#0f172a",
  border: "#334155",
  text: "#f8fafc",
  muted: "#94a3b8",
  button: "#3b82f6",
  buttonText: "#f8fafc",
};

/* -----------------------------
   DropdownSearch (same as your original)
------------------------------ */
const DropdownSearch = (props) => {
  const {
    selectedValue,
    onValueChange,
    style,
    itemStyle,
    placeholder,
    disableSearch,
    palette,
    textColor,
  } = props;

  const items = React.Children.toArray(props.children).map((child) => ({
    label: child.props.label,
    value: child.props.value,
  }));

  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const triggerRef = useRef(null);
  const [dropdownFrame, setDropdownFrame] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const filtered = disableSearch
    ? items
    : items.filter((item) =>
        item.label.toLowerCase().includes(searchText.toLowerCase())
      );

  const selectedItem = items.find((item) => item.value === selectedValue);
  const closeDropdown = () => {
    setIsOpen(false);
    setSearchText("");
  };
  const openDropdown = () => {
    if (!triggerRef.current) {
      setIsOpen(true);
      return;
    }
    triggerRef.current.measureInWindow((x, y, width, height) => {
      setDropdownFrame({ x, y, width, height });
      setIsOpen(true);
    });
  };

  return (
    <View style={{ marginBottom: 5 }}>
      <View ref={triggerRef} collapsable={false}>
        <TouchableOpacity
          onPress={openDropdown}
          style={[
            style,
            {
              height: 45,
              backgroundColor: palette.surface,
              borderWidth: 1,
              borderColor: palette.border,
              borderRadius: 20,
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 12,
            },
          ]}
          activeOpacity={0.9}>
          <Text style={[itemStyle, { textAlign: "center" }]}>
            {selectedItem ? selectedItem.label : placeholder || "Select an option"}
          </Text>
        </TouchableOpacity>
      </View>

      {isOpen && (
        <Modal transparent visible animationType="none" onRequestClose={closeDropdown}>
          <Pressable style={styles.dropdownBackdrop} onPress={closeDropdown} />
          <View
            style={{
              position: "absolute",
              top: dropdownFrame.y + dropdownFrame.height + 6,
              left: dropdownFrame.x,
              width: dropdownFrame.width,
              zIndex: 1000,
              backgroundColor: palette.surfaceStrong,
              borderWidth: 1,
              borderColor: palette.border,
              borderRadius: 20,
              maxHeight: 260,
              padding: 8,
            }}>
            {!disableSearch && (
              <TextInput
                placeholder="ድለዩ..."
                value={searchText}
                onChangeText={(text) => setSearchText(text)}
                style={{
                  height: 45,
                  borderWidth: 1,
                  borderColor: palette.border,
                  borderRadius: 20,
                  color: textColor,
                  paddingHorizontal: 12,
                  textAlignVertical: "center",
                  textAlign: "left",
                }}
                placeholderTextColor={palette.muted}
                autoFocus
              />
            )}

            <FlatList
              data={filtered}
              keyExtractor={(item) => item.value.toString()}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    onValueChange(item.value);
                    closeDropdown();
                  }}
                  style={{
                    height: 45,
                    borderRadius: 20,
                    justifyContent: "center",
                    alignItems: "flex-start",
                    paddingHorizontal: 12,
                  }}>
                  <Text style={{ color: textColor, textAlign: "left" }}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </Modal>
      )}
    </View>
  );
};
const DropdownSearchItem = () => null;
DropdownSearchItem.displayName = "DropdownSearch.Item";
DropdownSearch.Item = DropdownSearchItem;
DropdownSearch.displayName = "DropdownSearch";

/* -----------------------------
   ToolsScreen
   ✅ Added:
   - LANGUAGES (all)
   - Auto detect option
   - Swap button
   - Offline fallback
------------------------------ */
export default function ToolsScreen() {
  const colorScheme = useColorScheme();
  const palette = colorScheme === "dark" ? DARK_THEME : LIGHT_THEME;

  // Translator
  const [translatorInput, setTranslatorInput] = useState("");
  const [translatorOutput, setTranslatorOutput] = useState("");
  const [translatorFrom, setTranslatorFrom] = useState("auto"); // ✅ default auto
  const [translatorTo, setTranslatorTo] = useState("en");
  const [isHandwritingPadOpen, setIsHandwritingPadOpen] = useState(false);
  const [handwritingStrokes, setHandwritingStrokes] = useState([]);
  const [activeStroke, setActiveStroke] = useState([]);
  const [handwritingPreview, setHandwritingPreview] = useState("");
  const [handwritingCandidates, setHandwritingCandidates] = useState([]);
  const [handwritingError, setHandwritingError] = useState("");
  const [isPreviewingHandwriting, setIsPreviewingHandwriting] = useState(false);
  const [isRecognizingHandwriting, setIsRecognizingHandwriting] = useState(false);
  const [handwritingGuide, setHandwritingGuide] = useState({
    width: 320,
    height: 150,
  });
  const activeStrokeRef = useRef([]);
  const strokeStartTimeRef = useRef(0);
  const strokeIdRef = useRef(1);
  const previewRequestIdRef = useRef(0);

  // ✅ All Google Translate languages (common names + official codes)
  const LANGUAGES = useMemo(
    () => [
      { label: "ብራሱ ይለልይ", value: "auto" },

      { label: "ኣፍሪካንስ", value: "af" },
      { label: "ኣልባንያኛ", value: "sq" },
      { label: "ኣማርኛ", value: "am" },
      { label: "ዓረብኛ", value: "ar" },
      { label: "ኣርመንያኛ", value: "hy" },
      { label: "ኣሳሚዝ", value: "as" },
      { label: "ኣይማራ", value: "ay" },
      { label: "ኣዘርባይጃንኛ", value: "az" },

      { label: "ባምባራ", value: "bm" },
      { label: "ባስክ", value: "eu" },
      { label: "ቤላሩስኛ", value: "be" },
      { label: "ቤንጋሊ", value: "bn" },
      { label: "ቦጅፑሪ", value: "bho" },
      { label: "ቦስንያኛ", value: "bs" },
      { label: "ቡልጋሪኛ", value: "bg" },

      { label: "ካታላን", value: "ca" },
      { label: "ሴቡኣኖ", value: "ceb" },
      { label: "ቻይንኛ (Simplified)", value: "zh-CN" },
      { label: "ቻይንኛ (Traditional)", value: "zh-TW" },
      { label: "ኮርሲካን", value: "co" },
      { label: "ክሮኤሽያኛ", value: "hr" },
      { label: "ቼክኛ", value: "cs" },

      { label: "ዳኒሽ", value: "da" },
      { label: "ዲቬሂ", value: "dv" },
      { label: "ዶግሪ", value: "doi" },
      { label: "ኔዘርላንድኛ", value: "nl" },

      { label: "ኢንግሊሽ", value: "en" },
      { label: "ኤስፐራንቶ", value: "eo" },
      { label: "ኤስቶንያኛ", value: "et" },
      { label: "ኢዌ", value: "ee" },

      { label: "ፊሊፒንኛ", value: "fil" },
      { label: "ፊንላንድኛ", value: "fi" },
      { label: "ፈረንሳይኛ", value: "fr" },
      { label: "ፍሪዝያን", value: "fy" },

      { label: "ጋሊሲያን", value: "gl" },
      { label: "ጆርጂያን", value: "ka" },
      { label: "ጀርመንኛ", value: "de" },
      { label: "ግሪክኛ", value: "el" },
      { label: "ጓራኒ", value: "gn" },
      { label: "ጉጃራቲ", value: "gu" },

      { label: "ሀይቲያን ክሪኦል", value: "ht" },
      { label: "ሀውሳ", value: "ha" },
      { label: "ሀዋይያን", value: "haw" },
      { label: "ኢብራይስጥ", value: "iw" }, // google endpoint still accepts iw
      { label: "ሂንዲ", value: "hi" },
      { label: "ህሞንግ", value: "hmn" },
      { label: "ሃንጋሪኛ", value: "hu" },

      { label: "አይስላንድኛ", value: "is" },
      { label: "ኢግቦ", value: "ig" },
      { label: "ኢሎካኖ", value: "ilo" },
      { label: "ኢንዶኔዥያኛ", value: "id" },
      { label: "ኣይሪሽ", value: "ga" },
      { label: "ጣልያንኛ", value: "it" },

      { label: "ጃፓንኛ", value: "ja" },
      { label: "ጃቫንኛ", value: "jw" },

      { label: "ካናዳኛ", value: "kn" },
      { label: "ካዛክኛ", value: "kk" },
      { label: "ክመር", value: "km" },
      { label: "ክንያርዋንዳ", value: "rw" },
      { label: "ኮርያንኛ", value: "ko" },
      { label: "ክሪዮ", value: "kri" },
      { label: "ኩርዲኛ (Kurmanji)", value: "ku" },
      { label: "ኩርዲኛ (Sorani)", value: "ckb" },
      { label: "ኪርጊዝ", value: "ky" },

      { label: "ላኦ", value: "lo" },
      { label: "ላቲን", value: "la" },
      { label: "ላትቪያን", value: "lv" },
      { label: "ሊንጋላ", value: "ln" },
      { label: "ሊቱዌንያን", value: "lt" },
      { label: "ሉጋንዳ", value: "lg" },
      { label: "ሉክሰምበርግኛ", value: "lb" },

      { label: "ማሴዶንያን", value: "mk" },
      { label: "ማይቲሊ", value: "mai" },
      { label: "ማላጋሲ", value: "mg" },
      { label: "ማላይ", value: "ms" },
      { label: "ማላያላም", value: "ml" },
      { label: "ማልቲዝ", value: "mt" },
      { label: "ማኦሪ", value: "mi" },
      { label: "ማራቲ", value: "mr" },
      { label: "ሚዞ", value: "lus" },
      { label: "ሞንጎሊያን", value: "mn" },

      { label: "ኔፓሊ", value: "ne" },
      { label: "ኖርወይኛ", value: "no" },

      { label: "ኦዲያ", value: "or" },
      { label: "ኦሮምኛ", value: "om" },

      { label: "ፓሽቶ", value: "ps" },
      { label: "ፐርሺያኛ", value: "fa" },
      { label: "ፖላንድኛ", value: "pl" },
      { label: "ፖርቱጋልኛ", value: "pt" },
      { label: "ፓንጃቢ", value: "pa" },

      { label: "ክዌችዋ", value: "qu" },

      { label: "ሮማንኛ", value: "ro" },
      { label: "ራሻኛ", value: "ru" },

      { label: "ሳሞኣን", value: "sm" },
      { label: "ሳንስክሪት", value: "sa" },
      { label: "ስኮቲሽ ጌሊክ", value: "gd" },
      { label: "ሰፐዲ", value: "nso" },
      { label: "ሰርቢያን", value: "sr" },
      { label: "ሰሶቶ", value: "st" },
      { label: "ሾና", value: "sn" },
      { label: "ሲንዲ", value: "sd" },
      { label: "ሲንሃላ", value: "si" },
      { label: "ስሎቫክ", value: "sk" },
      { label: "ስሎቬንያን", value: "sl" },
      { label: "ሶማልኛ", value: "so" },
      { label: "ስፓኒሽ", value: "es" },
      { label: "ሱንዳንዝ", value: "su" },
      { label: "ስዋሂሊ", value: "sw" },
      { label: "ስዊድንኛ", value: "sv" },

      { label: "ታጋሎግ", value: "tl" },
      { label: "ታጂክ", value: "tg" },
      { label: "ታሚል", value: "ta" },
      { label: "ታታር", value: "tt" },
      { label: "ቴሉጉ", value: "te" },
      { label: "ታይ", value: "th" },
      { label: "ትግሪኛ", value: "ti" },
      { label: "ጾንጋ", value: "ts" },
      { label: "ቱርክኛ", value: "tr" },
      { label: "ቱርክመን", value: "tk" },
      { label: "ትዊ", value: "ak" },

      { label: "ዩክሬንኛ", value: "uk" },
      { label: "ኡርዱ", value: "ur" },
      { label: "ኡይጉር", value: "ug" },
      { label: "ኡዝበክ", value: "uz" },

      { label: "ቪየትናምኛ", value: "vi" },

      { label: "ዌልሽ", value: "cy" },
      { label: "ዞሳ", value: "xh" },

      { label: "ይዲሽ", value: "yi" },
      { label: "ዮሩባ", value: "yo" },

      { label: "ዙሉ", value: "zu" },
    ],
    []
  );

  const handleTranslate = async () => {
    if (!translatorInput.trim()) return;

    try {
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${translatorFrom}&tl=${translatorTo}&dt=t&q=${encodeURIComponent(
          translatorInput
        )}`
      );

      const data = await response.json();
      const translatedText = data?.[0]?.map((item) => item?.[0]).join("") || "";
      setTranslatorOutput(translatedText);
    } catch (error) {
      // ✅ Offline fallback (no crash)
      setTranslatorOutput(
        "Offline / Network error. Connect to internet and try again."
      );
      console.error("Translation error:", error);
    }
  };

  const finishStroke = () => {
    if (!activeStrokeRef.current.length) return;
    const newStroke = {
      id: strokeIdRef.current,
      points: activeStrokeRef.current,
    };
    strokeIdRef.current += 1;
    setHandwritingStrokes((prev) => [...prev, newStroke]);
    activeStrokeRef.current = [];
    setActiveStroke([]);
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => isHandwritingPadOpen,
        onMoveShouldSetPanResponder: () => isHandwritingPadOpen,
        onPanResponderGrant: (event) => {
          setHandwritingError("");
          strokeStartTimeRef.current = Date.now();
          const point = {
            x: event.nativeEvent.locationX,
            y: event.nativeEvent.locationY,
            t: 0,
          };
          activeStrokeRef.current = [point];
          setActiveStroke([point]);
        },
        onPanResponderMove: (event) => {
          if (!activeStrokeRef.current.length) return;
          const nextPoint = {
            x: event.nativeEvent.locationX,
            y: event.nativeEvent.locationY,
            t: Date.now() - strokeStartTimeRef.current,
          };
          const previous = activeStrokeRef.current[activeStrokeRef.current.length - 1];
          const dx = Math.abs(nextPoint.x - previous.x);
          const dy = Math.abs(nextPoint.y - previous.y);
          if (dx + dy < 1.5) return;
          activeStrokeRef.current = [...activeStrokeRef.current, nextPoint];
          setActiveStroke(activeStrokeRef.current);
        },
        onPanResponderRelease: finishStroke,
        onPanResponderTerminate: finishStroke,
      }),
    [isHandwritingPadOpen]
  );

  const clearHandwritingPad = () => {
    activeStrokeRef.current = [];
    setActiveStroke([]);
    setHandwritingStrokes([]);
    setHandwritingPreview("");
    setHandwritingCandidates([]);
    setHandwritingError("");
    strokeIdRef.current = 1;
  };

  const openHandwritingPad = () => {
    clearHandwritingPad();
    setIsHandwritingPadOpen(true);
  };

  const closeHandwritingPad = () => {
    setIsHandwritingPadOpen(false);
    clearHandwritingPad();
  };

  const toggleHandwritingPad = () => {
    if (isHandwritingPadOpen) {
      closeHandwritingPad();
      return;
    }
    openHandwritingPad();
  };

  useEffect(() => {
    if (!isHandwritingPadOpen) return;

    const strokesSnapshot = [...handwritingStrokes];
    if (activeStroke.length) {
      strokesSnapshot.push({ id: strokeIdRef.current + 1, points: activeStroke });
    }

    if (!strokesSnapshot.length) {
      previewRequestIdRef.current += 1;
      setIsPreviewingHandwriting(false);
      setHandwritingPreview("");
      setHandwritingCandidates([]);
      return;
    }

    const timer = setTimeout(() => {
      const requestId = previewRequestIdRef.current + 1;
      previewRequestIdRef.current = requestId;
      setIsPreviewingHandwriting(true);

      const languageForInk =
        translatorFrom === "auto" ? "auto" : translatorFrom.replace("-", "_");
      const payload = {
        device: `ReactNative/${Platform.OS}`,
        options: "enable_pre_space",
        requests: [
          {
            writing_guide: {
              writing_area_width: Math.round(handwritingGuide.width),
              writing_area_height: Math.round(handwritingGuide.height),
            },
            ink: strokesSnapshot.map((stroke) => [
              stroke.points.map((point) => Math.round(point.x)),
              stroke.points.map((point) => Math.round(point.y)),
              stroke.points.map((point) => Math.max(0, Math.round(point.t))),
            ]),
            language: languageForInk,
          },
        ],
      };

      fetch("https://www.google.com/inputtools/request?ime=handwriting&app=gws&cs=1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then((response) => response.json())
        .then((data) => {
          if (requestId !== previewRequestIdRef.current) return;
          const candidates = data?.[1]?.[0]?.[1] || [];
          setHandwritingCandidates(candidates);
          setHandwritingPreview(candidates?.[0] || "");
          setHandwritingError("");
        })
        .catch((error) => {
          if (requestId !== previewRequestIdRef.current) return;
          setHandwritingPreview("");
          setHandwritingCandidates([]);
          setHandwritingError(
            "Handwriting preview failed. Connect to internet and try again."
          );
          console.error("Handwriting preview error:", error);
        })
        .finally(() => {
          if (requestId === previewRequestIdRef.current) {
            setIsPreviewingHandwriting(false);
          }
        });
    }, 260);

    return () => clearTimeout(timer);
  }, [
    isHandwritingPadOpen,
    handwritingStrokes,
    activeStroke,
    translatorFrom,
    handwritingGuide.width,
    handwritingGuide.height,
  ]);

  const handleHandwritingRecognize = async () => {
    if (!handwritingPreview.trim()) {
      setHandwritingError("Wait for preview text before Recognize.");
      return;
    }

    setIsRecognizingHandwriting(true);
    try {
      setTranslatorInput((prev) => {
        if (!prev.trim()) return handwritingPreview;
        return `${prev.trim()} ${handwritingPreview}`;
      });
      setTranslatorOutput("");
      closeHandwritingPad();
    } finally {
      setIsRecognizingHandwriting(false);
    }
  };

  const renderInkDots = (points, keyPrefix) =>
    points.map((point, index) => (
      <View
        key={`${keyPrefix}-${index}`}
        style={[
          styles.inkDot,
          {
            left: point.x - 2,
            top: point.y - 2,
            backgroundColor: palette.button,
          },
        ]}
      />
    ));
  const hasHandwritingInk = handwritingStrokes.length > 0 || activeStroke.length > 0;

  // ✅ Swap button
  const handleSwap = () => {
    // if from is auto, swapping it into "to" doesn't make sense.
    // We'll treat it like: swap only if from is not auto; otherwise just swap languages normally.
    const nextFrom = translatorTo;
    const nextTo = translatorFrom === "auto" ? translatorTo : translatorFrom;

    setTranslatorFrom(nextFrom);
    setTranslatorTo(nextTo);

    // swap text too
    setTranslatorInput(translatorOutput);
    setTranslatorOutput(translatorInput);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 24}>
        <View style={styles.pageBody}>
          <View style={styles.translatorContainer}>
              {/* FROM */}
              <DropdownSearch
                selectedValue={translatorFrom}
                style={styles.translatorPicker}
                itemStyle={{ color: palette.text, fontSize: 16 }}
                onValueChange={(itemValue) => {
                  setTranslatorFrom(itemValue);
                  setTranslatorInput("");
                  setTranslatorOutput("");
                }}
                placeholder="From"
                palette={palette}
                textColor={palette.text}
              >
                {LANGUAGES.map((lang) => (
                  <DropdownSearch.Item
                    key={lang.value}
                    label={lang.label}
                    value={lang.value}
                  />
                ))}
              </DropdownSearch>

              <View style={styles.translatorInputWrap}>
                <TextInput
                  style={[
                    styles.translatorInput,
                    styles.translatorInputWithIcon,
                    {
                      borderColor: palette.border,
                      color: palette.text,
                      backgroundColor: palette.surfaceStrong,
                    },
                  ]}
                  placeholder="ኣብዚ ጽሓፉ"
                  placeholderTextColor={palette.muted}
                  value={translatorInput}
                  onChangeText={(value) => {
                    setTranslatorInput(value);
                    setTranslatorOutput("");
                  }}
                  textAlignVertical="center"
                />
                <TouchableOpacity
                  onPress={toggleHandwritingPad}
                  activeOpacity={0.9}
                  style={[
                    styles.handwritingIconButton,
                    {
                      backgroundColor: isHandwritingPadOpen ? palette.button : palette.surface,
                      borderColor: isHandwritingPadOpen ? palette.button : palette.border,
                    },
                  ]}>
                  <MaterialCommunityIcons
                    name="pencil"
                    size={18}
                    color={isHandwritingPadOpen ? palette.buttonText : palette.text}
                  />
                </TouchableOpacity>
              </View>

              {isHandwritingPadOpen ? (
                <View
                  style={[
                    styles.handwritingInlineCard,
                    {
                      backgroundColor: palette.surfaceStrong,
                      borderColor: palette.border,
                    },
                  ]}>
                  <Text style={[styles.handwritingInlineTitle, { color: palette.text }]}>
                    Handwriting
                  </Text>

                  <View
                    style={[
                      styles.handwritingPad,
                      {
                        borderColor: palette.border,
                        backgroundColor: palette.surface,
                      },
                    ]}
                    onLayout={(event) => {
                      const { width, height } = event.nativeEvent.layout;
                      setHandwritingGuide({
                        width: width || 320,
                        height: height || 150,
                      });
                    }}
                    {...panResponder.panHandlers}>
                    {handwritingStrokes.map((stroke) =>
                      renderInkDots(stroke.points, `stroke-${stroke.id}`)
                    )}
                    {renderInkDots(activeStroke, "active")}
                  </View>

                  <View style={styles.handwritingActionRow}>
                    <TouchableOpacity
                      onPress={clearHandwritingPad}
                      activeOpacity={0.9}
                      disabled={!hasHandwritingInk}
                      style={[
                        styles.handwritingActionButton,
                        {
                          backgroundColor: palette.surface,
                          borderColor: palette.border,
                          opacity: hasHandwritingInk ? 1 : 0.7,
                        },
                      ]}>
                      <Text
                        style={[
                          styles.handwritingActionButtonText,
                          { color: palette.text },
                        ]}>
                        Clear
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleHandwritingRecognize}
                      activeOpacity={0.9}
                      disabled={
                        isRecognizingHandwriting ||
                        isPreviewingHandwriting ||
                        !handwritingPreview.trim()
                      }
                      style={[
                        styles.handwritingActionButton,
                        styles.recognizeButton,
                        {
                          backgroundColor: palette.button,
                          borderColor: palette.button,
                          opacity:
                            isRecognizingHandwriting ||
                            isPreviewingHandwriting ||
                            !handwritingPreview.trim()
                              ? 0.7
                              : 1,
                        },
                      ]}>
                      <Text
                        style={[
                          styles.handwritingActionButtonText,
                          { color: palette.buttonText },
                        ]}>
                        {isRecognizingHandwriting ? "Recognizing..." : "Recognize"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View
                    style={[
                      styles.handwritingPreviewCard,
                      {
                        backgroundColor: palette.surface,
                        borderColor: palette.border,
                      },
                    ]}>
                    <Text style={[styles.handwritingPreviewLabel, { color: palette.muted }]}>
                      Preview
                    </Text>
                    <Text style={[styles.handwritingPreviewText, { color: palette.text }]}>
                      {handwritingPreview ||
                        (isPreviewingHandwriting
                          ? "Recognizing handwriting..."
                          : "Preview updates automatically while you write.")}
                    </Text>
                    {handwritingCandidates.length > 1 ? (
                      <Text style={[styles.handwritingPreviewAlt, { color: palette.muted }]}>
                        {handwritingCandidates.slice(1, 4).join(" • ")}
                      </Text>
                    ) : null}
                  </View>

                  {handwritingError ? (
                    <Text style={[styles.handwritingErrorText, { color: "#ef4444" }]}>
                      {handwritingError}
                    </Text>
                  ) : (
                    <Text style={[styles.handwritingHint, { color: palette.muted }]}>
                      Draw on the pad, then tap Recognize.
                    </Text>
                  )}
                </View>
              ) : null}

              {/* ✅ Swap button */}
              <TouchableOpacity
                onPress={handleSwap}
                activeOpacity={0.85}
                style={[
                  styles.swapButton,
                  { backgroundColor: palette.surface, borderColor: palette.border },
                ]}
              >
                <Text style={[styles.swapButtonText, { color: palette.text }]}>⇄</Text>
              </TouchableOpacity>

              {/* TO */}
              <DropdownSearch
                selectedValue={translatorTo}
                style={styles.translatorPicker}
                itemStyle={{ color: palette.text, fontSize: 16 }}
                onValueChange={(itemValue) => {
                  setTranslatorTo(itemValue);
                  setTranslatorOutput("");
                }}
                placeholder="To"
                palette={palette}
                textColor={palette.text}
              >
                {/* ✅ For TO, we remove "auto" option */}
                {LANGUAGES.filter((l) => l.value !== "auto").map((lang) => (
                  <DropdownSearch.Item
                    key={lang.value}
                    label={lang.label}
                    value={lang.value}
                  />
                ))}
              </DropdownSearch>

              <TextInput
                style={[
                  styles.translatorInput,
                  {
                    borderColor: palette.border,
                    color: palette.text,
                    backgroundColor: palette.surfaceStrong,
                  },
                ]}
                editable={false}
                value={translatorOutput}
                placeholder="ትርጉም ኣብዚ ክቕረብ እዩ"
                placeholderTextColor={palette.muted}
                textAlignVertical="center"
              />

              <TouchableOpacity
                style={[styles.translateButton, { backgroundColor: palette.button }]}
                onPress={handleTranslate}
              >
                <Text style={[styles.translateButtonText, { color: palette.buttonText }]}>ተርጉም</Text>
              </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* -----------------------------
   Styles (kept your originals + small swap style)
------------------------------ */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoiding: {
    flex: 1,
  },

  pageBody: {
    flex: 1,
    padding: 20,
  },
  dropdownBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },

  translatorContainer: {
    marginTop: 10,
  },
  translatorInputWrap: {
    position: "relative",
  },
  translatorInputWithIcon: {
    paddingRight: 52,
  },
  handwritingIconButton: {
    position: "absolute",
    right: 7,
    top: 6,
    width: 33,
    height: 33,
    borderRadius: 17,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  handwritingInlineCard: {
    marginBottom: 8,
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
  },
  handwritingInlineTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  handwritingPad: {
    height: 150,
    borderWidth: 1,
    borderRadius: 20,
    marginBottom: 8,
    overflow: "hidden",
    position: "relative",
  },
  inkDot: {
    position: "absolute",
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  handwritingActionRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 4,
  },
  handwritingActionButton: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  recognizeButton: {
    flex: 1.4,
  },
  handwritingActionButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
  handwritingPreviewCard: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 6,
  },
  handwritingPreviewLabel: {
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 2,
    textTransform: "uppercase",
  },
  handwritingPreviewText: {
    fontSize: 15,
    lineHeight: 20,
  },
  handwritingPreviewAlt: {
    fontSize: 12,
    marginTop: 6,
  },
  translatorPicker: {
    color: "#111827",
    marginBottom: 5,
    height: 45,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  translatorInput: {
    height: 45,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 0,
    marginBottom: 5,
    textAlignVertical: "center",
  },
  handwritingHint: {
    fontSize: 12,
    marginBottom: 8,
    marginTop: 2,
  },
  handwritingErrorText: {
    fontSize: 12,
    marginBottom: 8,
    marginTop: 2,
  },
  translateButton: {
    alignItems: "center",
    justifyContent: "center",
    height: 45,
    borderRadius: 20,
    marginTop:20,
  },
  translateButtonText: {
    fontSize: 16,
  },

  // ✅ swap button styles
  swapButton: {
    alignItems: "center",
    justifyContent: "center",
    height: 45,
    borderRadius: 20,
    marginVertical: 6,
    paddingVertical: 0,
    borderWidth: 1,
  },
  swapButtonText: {
    fontSize: 20,
    fontWeight: "900",
  },
});
