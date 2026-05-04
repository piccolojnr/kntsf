import { Link } from "expo-router";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <View>
          <Text style={styles.kicker}>Kntsf App</Text>
          <Text style={styles.title}>New Home Screen</Text>
          <Text style={styles.body}>
            If you can see this lime screen with the black card below, the app
            is rendering with plain React Native styles.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Render Check</Text>
          <Text style={styles.cardBody}>
            This replaces the Expo starter layout with a simpler screen so we
            can isolate the blank view issue.
          </Text>

          <Link href="/modal" style={styles.link}>
            Open Modal
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#d9f99d",
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 96,
    paddingBottom: 32,
  },
  kicker: {
    color: "#737373",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  title: {
    marginTop: 12,
    color: "#0a0a0a",
    fontSize: 44,
    fontWeight: "700",
    lineHeight: 50,
  },
  body: {
    marginTop: 16,
    color: "#404040",
    fontSize: 16,
    lineHeight: 28,
  },
  card: {
    borderRadius: 28,
    backgroundColor: "#0a0a0a",
    padding: 24,
  },
  cardTitle: {
    color: "#bef264",
    fontSize: 18,
    fontWeight: "600",
  },
  cardBody: {
    marginTop: 8,
    color: "#e5e5e5",
    fontSize: 14,
    lineHeight: 24,
  },
  link: {
    marginTop: 24,
    borderRadius: 16,
    backgroundColor: "#bef264",
    color: "#0a0a0a",
    fontSize: 14,
    fontWeight: "600",
    overflow: "hidden",
    paddingHorizontal: 16,
    paddingVertical: 16,
    textAlign: "center",
  },
});
