import { Avatar } from "react-native-paper";
import theme from "../theme";

const InitialAvatar = ({ name, size = 40 }) => {
    const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();

    return (
        <Avatar.Text
            size={size}
            label={initials}
            style={{ backgroundColor: theme.colors.primaryContainer }}
            color={theme.colors.primary}
            labelStyle={{ fontWeight: "bold" }}
        />
    );
};

export default InitialAvatar;
