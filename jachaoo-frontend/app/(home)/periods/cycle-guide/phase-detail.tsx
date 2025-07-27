// app/(home)/periods/phase-detail.tsx
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { phaseData } from "../../../utils/phaseData";
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

const renderFoodContent = (foodData) => {
  return (
    <View style={styles.foodContainer}>
      {foodData.categories.map((category, index) => (
        <View key={`cat-${index}`} style={styles.foodCategory}>
          <Text style={styles.foodCategoryName}>{category.name}</Text>
          <Text style={styles.foodCategoryDesc}>{category.description}</Text>

          <View style={styles.foodItemsContainer}>
            {category.items.map((item, itemIndex) => (
              <View key={`item-${itemIndex}`} style={styles.foodItem}>
                <View style={styles.foodItemBullet} />
                <Text style={styles.foodItemText}>{item}</Text>
              </View>
            ))}
          </View>

          {category.tip && (
            <View style={styles.foodTipContainer}>
              <Text style={styles.foodTipText}>{category.tip}</Text>
            </View>
          )}
        </View>
      ))}

      {foodData.generalTips && (
        <View style={styles.generalTipsContainer}>
          <Text style={styles.generalTipsHeader}>General Tips</Text>
          {foodData.generalTips.map((tip, tipIndex) => (
            <View key={`tip-${tipIndex}`} style={styles.generalTipItem}>
              <Text style={styles.generalTipText}>• {tip}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const renderFocusLoveContent = (data) => {
  return (
    <View style={styles.focusLoveContainer}>
      {/* Render Categories */}
      {data.categories.map((category, index) => (
        <View key={`cat-${index}`} style={styles.focusLoveCategory}>
          <Text style={styles.focusLoveCategoryName}>{category.name}</Text>
          <View style={styles.focusLoveItemsContainer}>
            {category.items.map((item, itemIndex) => (
              <View key={`item-${itemIndex}`} style={styles.focusLoveItem}>
                <View style={styles.focusLoveBullet} />
                <Text style={styles.focusLoveItemText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}

      {/* Render Tips */}
      {data.tips && data.tips.length > 0 && (
        <View style={styles.focusLoveTipsContainer}>
          <Text style={styles.focusLoveTipsHeader}>Tips</Text>
          {data.tips.map((tip, tipIndex) => (
            <View key={`tip-${tipIndex}`} style={styles.focusLoveTipItem}>
              <Text style={styles.focusLoveTipText}>• {tip}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default function PhaseDetail() {
  const params = useLocalSearchParams();
  const phase = JSON.parse(params.phase as string);
  const action = params.action as string;
  const content = phaseData[phase.name][action];

  const renderContent = () => {
    // Handle Food section first
    if (action === "Food" && content && content.categories) {
      return renderFoodContent(content);
    }

    // Handle Focus/Love sections
    if (
      (action === "Focus" || action === "Love") &&
      content &&
      content.categories
    ) {
      return renderFocusLoveContent(content);
    }

    // Handle array content (other sections)
    if (Array.isArray(content)) {
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
    }

    return <Text>Content format not recognized</Text>;
  };

  return (
    <LinearGradient colors={["#b3e5fc", "#ffe0b2"]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.header, { backgroundColor: `${phase.color}20` }]}>
          <Text style={styles.phaseName}>{phase.name}</Text>
          <Text style={styles.actionName}>{action}</Text>
        </View>

        <View style={styles.contentContainer}>{renderContent()}</View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    // backgroundColor: "#fff",
    paddingBottom: 60,
    marginTop: 20,
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
  // Food Section Styles
  foodContainer: {
    marginBottom: 20,
  },
  foodCategory: {
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  foodCategoryName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 5,
  },
  foodCategoryDesc: {
    fontSize: 15,
    color: "#34495e",
    marginBottom: 12,
    lineHeight: 22,
  },
  foodItemsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  foodItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "50%",
    marginBottom: 8,
  },
  foodItemBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#9b59b6",
    marginRight: 8,
  },
  foodItemText: {
    fontSize: 15,
    color: "#2c3e50",
  },
  foodTipContainer: {
    backgroundColor: "#e8f4f8",
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  foodTipText: {
    fontSize: 14,
    color: "#2980b9",
    fontStyle: "italic",
  },
  generalTipsContainer: {
    backgroundColor: "#fff5f5",
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
  },
  generalTipsHeader: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#e74c3c",
    marginBottom: 10,
  },
  generalTipItem: {
    marginBottom: 5,
  },
  generalTipText: {
    fontSize: 15,
    color: "#c0392b",
    lineHeight: 22,
  },
  focusLoveContainer: {
    marginBottom: 20,
  },
  focusLoveCategory: {
    backgroundColor: "#f5f7fa",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  focusLoveCategoryName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4a6fa5",
    marginBottom: 10,
  },
  focusLoveItemsContainer: {
    marginLeft: 10,
  },
  focusLoveItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  focusLoveBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4a6fa5",
    marginRight: 10,
    marginTop: 7,
  },
  focusLoveItemText: {
    fontSize: 15,
    color: "#2c3e50",
    lineHeight: 22,
    flex: 1,
  },
  focusLoveTipsContainer: {
    backgroundColor: "#fff0f0",
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
  },
  focusLoveTipsHeader: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#d45555",
    marginBottom: 8,
  },
  focusLoveTipItem: {
    marginBottom: 5,
  },
  focusLoveTipText: {
    fontSize: 15,
    color: "#d45555",
    lineHeight: 22,
  },
});
