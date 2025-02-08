import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Card, MD3Theme, useTheme } from "react-native-paper";

interface Props {
  title: string;
  highlights: string[];
}

const WelcomeCardsComponent = ({ title, highlights }: Props) => {
  const theme = useTheme();
  const styles = getStyles(theme);

  return (
    <Card
      className="w-full mb-6 p-4 rounded-lg shadow-none"
      style={styles.section}
    >
      <View className="m-4">
        <Text
          className="text-xl font-semibold mb-3"
          style={styles.sectionTitle}
        >
          {title}
        </Text>
        {highlights.map((highlight, index) => (
          <Text
            key={index}
            className="text-sm mb-2 leading-5"
            style={styles.sectionText}
          >
            • {highlight}
          </Text>
        ))}
      </View>
    </Card>
  );
};

const WelcomeCards = React.memo(WelcomeCardsComponent);
WelcomeCards.displayName = "WelcomeCards";

export default WelcomeCards;

const getStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    section: {
      backgroundColor: theme.colors.surfaceVariant,
    },
    sectionTitle: {
      color: theme.colors.primary,
    },
    sectionText: {
      color: theme.colors.onSurface,
    },
  });
