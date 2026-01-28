import { Icon } from "react-native-paper";

const TabBarIcon = ({ name, focused, color, size = 24 }) => {
    return (
        <Icon
            source={focused ? name : `${name}-outline`}
            size={size}
            color={color}
        />
    );
};

export default TabBarIcon;
