import { Avatar } from "react-native-paper";
import theme from "../theme";

const InitialAvatar = ({ size = 40 }) => {
    return (
        <Avatar.Icon
            size={size}
            icon="account"
            style={{ backgroundColor: theme.colors.primaryContainer }}
            color={theme.colors.primary}
        />
    );
};

export default InitialAvatar;
