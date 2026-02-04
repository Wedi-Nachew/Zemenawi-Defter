import { Text } from "react-native";
import { Button } from "react-native-paper";
import Screen from "../../src/components/Screen";
import database from "../../src/database/index";
import seedDB from "../../src/database/seed";

const SettingsScreen = () => {
    return (
        <Screen>
            <Text>This is the Settings Screen</Text>
            <Button mode="contained" onPress={() => seedDB(database)}>
                Seed Database
            </Button>
        </Screen>
    );
};

export default SettingsScreen;
