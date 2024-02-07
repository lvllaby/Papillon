import React from 'react';

import {
  View,
  ScrollView,
  Image,
  StatusBar,
  Platform,
} from 'react-native';

import { useTheme } from 'react-native-paper';

import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import * as Linking from 'expo-linking';

import {
  Euro,
  History,
  MessageCircle,
} from 'lucide-react-native';

import packageJson from '../../package.json';
import team from './Team.json';

import GetUIColors from '../../utils/GetUIColors';

import PapillonIcon from '../../components/PapillonIcon';
import NativeList from '../../components/NativeList';
import NativeItem from '../../components/NativeItem';
import NativeText from '../../components/NativeText';

function AboutScreen({ navigation }) {
  const UIColors = GetUIColors();
  const theme = useTheme();

  const openUserLink = (url: string) => openBrowserAsync(url, {
    dismissButtonStyle: 'done',
    presentationStyle: WebBrowserPresentationStyle.PAGE_SHEET,
    controlsColor: UIColors.primary,
  });

  const dataList = [
    {
      title: 'Version de Renard',
      subtitle: `${packageJson.version} ${packageJson.canal}`,
      color: '#888888',
      icon: <History size={24} color="#888888" />,
    },
    {
      title: 'Version de Pawnote',
      subtitle: `${
        packageJson.dependencies['pawnote'].split('^')[1]
      }`,
      color: '#888888',
      icon: <History size={24} color="#888888" />,
    },
    {
      title: 'Dépendances',
      subtitle: `RN: ${
        packageJson.dependencies['react-native'].split('^')[1]
      }, Expo : ${packageJson.dependencies.expo.split('^')[1]}`,
      color: '#888888',
      icon: <History size={24} color="#888888" />,
    }
  ];

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
          header="Communauté"
        >
          <NativeItem
            onPress={() => navigation.navigate('Donors')}
            chevron
            leading={
              <PapillonIcon
                icon={<Euro size={24} color="#bf941d" />}
                color="#bf941d"
                small
              />
            }
          >
            <NativeText heading="h4">
              Donateurs
            </NativeText>
            <NativeText heading="p2">
              Voir la liste des donateurs
            </NativeText>
          </NativeItem>
          <NativeItem
            leading={
              <PapillonIcon
                icon={<MessageCircle size={24} color="#565EA3" />}
                color="#565EA3"
                small
              />
            }
            chevron
            onPress={() => Linking.openURL('https://discord.getpapillon.xyz/')}
          >
            <NativeText heading="h4">
              Serveur Discord
            </NativeText>
            <NativeText heading="p2">
              Rejoindre le serveur de Papillon
            </NativeText>
          </NativeItem>
        </NativeList>

        {Platform.OS !== 'ios' ? (
          <NativeList>
            <NativeItem
              leading={
                <PapillonIcon
                  icon={<Euro size={24} color="#c9a710" />}
                  color="#c9a710"
                  small
                />
              }
              chevron
              onPress={() => Linking.openURL('https://ko-fi.com/thepapillonapp')}
            >
              <NativeText heading="h4">
                Donner 1€ (2 cafés) à l'équipe
              </NativeText>
              <NativeText heading="p2">
                Votre don permet de financer les serveurs et le développement.
              </NativeText>
              <NativeText heading="subtitle2">
                Renard est 100% libre et indépendant & créé par des élèves.
              </NativeText>
            </NativeItem>
          </NativeList>
        ) : <View /> }

        {team.team.map((team, index) => (
          <NativeList
            key={index}
            inset
            header={team.name}
          >
            
            {team.member.map((item, index) => (
              <NativeItem
                key={index}
                leading={
                  <Image
                    source={{ uri: item.avatar }}
                    style={{ width: 38, height: 38, borderRadius: 12 }}
                  />
                }
                chevron
                onPress={() => openUserLink(item.link)}
              >
                <NativeText heading="h4">
                  {item.name}
                </NativeText>
                <NativeText heading="p2">
                  {item.role}
                </NativeText>
              </NativeItem>
            ))}
          </NativeList>
        ))}
        

        <NativeList
          inset
          header="Informations sur l'app"
        >
          <NativeItem
            trailing={
              <NativeText heading="p2">
                {packageJson.version} {packageJson.canal}
              </NativeText>
            }
            onPress={() => navigation.navigate('ChangelogScreen')}
          >
            <NativeText heading="h4">
                Version de Renard
            </NativeText>
          </NativeItem>
          <NativeItem
            trailing={
              <NativeText heading="p2">
                {packageJson.dependencies['pawnote'].split('^')[1]}
              </NativeText>
            }
            onPress={() => navigation.navigate('NetworkLoggerScreen')}
          >
            <NativeText heading="h4">
              Version de Pawnote
            </NativeText>
          </NativeItem>
          <NativeItem
            trailing={
              <NativeText heading="p2">
                {`RN: ${
                  packageJson.dependencies['react-native'].split('^')[1]
                }, Expo : ${packageJson.dependencies.expo.split('^')[1]}`}
              </NativeText>
            }
          >
            <NativeText heading="h4">
              Dépendances
            </NativeText>
          </NativeItem>
        </NativeList>
      </ScrollView>
    </View>
  );
}

export default AboutScreen;
