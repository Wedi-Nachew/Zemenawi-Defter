import { StyleSheet } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import theme from "../theme";

const FormScreen = ({
    children,
    keyboardShouldPersistTaps = "handled",
    extraScrollHeight = 24,
    style,
}) => {
    return (
        <SafeAreaView edges={["left", "right"]} style={[styles.safeArea]}>
            <KeyboardAwareScrollView
                contentContainerStyle={[styles.contentContainer, style]}
                keyboardShouldPersistTaps={keyboardShouldPersistTaps}
                showsVerticalScrollIndicator={false}
                enableOnAndroid
                extraScrollHeight={extraScrollHeight}
                style={{ flex: 1 }}
            >
                {children}
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    contentContainer: {
        padding: 16,
        gap: 12,
    },
});

export default FormScreen;
