import { Text } from "react-native";
import { Button } from "react-native-paper";
import Screen from "../../src/components/Screen";
import seedDB from "../../src/database/seed";

const SettingsScreen = () => {
    return (
        <Screen>
            <Text>This is the Settings Screen</Text>
            <Button mode="contained" onPress={() => seedDB()}>
                Seed Database
            </Button>
        </Screen>
    );
};

export default SettingsScreen;
