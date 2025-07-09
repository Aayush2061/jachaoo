// app/(home)/periods/phase-detail.tsx
import { useLocalSearchParams } from "expo-router";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { phaseData } from "../../utils/phaseData";

// Correct bold text renderer (no duplicates)
const renderBoldText = (text: string) => {
  const segments = [];
  let remainingText = text;
  let boldStart, boldEnd;

  while ((boldStart = remainingText.indexOf("**")) !== -1) {
    // Add text before bold
    segments.push(remainingText.substring(0, boldStart));
    remainingText = remainingText.substring(boldStart + 2);

    // Find end of bold
    boldEnd = remainingText.indexOf("**");
    if (boldEnd === -1) break;

    // Add bold text
    segments.push(
      <Text key={`bold-${segments.length}`} style={styles.boldText}>
        {remainingText.substring(0, boldEnd)}
      </Text>
    );
    remainingText = remainingText.substring(boldEnd + 2);
  }

  // Add remaining text
  segments.push(remainingText);

  return (
    <Text style={styles.inlineTextContainer}>
      {segments.map((segment, index) =>
        typeof segment === "string" ? (
          <Text key={`text-${index}`}>{segment}</Text>
        ) : (
          segment
        )
      )}
    </Text>
  );
};

export default function PhaseDetail() {
  const params = useLocalSearchParams();
  const phase = JSON.parse(params.phase as string);
  const action = params.action as string;
  const content = phaseData[phase.name][action];

  const renderContent = () => {
    return content.map((item, index) => {
      // ===== Structured Exercise Data =====
      if (typeof item === "object" && item.type) {
        if (item.type === "exercise") {
          return (
            <View key={`ex-${index}`} style={styles.exerciseContainer}>
              <Text style={styles.exerciseName}>{item.name}</Text>
              {item.image && (
                <View style={styles.imageContainer}>
                  <Image source={item.image} style={styles.exerciseImage} />
                </View>
              )}

              {item.steps && (
                <>
                  <Text style={styles.sectionSubheader}>Steps:</Text>
                  {item.steps.map((step, i) => (
                    <Text key={`step-${i}`} style={styles.stepText}>
                      {renderBoldText(step)}
                    </Text>
                  ))}
                </>
              )}

              {item.benefits && (
                <>
                  <Text style={styles.sectionSubheader}>Benefits:</Text>
                  {item.benefits.map((benefit, index) => (
                    <Text key={`benefit-${index}`} style={styles.benefitText}>
                      • {renderBoldText(benefit)}
                    </Text>
                  ))}
                </>
              )}
            </View>
          );
        }

        if (item.type === "header") {
          return (
            <Text key={`hdr-${index}`} style={styles.sectionHeader}>
              {renderBoldText(item.text)}
            </Text>
          );
        }

        if (item.type === "text") {
          return (
            <Text key={`txt-${index}`} style={styles.contentText}>
              {renderBoldText(item.content)}
            </Text>
          );
        }
      }

      // ===== Legacy Text Formatting =====
      if (typeof item === "string") {
        if (item.match(/^[A-Z][a-zA-Z ]+$/) && !item.match(/[0-9]\./)) {
          return (
            <Text key={`hdr-${index}`} style={styles.sectionHeader}>
              {renderBoldText(item)}
            </Text>
          );
        }

        if (item.startsWith("Tip") || item.startsWith("Note")) {
          return (
            <View key={`tip-${index}`} style={styles.tipContainer}>
              <Text style={styles.tipText}>{renderBoldText(item)}</Text>
            </View>
          );
        }

        return (
          <Text key={`item-${index}`} style={styles.contentText}>
            {renderBoldText(item)}
          </Text>
        );
      }

      return null;
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={[styles.header, { backgroundColor: `${phase.color}20` }]}>
        <Text style={styles.phaseName}>{phase.name}</Text>
        <Text style={styles.actionName}>{action}</Text>
      </View>

      <View style={styles.contentContainer}>{renderContent()}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    paddingBottom: 40,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  phaseName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  actionName: {
    fontSize: 18,
    color: "#7f8c8d",
    marginTop: 4,
  },
  contentContainer: {
    padding: 20,
  },
  inlineTextContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginTop: 20,
    marginBottom: 10,
  },
  sectionSubheader: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginTop: 12,
    marginBottom: 6,
  },
  contentText: {
    fontSize: 16,
    color: "#2c3e50",
    marginBottom: 8,
    lineHeight: 24,
  },
  tipContainer: {
    backgroundColor: "#f0e6ff",
    borderRadius: 8,
    padding: 12,
    marginVertical: 10,
  },
  tipText: {
    fontSize: 15,
    color: "#9b59b6",
    fontStyle: "italic",
  },
  exerciseContainer: {
    marginBottom: 25,
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    padding: 15,
  },
  exerciseImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
    resizeMode: "contain",
  },
  imageContainer: {
    // Add this container for better control
    width: "100%",
    height: 200,
    marginBottom: 12,
    borderRadius: 8,
    overflow: "hidden", // Ensures borderRadius works
    backgroundColor: "#f8f9fa", // Optional: shows while loading
  },
  exerciseName: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 8,
  },
  stepText: {
    fontSize: 14,
    color: "#34495e",
    marginLeft: 8,
    marginBottom: 4,
    lineHeight: 20,
  },
  benefitText: {
    fontSize: 14,
    color: "#27ae60",
    fontStyle: "italic",
    marginLeft: 8, // Add indentation for bullet points
    marginBottom: 4, // Space between benefit items
    lineHeight: 20, // Proper line spacing
  },
  boldText: {
    fontWeight: "bold",
    color: "#2c3e50",
  },
});
