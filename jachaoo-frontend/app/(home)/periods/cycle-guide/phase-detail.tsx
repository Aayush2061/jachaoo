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
          <Text key={`text-${index}`} style={styles.regularText}>
            {segment}
          </Text>
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

    return <Text style={styles.errorText}>Content format not recognized</Text>;
  };

  return (
    <LinearGradient
      colors={["#FFF2F8", "#F2F0FF"]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.header, { backgroundColor: `${phase.color}15` }]}>
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
    paddingBottom: 60,
    paddingTop: 20,
  },
  header: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(183,108,253,0.1)",
  },
  phaseName: {
    fontSize: 22,
    fontFamily: "Poppins-SemiBold",
    color: "#2D2D2D",
  },
  actionName: {
    fontSize: 18,
    fontFamily: "Poppins-Medium",
    color: "#8B8691",
    marginTop: 4,
  },
  contentContainer: {
    padding: 20,
  },
  inlineTextContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  regularText: {
    fontFamily: "Poppins-Regular",
    fontSize: 16,
    color: "#2D2D2D",
  },
  sectionHeader: {
    fontSize: 20,
    fontFamily: "Poppins-SemiBold",
    color: "#2D2D2D",
    marginTop: 24,
    marginBottom: 12,
  },
  sectionSubheader: {
    fontSize: 17,
    fontFamily: "Poppins-SemiBold",
    color: "#2D2D2D",
    marginTop: 16,
    marginBottom: 8,
  },
  contentText: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: "#2D2D2D",
    marginBottom: 12,
    lineHeight: 24,
  },
  tipContainer: {
    backgroundColor: "rgba(255,242,248,0.9)",
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#FF5C8D",
  },
  tipText: {
    fontSize: 15,
    fontFamily: "Poppins-Medium",
    color: "#FF5C8D",
    fontStyle: "italic",
  },
  exerciseContainer: {
    marginBottom: 25,
    backgroundColor: "rgba(255,255,255,0.82)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(183,108,253,0.04)",
  },
  exerciseImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
    resizeMode: "contain",
  },
  imageContainer: {
    width: "100%",
    height: 200,
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#F8F9FA",
  },
  exerciseName: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: "#2D2D2D",
    marginBottom: 12,
  },
  stepText: {
    fontSize: 15,
    fontFamily: "Poppins-Regular",
    color: "#6B7280",
    marginLeft: 8,
    marginBottom: 6,
    lineHeight: 22,
  },
  benefitText: {
    fontSize: 15,
    fontFamily: "Poppins-Regular",
    color: "#27ae60",
    fontStyle: "italic",
    marginLeft: 8,
    marginBottom: 6,
    lineHeight: 22,
  },
  boldText: {
    fontFamily: "Poppins-SemiBold",
    color: "#2D2D2D",
  },
  errorText: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: "#FF5C8D",
    textAlign: "center",
    marginTop: 20,
  },
  // Food Section Styles
  foodContainer: {
    marginBottom: 20,
  },
  foodCategory: {
    backgroundColor: "rgba(255,255,255,0.82)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(183,108,253,0.04)",
  },
  foodCategoryName: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: "#2D2D2D",
    marginBottom: 8,
  },
  foodCategoryDesc: {
    fontSize: 15,
    fontFamily: "Poppins-Regular",
    color: "#6B7280",
    marginBottom: 16,
    lineHeight: 22,
  },
  foodItemsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  foodItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
  },
  foodItemBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#B76CFD",
    marginRight: 10,
  },
  foodItemText: {
    fontSize: 15,
    fontFamily: "Poppins-Regular",
    color: "#2D2D2D",
  },
  foodTipContainer: {
    backgroundColor: "rgba(183,108,253,0.08)",
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
  },
  foodTipText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#B76CFD",
    fontStyle: "italic",
  },
  generalTipsContainer: {
    backgroundColor: "rgba(255,255,255,0.82)",
    borderRadius: 16,
    padding: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "rgba(183,108,253,0.04)",
  },
  generalTipsHeader: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: "#FF5C8D",
    marginBottom: 12,
  },
  generalTipItem: {
    marginBottom: 8,
  },
  generalTipText: {
    fontSize: 15,
    fontFamily: "Poppins-Regular",
    color: "#FF5C8D",
    lineHeight: 22,
  },
  focusLoveContainer: {
    marginBottom: 20,
  },
  focusLoveCategory: {
    backgroundColor: "rgba(255,255,255,0.82)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(183,108,253,0.04)",
  },
  focusLoveCategoryName: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: "#2D2D2D",
    marginBottom: 12,
  },
  focusLoveItemsContainer: {
    marginLeft: 10,
  },
  focusLoveItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  focusLoveBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#B76CFD",
    marginRight: 12,
    marginTop: 8,
  },
  focusLoveItemText: {
    fontSize: 15,
    fontFamily: "Poppins-Regular",
    color: "#2D2D2D",
    lineHeight: 22,
    flex: 1,
  },
  focusLoveTipsContainer: {
    backgroundColor: "rgba(255,255,255,0.82)",
    borderRadius: 16,
    padding: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "rgba(255,92,141,0.1)",
  },
  focusLoveTipsHeader: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: "#FF5C8D",
    marginBottom: 12,
  },
  focusLoveTipItem: {
    marginBottom: 8,
  },
  focusLoveTipText: {
    fontSize: 15,
    fontFamily: "Poppins-Regular",
    color: "#FF5C8D",
    lineHeight: 22,
  },
});
