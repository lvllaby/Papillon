import * as React from "react"
import { Alert, Platform, ScrollView, StatusBar, View } from "react-native";

import { useTheme } from 'react-native-paper';
import GetUIColors from '../../../utils/GetUIColors';
import NativeList from "../../../components/NativeList";
import ListItem from "../../../components/ListItem";
import PapillonIcon from "../../../components/PapillonIcon";

import { Network, ScrollText, Database } from 'lucide-react-native';

function DevSettings({ navigation }) {
    const theme = useTheme();
    const UIColors = GetUIColors();
    return (
        <View style={{ flex: 1 }}>
            {Platform.OS === 'ios' ? (
                <StatusBar animated barStyle="light-content" />
            ) : (
                <StatusBar
                    animated
                    barStyle={theme.dark ? 'light-content' : 'dark-content'}
                    backgroundColor="transparent"
                />
            )}
            <ScrollView
                style={{ backgroundColor: UIColors.modalBackground }}
                contentInsetAdjustmentBehavior="automatic"
            >
                <NativeList
                    inset
                    header="Menus"
                >
                    <ListItem
                        title="Déboggeur réseau"
                        subtitle="Affiche les requêtes réseau"
                        color="#FFAA00"
                        left={
                        <PapillonIcon
                            icon={<Network size={24} color="#fff" />}
                            color="#FFAA00"
                            fill
                            small
                        />
                        }
                        onPress={() => navigation.navigate('NetworkLoggerScreen')}
                    />
                    <ListItem
                        title="Logs"
                        subtitle="Affiche les logs de l'application"
                        color="#00AAFF"
                        left={
                        <PapillonIcon
                            icon={<ScrollText size={24} color="#fff" />}
                            color="#00AAFF"
                            fill
                            small
                        />
                        }
                        onPress={() => navigation.navigate('LogsScreen')}
                    />
                    <ListItem
                        title="Local storage"
                        subtitle="Affiche le local storage de l'application"
                        color="#7F00FF"
                        left={
                        <PapillonIcon
                            icon={<Database size={24} color="#fff" />}
                            color="#7F00FF"
                            fill
                            small
                        />
                        }
                        onPress={() => {
                            Alert.alert(
                                "Avertissement de sécurité",
                                "Le local storage contient vos informations d'identification sous la forme de token. Il contient également vos données personnelles. Faites donc très attention aux informations que vous fournissez en faisant une capture d'écran.\n\nLes informations sensibles sont indiqués, veillez-donc à les masquer.\n\nL'équipe Papillon ne saurait être tenue responsable de tout bug lié à la manipulation du local storage.",
                                [{
                                    text: "Annuler",
                                    style: "cancel"
                                },
                                {
                                    text: "Continuer",
                                    onPress: () => navigation.navigate('LocalStorageViewScreen')
                                }]
                            )
                        }}
                    />
                </NativeList>
            </ScrollView>
        </View>
    )
}

export default DevSettings;