import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import theme from "../theme";

const ScrollScreen = ({ children, style }) => {
    return (
        <SafeAreaView edges={["left", "right"]} style={styles.safeArea}>
            <ScrollView
                style={{ padding: 0 }}
                contentContainerStyle={[styles.content, style]}
                showsVerticalScrollIndicator={false}
            >
                {children}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },

    content: {
        padding: 16,
        gap: 12,
    },
});

export default ScrollScreen;
