import { StyleSheet, View } from "react-native";
import { Card, Icon, Text } from "react-native-paper";
import theme from "../theme";

const StatCard = ({ label, value, icon, color }) => {
    return (
        <Card mode="elevated" style={styles.card}>
            <Card.Content style={styles.content}>
                <View style={styles.header}>
                    <Text variant="bodySmall" style={styles.label}>
                        {label}
                    </Text>
                    <View
                        style={[
                            styles.iconContainer,
                            { backgroundColor: color + "15" },
                        ]}
                    >
                        <Icon source={icon} size={24} color={color} />
                    </View>
                </View>
                <Text variant="headlineMedium" style={[styles.value]}>
                    {value}
                </Text>
            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: theme.colors.surface,
        elevation: 2,
    },
    content: {
        padding: 12,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    label: {
        color: theme.colors.text,
    },
    iconContainer: {
        padding: 10,
        borderRadius: 50,
        marginBottom: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    value: {
        fontWeight: "bold",
        marginBottom: 4,
        color: theme.colors.text,
    },
});

export default StatCard;
