import { Text, View } from "react-native";
import { Button, List, RadioButton } from "react-native-paper";
import Screen from "../../src/components/Screen";
import database from "../../src/database/index";
import seedDB from "../../src/database/seed";
import i18n from "../../src/i18n";
import { useLanguage } from "../../src/i18n/LanguageContext";

const SettingsScreen = () => {
    const { language, changeLanguage } = useLanguage();
    return (
        <Screen>
            <Text>{i18n.t("settings.title")}</Text>
            <Button mode="contained" onPress={() => seedDB(database)}>
                {i18n.t("settings.seedDatabase")}
            </Button>
            <Button mode="contained" onPress={() => database.delete()}>
                {i18n.t("settings.deleteDatabase")}
            </Button>
            <View style={{ width: "100%", marginTop: 20 }}>
                <List.Section>
                    <List.Subheader>
                        {i18n.t("settings.language")}
                    </List.Subheader>

                    <RadioButton.Group
                        onValueChange={changeLanguage}
                        value={language}
                    >
                        <RadioButton.Item
                            label={i18n.t("settings.languages.ti")}
                            value="ti"
                        />
                        <RadioButton.Item
                            label={i18n.t("settings.languages.en")}
                            value="en"
                        />
                    </RadioButton.Group>
                </List.Section>
            </View>
            <Text>{Math.random()}</Text>
        </Screen>
    );
};

export default SettingsScreen;
