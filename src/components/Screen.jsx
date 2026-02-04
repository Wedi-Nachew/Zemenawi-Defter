import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import theme from "../theme";

const Screen = ({ children, style }) => {
    return (
        <SafeAreaView edges={["left", "right"]} style={[styles.safeArea]}>
            <View style={[styles.container, style]}>{children}</View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    container: {
        flex: 1,
        paddingHorizontal: 16,
    },
});

export default Screen;
