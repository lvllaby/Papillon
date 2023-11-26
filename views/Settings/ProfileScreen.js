import * as React from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  Image,
  StatusBar,
  Platform,
  Alert,
  Keyboard,
} from 'react-native';
import {
  useTheme,
  Button as PaperButton,
  Text,
  Portal,
  Dialog,
  TextInput,
} from 'react-native-paper';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { ContextMenuButton } from 'react-native-ios-context-menu';
import * as Clipboard from 'expo-clipboard';

import * as ImagePicker from 'expo-image-picker';
import * as LocalAuthentication from 'expo-local-authentication';

import { useEffect } from 'react';

import {
  Mail,
  Phone,
  Edit,
  Pencil,
  Trash2,
  Contact2,
  Lock,
  LogOut,
  UserCircle2,
} from 'lucide-react-native';

import ListItem from '../../components/ListItem';
import PapillonIcon from '../../components/PapillonIcon';

import GetUIColors from '../../utils/GetUIColors';
import { useAppContext } from '../../utils/AppContext';

import NativeList from '../../components/NativeList';
import NativeItem from '../../components/NativeItem';
import NativeText from '../../components/NativeText';

function ProfileScreen({ route, navigation }) {
  const theme = useTheme();
  const UIColors = GetUIColors();
  const isModal = route.params.isModal;

  const [userData, setUserData] = React.useState({});
  const [profilePicture, setProfilePicture] = React.useState('');

  const [shownINE, setShownINE] = React.useState('');

  const appctx = useAppContext();

  useEffect(() => {
    appctx.dataprovider.getUser(false).then((result) => {
      setUserData(result);
      setProfilePicture(result.profile_picture);

      if (Platform.OS === 'android') {
        // setShownINE(userData.ine);
      }
    });
  }, []);

  function LogOutAction() {
    Alert.alert('Déconnexion', 'Êtes-vous sûr de vouloir vous déconnecter ?', [
      {
        text: 'Annuler',
        style: 'cancel',
      },
      {
        text: 'Déconnexion',
        style: 'destructive',
        onPress: async () => {
          try {
            AsyncStorage.getItem('credentials').then((result) => {
              const res = JSON.parse(result || 'null');
              if (res)
                AsyncStorage.setItem(
                  'old_login',
                  JSON.stringify({ url: res.url })
                );
            });
            if (appctx.dataprovider.service === 'Skolengo')
              appctx.dataprovider.skolengoInstance?.skolengoDisconnect();
          } catch (e) {
            /* empty */
          }

          AsyncStorage.clear();

          appctx.setLoggedIn(false);
          navigation.popToTop();
        },
      },
    ]);
  }

  async function getINE() {
    if (shownINE === '') {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Veuillez vous authentifier pour afficher votre INE',
        cancelLabel: 'Annuler',
        disableDeviceFallback: true,
      });

      if (result.success) {
        setShownINE(userData.ine);
      }
    } else {
      setShownINE('');
    }
  }

  function showIneIfAndroid() {
    if (Platform.OS === 'android') {
      getINE();
    }
  }

  async function EditProfilePicture() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      AsyncStorage.getItem('old_profile_picture').then((res) => {
        if (res === null || res === '') {
          if (
            userData.profile_picture !== null &&
            userData.profile_picture !== ''
          ) {
            AsyncStorage.setItem(
              'old_profile_picture',
              userData.profile_picture
            );
          } else {
            AsyncStorage.setItem('old_profile_picture', '');
          }
        }
      });

      setProfilePicture(result.assets[0].uri);
      AsyncStorage.setItem('custom_profile_picture', result.assets[0].uri);
    }
  }

  function ResetProfilePic() {
    Alert.alert(
      'Réinitialiser la photo de profil',
      'Êtes-vous sûr de vouloir réinitialiser la photo de profil ?',
      [
        {
          text: 'Réinitialiser',
          isPreferred: true,
          onPress: () => FullResetProfilePic(),
          style: 'destructive',
        },
        { text: 'Annuler', style: 'cancel' },
      ]
    );
  }

  function FullResetProfilePic() {
    AsyncStorage.removeItem('custom_profile_picture');
    AsyncStorage.getItem('old_profile_picture').then((result) => {
      setProfilePicture(result);
    });
  }

  function ResetName() {
    Alert.alert(
      'Réinitialiser le nom utilisé',
      'Êtes-vous sûr de vouloir réinitialiser le nom utilisé ?',
      [
        {
          text: 'Réinitialiser',
          isPreferred: true,
          onPress: () => FullResetName(),
          style: 'destructive',
        },
        { text: 'Annuler', style: 'cancel' },
      ]
    );
  }

  function FullResetName() {
    AsyncStorage.getItem('old_name').then((result) => {
      if (result === null || '') return;
      setUserData({ ...userData, name: result });
      AsyncStorage.removeItem('custom_name');
    });
  }

  const [androidNamePromptVisible, setAndroidNamePromptVisible] =
    React.useState(false);
  const [androidNamePrompt, setAndroidNamePrompt] = React.useState(false);

  function EditName() {
    setAndroidNamePrompt(userData ? userData.name : '');

    if (Platform.OS === 'ios') {
      Alert.prompt(
        'Modifier le nom utilisé',
        "Utilisez un prénom ou un pseudonyme différent dans l'app Papillon",
        [
          {
            text: 'Modifier',
            isPreferred: true,
            onPress: (name) => ModifyName(name),
          },
          {
            text: 'Réinitialiser',
            style: 'destructive',
            onPress: () => ResetName(),
          },
          { text: 'Annuler', style: 'cancel' },
        ],
        'plain-text',
        userData ? userData.name : ''
      );
    } else {
      setAndroidNamePromptVisible(true);
    }
  }

  function ModifyName(name) {
    AsyncStorage.getItem('custom_name').then((result) => {
      if (result === null || '') {
        AsyncStorage.setItem('old_name', userData.name);
      }
    });

    AsyncStorage.setItem('custom_name', name);
    setUserData({ ...userData, name });
  }

  const [bottom, setBottom] = React.useState(0);

  React.useEffect(() => {
    function onKeyboardChange(e) {
      setBottom(e.endCoordinates.height / 2);
    }

    if (Platform.OS === 'ios') {
      const subscription = Keyboard.addListener(
        'keyboardWillChangeFrame',
        onKeyboardChange
      );
      return () => subscription.remove();
    }

    const subscriptions = [
      Keyboard.addListener('keyboardDidHide', onKeyboardChange),
      Keyboard.addListener('keyboardDidShow', onKeyboardChange),
    ];
    return () => subscriptions.forEach((subscription) => subscription.remove());
  }, []);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: UIColors.modalBackground }]}
    >
      {Platform.OS === 'ios' ? (
        <StatusBar animated barStyle="light-content" />
      ) : (
        <StatusBar
          animated
          barStyle={theme.dark ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
        />
      )}

      <Portal>
        <Dialog
          style={{ bottom }}
          visible={androidNamePromptVisible}
          onDismiss={() => setAndroidNamePromptVisible(false)}
        >
          <Dialog.Title>Modifier le nom utilisé</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Entrez un prénom ou un pseudonyme"
              value={androidNamePrompt}
              onChangeText={(text) => setAndroidNamePrompt(text)}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <PaperButton onPress={() => setAndroidNamePromptVisible(false)}>
              Annuler
            </PaperButton>
            <PaperButton
              onPress={() => {
                ResetName();
                setAndroidNamePromptVisible(false);
              }}
            >
              Réinitialiser
            </PaperButton>
            <PaperButton
              onPress={() => {
                ModifyName(androidNamePrompt);
                setAndroidNamePromptVisible(false);
              }}
            >
              Modifier
            </PaperButton>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <View style={styles.profileContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.profilePictureContainer,
            { opacity: pressed ? 0.6 : 1 },
          ]}
          onPress={() => EditProfilePicture()}
        >
          {profilePicture && profilePicture !== '' ? (
            <Image
              style={styles.profilePicture}
              source={{ uri: profilePicture }}
            />
          ) : (
            <UserCircle2
              size={86}
              color={theme.dark ? '#fff' : '#000'}
              style={styles.profilePicture}
            />
          )}

          <View style={[styles.profilePictureEdit]}>
            <Pencil size={18} color="#fff" />
          </View>
        </Pressable>

        <Text style={styles.name}>{userData?.name}</Text>
        {[userData.class, userData.establishment].filter((e) => e).length >
          0 && (
          <Text style={styles.userData}>
            {[userData.class, userData.establishment]
              .filter((e) => e)
              .join(' - ')}
          </Text>
        )}
      </View>

      <NativeList
        inset
        header="Données de contact"
      >
        {userData.email !== '' ? (
          <NativeItem
            leading={<Mail size={24} color="#565EA3" />}
          >
            <NativeText heading="h4">
              Adresse e-mail
            </NativeText>
            <NativeText heading="p2">
              {userData.email}
            </NativeText>
          </NativeItem>
        ) : null}

        {userData.phone !== '' && userData.phone !== '+' ? (
          <NativeItem
            leading={<Phone size={24} color="#B9670F" />}
          >
            <NativeText heading="h4">
              Téléphone
            </NativeText>
            <NativeText heading="p2">
              {userData.phone}
            </NativeText>
          </NativeItem>
        ) : null}

        {typeof userData?.ine === 'string' && userData?.ine?.length > 0 ? (
          <NativeItem
            leading={<Contact2 size={24} color="#0065A8" />}
            onPress={() => getINE()}
            trailing={ shownINE === '' &&
              <Lock size={16} color={UIColors.text} style={{ opacity: 0.6 }} />
            }
          >
            <NativeText heading="h4">
              Numéro INE
            </NativeText>
            <NativeText heading="p2">
              {shownINE ? shownINE : 'Appuyez pour révéler'}
            </NativeText>
          </NativeItem>
        ) : null}
      </NativeList>

      <NativeList
        inset
        header="Options"
      >
        <NativeItem
          leading={<Edit size={24} color="#29947A" />}
          onPress={() => EditName()}
        >
          <NativeText heading="h4">
            Modifier le nom utilisé
          </NativeText>
          <NativeText heading="p2">
            Utilisez un prénom ou un pseudonyme différent dans l'app Papillon
          </NativeText>
        </NativeItem>

        <NativeItem
          leading={<Trash2 size={24} color="#c44b1b" />}
          onPress={() => ResetProfilePic()}
        >
          <NativeText heading="h4">
            Réinitialiser la photo de profil
          </NativeText>
          <NativeText heading="p2">
            Utilise la photo de profil par défaut
          </NativeText>
        </NativeItem>
      </NativeList>
      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  profileContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 32,
  },
  profilePicture: {
    width: 86,
    height: 86,
    borderRadius: 100,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#00000020',
  },
  name: {
    fontSize: 22,
    fontFamily: 'Papillon-Semibold',
    marginBottom: 4,
  },
  userData: {
    fontSize: 15,
    marginBottom: -10,
    opacity: 0.6,
    marginHorizontal: 20,
    textAlign: 'center',
  },
  ListTitle: {
    paddingLeft: 29,
    fontSize: 15,
    fontFamily: 'Papillon-Medium',
    opacity: 0.5,
  },
  ListTitle2: {
    paddingLeft: 15,
    fontSize: 15,
    fontFamily: 'Papillon-Medium',
    opacity: 0.5,
  },
  profilePictureEdit: {
    position: 'absolute',
    bottom: 14,
    right: -3,
    backgroundColor: '#29947A',
    borderRadius: 100,
    padding: 6,
    elevation: 2,
    borderColor: '#ffffff20',
    borderWidth: 1,
  },

  infoLocked: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#B42828',
    borderRadius: 70,
    padding: 4,
  },
});

export default ProfileScreen;
