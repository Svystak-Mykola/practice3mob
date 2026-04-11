import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  NavigationIndependentTree,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  Alert,
  Text,
  TextInput,
  Image,
  Switch,
  StatusBar,
  Modal,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Provider as PaperProvider, MD3DarkTheme, MD3LightTheme } from "react-native-paper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";

const queryClient = new QueryClient();
const AppStateContext = createContext(null);
const AuthStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const INITIAL_ORDERS = [
  { id: "1", orderNumber: "#4200", items: "Маргарита, Пепероні", type: "Доставка", time: "10:00", status: "Готується" },
  { id: "2", orderNumber: "#4201", items: "Чотири сири", type: "Самовивіз", time: "10:15", status: "В черзі" },
  { id: "3", orderNumber: "#4202", items: "М'ясна BBQ", type: "Доставка", time: "10:30", status: "Готується" },
  { id: "4", orderNumber: "#4203", items: "Гавайська", type: "Самовивіз", time: "10:45", status: "Виконано" },
  { id: "5", orderNumber: "#4204", items: "Пепероні Хот", type: "Доставка", time: "11:00", status: "В черзі" },
  { id: "6", orderNumber: "#4205", items: "Карбонара", type: "Самовивіз", time: "11:10", status: "Готується" },
  { id: "7", orderNumber: "#4206", items: "Вегетаріанська", type: "Доставка", time: "11:25", status: "В черзі" },
  { id: "8", orderNumber: "#4207", items: "Сирний бортик", type: "Доставка", time: "11:40", status: "Готується" },
  { id: "9", orderNumber: "#4208", items: "Мексиканська", type: "Самовивіз", time: "12:00", status: "Виконано" },
  { id: "10", orderNumber: "#4209", items: "Діабло", type: "Доставка", time: "12:15", status: "Готується" },
  { id: "11", orderNumber: "#4210", items: "Цезар піца", type: "Доставка", time: "12:30", status: "В черзі" },
  { id: "12", orderNumber: "#4211", items: "Грибна", type: "Самовивіз", time: "12:45", status: "Готується" },
  { id: "13", orderNumber: "#4212", items: "Мисливська", type: "Доставка", time: "13:00", status: "Виконано" },
  { id: "14", orderNumber: "#4213", items: "Маргарита XXL", type: "Доставка", time: "13:15", status: "Готується" },
  { id: "15", orderNumber: "#4214", items: "Чотири сезони", type: "Самовивіз", time: "13:30", status: "В черзі" },
  { id: "16", orderNumber: "#4215", items: "Піца з лососем", type: "Доставка", time: "13:45", status: "Готується" },
  { id: "17", orderNumber: "#4216", items: "Прошуто Фунгі", type: "Доставка", time: "14:00", status: "Виконано" },
  { id: "18", orderNumber: "#4217", items: "Кальцоне", type: "Самовивіз", time: "14:15", status: "Готується" },
  { id: "19", orderNumber: "#4218", items: "Барбекю курка", type: "Доставка", time: "14:30", status: "В черзі" },
  { id: "20", orderNumber: "#4219", items: "Морепродукти", type: "Доставка", time: "14:45", status: "Готується" },
];

function LoginScreen({ navigation }) {
  const { login } = useContext(AppStateContext);
  const [username, setUsername] = useState("brhwtfbrhpizza");
  const [password, setPassword] = useState("h27735311");

  const submitLogin = () => {
    if (username === "brhwtfbrhpizza" && password === "h27735311") {
      login(username);
    } else {
      Alert.alert("Помилка", "Доступ заборонено: невірні дані");
    }
  };

  return (
    <View style={styles.authMain}>
      <Text style={styles.authHeader}>Pizza Orders</Text>
      <TextInput
        placeholder="Логін"
        value={username}
        onChangeText={setUsername}
        style={styles.standardInput}
        placeholderTextColor="#888"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Пароль"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.standardInput}
        placeholderTextColor="#888"
      />
      <TouchableOpacity onPress={submitLogin} style={styles.standardBtn}>
        <Text style={styles.standardBtnText}>Увійти</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Register")} style={styles.linkText}>
        <Text style={{ color: "#ff6347" }}>Створити новий обліковий запис</Text>
      </TouchableOpacity>
    </View>
  );
}

function RegisterScreen({ navigation }) {
  const [rUser, setRUser] = useState("");
  const [rPass, setRPass] = useState("");
  const [rConfirm, setRConfirm] = useState("");

  const handleRegister = () => {
    if (!rUser || !rPass || !rConfirm) {
      Alert.alert("Помилка", "Заповніть всі поля");
      return;
    }
    if (rPass !== rConfirm) {
      Alert.alert("Помилка", "Паролі не збігаються");
      return;
    }
    Alert.alert("Успіх", "Обліковий запис створено (локально)", [
      { text: "OK", onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <View style={styles.authMain}>
      <Text style={styles.authHeader}>Реєстрація</Text>
      
      <Text style={styles.fieldLabel}>Логін</Text>
      <TextInput placeholder="Виберіть логін" onChangeText={setRUser} style={styles.standardInput} />
      
      <Text style={styles.fieldLabel}>Пароль</Text>
      <TextInput placeholder="Пароль" secureTextEntry onChangeText={setRPass} style={styles.standardInput} />
      
      <Text style={styles.fieldLabel}>Підтвердження пароля</Text>
      <TextInput placeholder="Повторіть пароль" secureTextEntry onChangeText={setRConfirm} style={styles.standardInput} />
      
      <TouchableOpacity onPress={handleRegister} style={styles.standardBtn}>
        <Text style={styles.standardBtnText}>Зареєструватися</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.linkText}>
        <Text style={{ color: "#ff6347" }}>Повернутися до входу</Text>
      </TouchableOpacity>
    </View>
  );
}

function UsersScreen() {
  const { darkMode } = useContext(AppStateContext);
  const [userPhotos, setUserPhotos] = useState({});

  const { data: users, isLoading } = useQuery({
    queryKey: ["usersData"],
    queryFn: () => axios.get("https://jsonplaceholder.typicode.com/users").then((res) => res.data),
  });

  const changeAvatar = async (id) => {
    let res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!res.canceled) {
      setUserPhotos((prev) => ({ ...prev, [id]: res.assets[0].uri }));
    }
  };

  if (isLoading) return <ActivityIndicator style={{ flex: 1 }} color="#ff6347" />;

  return (
    <SafeAreaView style={[styles.mainWrap, darkMode ? styles.bgBlack : styles.bgGrey]}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[styles.orderCard, darkMode ? styles.cardDark : styles.cardLight]}>
            <TouchableOpacity onPress={() => changeAvatar(item.id)}>
              <Image
                source={userPhotos[item.id] ? { uri: userPhotos[item.id] } : { uri: `https://ui-avatars.com/api/?name=${item.name}&background=ff6347&color=fff` }}
                style={styles.avatarCircle}
              />
            </TouchableOpacity>
            <View style={styles.orderInfo}>
              <Text style={[styles.cardHeader, darkMode ? styles.textWhite : styles.textBlack]}>{item.name}</Text>
              <Text style={darkMode ? styles.textSubDark : styles.textSubLight}>{item.email}</Text>
              <Text style={{ fontSize: 11, color: "#888", marginTop: 4 }}>ID: {item.id} | {item.phone}</Text>
            </View>
            {userPhotos[item.id] && (
              <TouchableOpacity
                onPress={() => {
                  const next = { ...userPhotos };
                  delete next[item.id];
                  setUserPhotos(next);
                }}
              >
                <Ionicons name="close-circle" size={24} color="red" />
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

function OrdersScreen() {
  const { orders, darkMode, deleteOrder, kitchenMode } = useContext(AppStateContext);
  const [picked, setPicked] = useState(null);
  const [open, setOpen] = useState(false);

  const list = useMemo(() => {
    if (kitchenMode) {
      return orders.filter((o) => o.status === "Готується" || o.status === "В черзі");
    }
    return orders;
  }, [orders, kitchenMode]);

  return (
    <SafeAreaView style={[styles.mainWrap, darkMode ? styles.bgBlack : styles.bgGrey]}>
      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => { setPicked(item); setOpen(true); }}>
            <View style={[styles.orderCard, darkMode ? styles.cardDark : styles.cardLight]}>
              <Image source={{ uri: "https://cdn-icons-png.flaticon.com/512/3595/3595455.png" }} style={styles.pizzaImg} />
              <View style={styles.orderInfo}>
                <Text style={[styles.cardHeader, darkMode ? styles.textWhite : styles.textBlack]}>{item.orderNumber}</Text>
                <Text style={darkMode ? styles.textSubDark : styles.textSubLight}>{item.items}</Text>
                <Text style={{ color: "#ff6347", fontWeight: "bold", fontSize: 13 }}>{item.time}</Text>
                <Text style={{ color: "#888", fontSize: 12 }}>{item.type} | {item.status}</Text>
                <TouchableOpacity onPress={() => deleteOrder(item.id)} style={{ marginTop: 6 }}>
                  <Text style={{ color: "red", fontWeight: "600" }}>Видалити</Text>
                </TouchableOpacity>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#ccc" />
            </View>
          </TouchableOpacity>
        )}
      />
      <Modal visible={open} animationType="slide">
        <View style={[styles.modalContent, { backgroundColor: darkMode ? "#000" : "#f5f5f5" }]}>
          <Text style={[styles.modalTitle, { color: darkMode ? "#fff" : "#000" }]}>Деталі замовлення</Text>
          <View style={styles.modalBody}>
            <Text style={styles.modalText}>Номер: {picked?.orderNumber}</Text>
            <Text style={styles.modalText}>Склад: {picked?.items}</Text>
            <Text style={styles.modalText}>Тип: {picked?.type}</Text>
            <Text style={styles.modalText}>Статус: {picked?.status}</Text>
            <Text style={[styles.modalText, { color: "#ff6347", fontWeight: "bold" }]}>Час: {picked?.time}</Text>
          </View>
          <TouchableOpacity onPress={() => setOpen(false)} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>Закрити</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function AddScreen({ navigation }) {
  const { addOrder, darkMode } = useContext(AppStateContext);
  const [val, setVal] = useState("");

  const handleCreate = () => {
    if (!val) return;
    const newO = {
      id: Date.now().toString(),
      orderNumber: "#" + Math.floor(Math.random() * 8999 + 1000),
      items: val,
      type: "Самовивіз",
      time: "18:30",
      status: "В черзі",
    };
    addOrder(newO);
    setVal("");
    navigation.navigate("Orders");
  };

  return (
    <SafeAreaView style={[styles.mainWrap, darkMode ? styles.bgBlack : styles.bgGrey]}>
      <View style={styles.addSection}>
        <Text style={[styles.sectionTitle, darkMode ? styles.textWhite : styles.textBlack]}>Додати замовлення</Text>
        <TextInput
          placeholder="Назва піци"
          placeholderTextColor={darkMode ? "#777" : "#888"}
          value={val}
          onChangeText={setVal}
          style={[styles.standardInput, darkMode ? styles.inputDark : styles.inputLight, { backgroundColor: darkMode ? "#1c1c1e" : "#fff" }]}
        />
        <TouchableOpacity style={styles.createBtn} onPress={handleCreate}>
          <Text style={styles.createBtnText}>Додати</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 15 }}>
          <Text style={{ color: "#ff6347", textAlign: "center" }}>Скасувати</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function SettingsScreen() {
  const { logout, darkMode, setDarkMode, userName, kitchenMode, setKitchenMode } = useContext(AppStateContext);
  const [myPic, setMyPic] = useState(null);

  const changeMyPic = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) setMyPic(result.assets[0].uri);
  };

  return (
    <SafeAreaView style={[styles.mainWrap, darkMode ? styles.bgBlack : styles.bgGrey]}>
      <ScrollView style={{ flex: 1, padding: 15 }}>
        <Text style={[styles.sectionTitle, darkMode ? styles.textWhite : styles.textBlack]}>Налаштування</Text>
        <View style={styles.profileBox}>
          <TouchableOpacity onPress={changeMyPic}>
            <Image
              source={myPic ? { uri: myPic } : { uri: `https://ui-avatars.com/api/?name=${userName}&background=444&color=fff` }}
              style={styles.profileImg}
            />
            <View style={styles.camIcon}>
              <Ionicons name="camera" size={16} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={[styles.userNameText, darkMode ? styles.textWhite : styles.textBlack]}>{userName}</Text>
        </View>

        <View style={styles.settingsItem}>
          <Text style={[styles.settingsLabel, darkMode ? styles.textWhite : styles.textBlack]}>Режим кухні</Text>
          <Switch value={kitchenMode} onValueChange={setKitchenMode} trackColor={{ true: "#ff6347" }} />
        </View>

        <View style={styles.settingsItem}>
          <Text style={[styles.settingsLabel, darkMode ? styles.textWhite : styles.textBlack]}>Темна тема</Text>
          <Switch value={darkMode} onValueChange={setDarkMode} trackColor={{ true: "#ff6347" }} />
        </View>

        <TouchableOpacity style={[styles.standardBtn, { marginTop: 40 }]} onPress={logout}>
          <Text style={styles.standardBtnText}>Вийти з облікового запису</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

function MainTabs() {
  const { darkMode } = useContext(AppStateContext);
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: { backgroundColor: darkMode ? "#1c1c1e" : "#fff" },
        headerTintColor: darkMode ? "#fff" : "#000",
        tabBarActiveTintColor: "#ff6347",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: { backgroundColor: darkMode ? "#1c1c1e" : "#fff", height: 60 },
        tabBarIcon: ({ color, size }) => {
          let n = route.name === "Orders" ? "list" : route.name === "Add" ? "add-circle" : route.name === "Users" ? "people" : "settings";
          return <Ionicons name={n} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Orders" component={OrdersScreen} options={{ title: "Замовлення" }} />
      <Tab.Screen name="Add" component={AddScreen} options={{ title: "Додати" }} />
      <Tab.Screen name="Users" component={UsersScreen} options={{ title: "Клієнти" }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: "Налаштування" }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [auth, setAuth] = useState(false);
  const [dark, setDark] = useState(false);
  const [orderArr, setOrderArr] = useState(INITIAL_ORDERS);
  const [uName, setUName] = useState("");
  const [kMode, setKMode] = useState(false);

  const contextData = {
    orders: orderArr,
    deleteOrder: (id) => setOrderArr(orderArr.filter((o) => o.id !== id)),
    addOrder: (o) => setOrderArr([o, ...orderArr]),
    darkMode: dark,
    setDarkMode: setDark,
    userName: uName,
    kitchenMode: kMode,
    setKitchenMode: setKMode,
    login: (u) => { setUName(u); setAuth(true); },
    logout: () => setAuth(false),
  };

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AppStateContext.Provider value={contextData}>
          <PaperProvider theme={dark ? MD3DarkTheme : MD3LightTheme}>
            <NavigationIndependentTree>
              <NavigationContainer theme={dark ? DarkThemeConfig : LightThemeConfig}>
                <StatusBar barStyle={dark ? "light-content" : "dark-content"} />
                {auth ? (
                  <MainTabs />
                ) : (
                  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
                    <AuthStack.Screen name="Login" component={LoginScreen} />
                    <AuthStack.Screen name="Register" component={RegisterScreen} />
                  </AuthStack.Navigator>
                )}
              </NavigationContainer>
            </NavigationIndependentTree>
          </PaperProvider>
        </AppStateContext.Provider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  mainWrap: { flex: 1 },
  bgGrey: { backgroundColor: "#f5f5f5" },
  bgBlack: { backgroundColor: "#000" },
  authMain: { flex: 1, justifyContent: "center", padding: 25, backgroundColor: "#f5f5f5" },
  authHeader: { fontSize: 26, textAlign: "center", fontWeight: "bold", marginBottom: 35 },
  standardInput: { borderWidth: 1, borderColor: "#ccc", padding: 14, borderRadius: 10, marginBottom: 15, fontSize: 16 },
  fieldLabel: { fontSize: 14, fontWeight: "600", marginBottom: 5, color: "#333", marginLeft: 4 },
  inputDark: { borderColor: "#444", color: "#fff" },
  inputLight: { borderColor: "#ccc", color: "#000" },
  standardBtn: { backgroundColor: "#ff6347", padding: 16, alignItems: "center", borderRadius: 10 },
  standardBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  linkText: { marginTop: 20, alignItems: "center" },
  orderCard: { flexDirection: "row", padding: 16, marginVertical: 7, marginHorizontal: 15, borderRadius: 12, elevation: 2, alignItems: "center" },
  cardLight: { backgroundColor: "#fff" },
  cardDark: { backgroundColor: "#1c1c1e" },
  pizzaImg: { width: 55, height: 55 },
  avatarCircle: { width: 55, height: 55, borderRadius: 27.5 },
  orderInfo: { marginLeft: 16, flex: 1 },
  cardHeader: { fontWeight: "bold", fontSize: 18 },
  textBlack: { color: "#000" },
  textWhite: { color: "#fff" },
  textSubLight: { color: "#555" },
  textSubDark: { color: "#aaa" },
  modalContent: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  modalTitle: { fontSize: 24, fontWeight: "bold", marginBottom: 25 },
  modalBody: { width: "100%", paddingHorizontal: 30 },
  modalText: { fontSize: 17, marginVertical: 6 },
  closeBtn: { marginTop: 40 },
  closeBtnText: { color: "#ff6347", fontSize: 19, fontWeight: "bold" },
  sectionTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 25 },
  addSection: { flex: 1, justifyContent: "center", padding: 20 },
  createBtn: { backgroundColor: "#ff6347", padding: 18, borderRadius: 12, alignItems: "center" },
  createBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  profileBox: { alignItems: "center", marginVertical: 35 },
  profileImg: { width: 110, height: 110, borderRadius: 55, borderWidth: 2, borderColor: "#ff6347" },
  camIcon: { position: "absolute", bottom: 0, right: 0, backgroundColor: "#ff6347", borderRadius: 15, padding: 6 },
  userNameText: { marginTop: 15, fontSize: 20, fontWeight: "bold" },
  settingsItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 12, width: "100%" },
  settingsLabel: { fontSize: 17 },
  footerInfo: { marginTop: 60, alignItems: "center" },
});

const LightThemeConfig = { ...DefaultTheme, colors: { ...DefaultTheme.colors, primary: "#ff6347", background: "#f5f5f5" } };
const DarkThemeConfig = { ...DarkTheme, colors: { ...DarkTheme.colors, primary: "#ff6347", background: "#000" } };