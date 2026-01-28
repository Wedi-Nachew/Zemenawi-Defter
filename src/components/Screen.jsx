import { StyleSheet } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import theme from "../theme";

const Screen = ({
    children,
    contentContainerStyle,
    style,
    keyboardShouldPersistTaps = "handled",
    extraScrollHeight = 24,
}) => {
    return (
        <SafeAreaView style={[styles.safeArea, style]}>
            <KeyboardAwareScrollView
                contentContainerStyle={[
                    styles.contentContainer,
                    contentContainerStyle,
                ]}
                keyboardShouldPersistTaps={keyboardShouldPersistTaps}
                showsVerticalScrollIndicator={false}
                enableOnAndroid
                extraScrollHeight={extraScrollHeight}
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
        flexGrow: 1,
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
});

export default Screen;
