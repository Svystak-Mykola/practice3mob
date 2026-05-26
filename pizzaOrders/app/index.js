import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  NavigationIndependentTree,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { createContext, useContext, useState, useMemo, useEffect, useRef } from "react";
import {
  Animated,
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
} from "react-native";
import { Provider as PaperProvider, MD3DarkTheme, MD3LightTheme } from "react-native-paper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEYS = {
  USER: "@auth_user_data",
  ORDERS: "@global_pizza_orders",
  THEME: "@app_theme_mode",
  PERSIST_ENABLED: "@orders_persistence_enabled",
  AVATARS: "@client_avatars_data",
  MY_PIC: "@user_profile_pic"
};

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
    if (username === "brhwtfbrhpizza" && password === "h27735311") login(username);
    else Alert.alert("Помилка", "Доступ заборонено");
  };
  return (
    <View style={styles.authMain}>
      <Text style={styles.authHeader}>Pizza Orders</Text>
      <TextInput placeholder="Логін" value={username} onChangeText={setUsername} style={styles.standardInput} autoCapitalize="none" />
      <TextInput placeholder="Пароль" secureTextEntry value={password} onChangeText={setPassword} style={styles.standardInput} />
      <TouchableOpacity onPress={submitLogin} style={styles.standardBtn}><Text style={styles.standardBtnText}>Увійти</Text></TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Register")} style={styles.linkText}><Text style={{ color: "#ff6347" }}>Реєстрація</Text></TouchableOpacity>
    </View>
  );
}

function RegisterScreen({ navigation }) {
  return (
    <View style={styles.authMain}>
      <Text style={styles.authHeader}>Реєстрація</Text>
      <TextInput placeholder="Логін" style={styles.standardInput} />
      <TextInput placeholder="Пароль" secureTextEntry style={styles.standardInput} />
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.standardBtn}><Text style={styles.standardBtnText}>Створити</Text></TouchableOpacity>
    </View>
  );
}

function UsersScreen() {
  const { darkMode, userPhotos, changeAvatar } = useContext(AppStateContext);
  const { data: users, isLoading } = useQuery({
    queryKey: ["usersData"],
    queryFn: () => axios.get("https://jsonplaceholder.typicode.com/users").then((res) => res.data),
  });
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
          </View>
        )}
      />
    </SafeAreaView>
  );
}

function OrdersScreen() {
  const { orders, darkMode, deleteOrder, kitchenMode, themeAnim } = useContext(AppStateContext);
  const [picked, setPicked] = useState(null);
  const [open, setOpen] = useState(false);
  const list = useMemo(() => {
    if (kitchenMode) return orders.filter((o) => o.status === "Готується" || o.status === "В черзі");
    return orders;
  }, [orders, kitchenMode]);

  const itemAnimations = useRef([]);
  const pressAnimations = useRef({});
  const headerAnim = useRef(new Animated.Value(0)).current;
  const modalAnim = useRef(new Animated.Value(0)).current;

  if (itemAnimations.current.length < list.length) {
    itemAnimations.current = list.map((_, i) => itemAnimations.current[i] || new Animated.Value(0));
  }

  useEffect(() => {
    Animated.stagger(
      70,
      itemAnimations.current.map((anim) =>
        Animated.spring(anim, { toValue: 1, useNativeDriver: true, friction: 12, tension: 80 })
      )
    ).start();
  }, [list.length]);

  useEffect(() => {
    Animated.spring(headerAnim, { toValue: 1, useNativeDriver: true, friction: 14, tension: 80 }).start();
  }, []);

  useEffect(() => {
    Animated.spring(modalAnim, { toValue: open ? 1 : 0, useNativeDriver: true, friction: 10, tension: 120 }).start();
  }, [open]);

  const bgColor = themeAnim.interpolate({ inputRange: [0, 1], outputRange: ["#f5f5f5", "#000"] });

  return (
    <Animated.View style={[styles.mainWrap, { backgroundColor: bgColor }]}> 
      <SafeAreaView style={styles.mainWrap}>
        <Animated.View style={{ opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-18, 0] }) }] }}>
          <Text style={[styles.sectionTitle, darkMode ? styles.textWhite : styles.textBlack, { marginHorizontal: 15 }]}>Список замовлень</Text>
        </Animated.View>
        <FlatList
          data={list}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => {
            const anim = itemAnimations.current[index] || new Animated.Value(1);
            const pressAnim = pressAnimations.current[item.id] || (pressAnimations.current[item.id] = new Animated.Value(1));
            const animatedStyle = {
              opacity: anim,
              transform: [
                { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [22, 0] }) },
                { scale: pressAnim },
              ],
            };

            return (
              <TouchableOpacity
                activeOpacity={1}
                onPressIn={() => Animated.spring(pressAnim, { toValue: 0.96, useNativeDriver: true, friction: 12, tension: 120 }).start()}
                onPressOut={() => Animated.spring(pressAnim, { toValue: 1, useNativeDriver: true, friction: 12, tension: 120 }).start()}
                onPress={() => { setPicked(item); setOpen(true); }}
              >
                <Animated.View style={[styles.orderCard, darkMode ? styles.cardDark : styles.cardLight, animatedStyle]}>
                  <Image source={{ uri: "https://cdn-icons-png.flaticon.com/512/3595/3595455.png" }} style={styles.pizzaImg} />
                  <View style={styles.orderInfo}>
                    <Text style={[styles.cardHeader, darkMode ? styles.textWhite : styles.textBlack]}>{item.orderNumber}</Text>
                    <Text style={darkMode ? styles.textSubDark : styles.textSubLight}>{item.items}</Text>
                    <Text style={{ color: "#ff6347", fontWeight: "bold", fontSize: 13 }}>{item.time}</Text>
                    <TouchableOpacity onPress={() => deleteOrder(item.id)} style={{ marginTop: 6 }}>
                      <Text style={{ color: "red", fontWeight: "600" }}>Видалити</Text>
                    </TouchableOpacity>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#ccc" />
                </Animated.View>
              </TouchableOpacity>
            );
          }}
        />
      </SafeAreaView>
      <Modal visible={open} transparent animationType="fade">
        <Animated.View style={[styles.modalBackdrop, { opacity: modalAnim }]} />
        <Animated.View style={[styles.modalContent, {
          backgroundColor: darkMode ? "#111" : "#f5f5f5",
          opacity: modalAnim,
          transform: [{ scale: modalAnim.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) }],
        }]}
        >
          <Text style={[styles.modalTitle, { color: darkMode ? "#fff" : "#000" }]}>Деталі замовлення</Text>
          <View style={styles.modalBody}>
            <Text style={[styles.modalText, { color: darkMode ? "#fff" : "#000" }]}>Склад: {picked?.items}</Text>
            <Text style={[styles.modalText, { color: "#ff6347", fontWeight: "bold" }]}>Час: {picked?.time}</Text>
          </View>
          <TouchableOpacity onPress={() => setOpen(false)} style={styles.closeBtn}><Text style={styles.closeBtnText}>Закрити</Text></TouchableOpacity>
        </Animated.View>
      </Modal>
    </Animated.View>
  );
}

function AddScreen({ navigation }) {
  const { addOrder, darkMode } = useContext(AppStateContext);
  const [val, setVal] = useState("");
  const handleCreate = () => {
    if (!val) return;
    addOrder({ id: Date.now().toString(), orderNumber: "#" + Math.floor(Math.random() * 8999 + 1000), items: val, type: "Самовивіз", time: "18:30", status: "В черзі" });
    setVal("");
    navigation.navigate("Orders");
  };
  return (
    <SafeAreaView style={[styles.mainWrap, darkMode ? styles.bgBlack : styles.bgGrey]}>
      <View style={styles.addSection}>
        <Text style={[styles.sectionTitle, darkMode ? styles.textWhite : styles.textBlack]}>Додати замовлення</Text>
        <TextInput placeholder="Назва піци" placeholderTextColor="#888" value={val} onChangeText={setVal} style={[styles.standardInput, darkMode && { color: '#fff', borderColor: '#444' }]} />
        <TouchableOpacity style={styles.createBtn} onPress={handleCreate}><Text style={styles.createBtnText}>Додати</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function SettingsScreen() {
  const { logout, darkMode, setDarkMode, userName, kitchenMode, setKitchenMode, persistOrders, setPersistOrders, myPic, changeMyPic, themeAnim } = useContext(AppStateContext);
  const bgColor = themeAnim.interpolate({ inputRange: [0, 1], outputRange: ["#f5f5f5", "#000"] });
  const textColor = themeAnim.interpolate({ inputRange: [0, 1], outputRange: ["#000", "#fff"] });

  return (
    <Animated.View style={[styles.mainWrap, { backgroundColor: bgColor }]}> 
      <Animated.ScrollView style={{ flex: 1, padding: 15 }} contentContainerStyle={{ paddingBottom: 40 }}>
        <Animated.Text style={[styles.sectionTitle, { color: textColor }]}>Налаштування</Animated.Text>
        <View style={styles.profileBox}>
          <TouchableOpacity onPress={changeMyPic}>
            <Image 
              source={myPic ? { uri: myPic } : { uri: `https://ui-avatars.com/api/?name=${userName}&background=444&color=fff` }} 
              style={styles.profileImg} 
            />
            <View style={styles.camIcon}><Ionicons name="camera" size={16} color="#fff" /></View>
          </TouchableOpacity>
          <Animated.Text style={[styles.userNameText, { color: textColor }]}>{userName}</Animated.Text>
        </View>
        <View style={styles.settingsItem}>
          <Animated.Text style={[styles.settingsLabel, { color: textColor }]}>Режим кухні</Animated.Text>
          <Switch value={kitchenMode} onValueChange={setKitchenMode} />
        </View>
        <View style={styles.settingsItem}>
          <Animated.Text style={[styles.settingsLabel, { color: textColor }]}>Темна тема</Animated.Text>
          <Switch value={darkMode} onValueChange={setDarkMode} />
        </View>
        <View style={[styles.settingsItem, { marginTop: 20, borderTopWidth: 1, borderColor: '#333', paddingTop: 20 }]}> 
          <View style={{ flex: 1 }}>
            <Animated.Text style={[styles.settingsLabel, { color: textColor }]}>Зберігати постійно</Animated.Text>
            <Text style={{ fontSize: 12, color: '#888' }}>Якщо OFF — нові замовлення зникнуть після перезапуску</Text>
          </View>
          <Switch value={persistOrders} onValueChange={setPersistOrders} />
        </View>
        <TouchableOpacity style={[styles.standardBtn, { marginTop: 40, backgroundColor: '#444' }]} onPress={logout}><Text style={styles.standardBtnText}>Вийти</Text></TouchableOpacity>
      </Animated.ScrollView>
    </Animated.View>
  );
}

function MainTabs() {
  const { darkMode } = useContext(AppStateContext);
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: darkMode ? "#1c1c1e" : "#fff" },
        headerTintColor: darkMode ? "#fff" : "#000",
        tabBarActiveTintColor: "#ff6347",
        tabBarStyle: { backgroundColor: darkMode ? "#1c1c1e" : "#fff" },
        tabBarIcon: ({ color, size }) => {
          let n = route.name === "Orders" ? "list" : route.name === "Add" ? "add-circle" : route.name === "Users" ? "people" : "settings";
          return <Ionicons name={n} size={size} color={color} />;
        },
      })}>
      <Tab.Screen name="Orders" component={OrdersScreen} options={{ title: "Замовлення" }} />
      <Tab.Screen name="Add" component={AddScreen} options={{ title: "Додати" }} />
      <Tab.Screen name="Users" component={UsersScreen} options={{ title: "Клієнти" }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: "Опції" }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [auth, setAuth] = useState(false);
  const [dark, setDark] = useState(false);
  const [orderArr, setOrderArr] = useState(INITIAL_ORDERS);
  const [uName, setUName] = useState("");
  const [kMode, setKMode] = useState(false);
  const [persistOrders, setPersistOrders] = useState(false);
  const [userPhotos, setUserPhotos] = useState({});
  const [myPic, setMyPic] = useState(null);
  const themeAnim = useRef(new Animated.Value(dark ? 1 : 0)).current;

  useEffect(() => {
    const init = async () => {
      try {
        const [u, t, p, o, a, m] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.USER),
          AsyncStorage.getItem(STORAGE_KEYS.THEME),
          AsyncStorage.getItem(STORAGE_KEYS.PERSIST_ENABLED),
          AsyncStorage.getItem(STORAGE_KEYS.ORDERS),
          AsyncStorage.getItem(STORAGE_KEYS.AVATARS),
          AsyncStorage.getItem(STORAGE_KEYS.MY_PIC)
        ]);
        if (u) { setUName(u); setAuth(true); }
        if (t !== null) setDark(t === "true");
        if (a) setUserPhotos(JSON.parse(a));
        if (m) setMyPic(m);
        
        const isP = p === "true";
        setPersistOrders(isP);
        
        // Пофікшено: завжди вантажимо дефолтні, а якщо кнопка ON — додаємо збережені
        if (isP && o) {
          const saved = JSON.parse(o);
          setOrderArr(saved);
        } else {
          setOrderArr(INITIAL_ORDERS);
        }
      } finally { setIsReady(true); }
    };
    init();
  }, []);

  useEffect(() => {
    if (!isReady) return;
    AsyncStorage.setItem(STORAGE_KEYS.THEME, dark.toString());
    AsyncStorage.setItem(STORAGE_KEYS.PERSIST_ENABLED, persistOrders.toString());
    AsyncStorage.setItem(STORAGE_KEYS.AVATARS, JSON.stringify(userPhotos));
    if (myPic) AsyncStorage.setItem(STORAGE_KEYS.MY_PIC, myPic);
    
    if (persistOrders) {
      AsyncStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orderArr));
    }
  }, [dark, persistOrders, orderArr, userPhotos, myPic, isReady]);

  useEffect(() => {
    Animated.timing(themeAnim, { toValue: dark ? 1 : 0, duration: 400, useNativeDriver: false }).start();
  }, [dark]);

  const changeAvatar = async (id) => {
    let res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.5 });
    if (!res.canceled) setUserPhotos(prev => ({ ...prev, [id]: res.assets[0].uri }));
  };

  const changeMyPic = async () => {
    let res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.5 });
    if (!res.canceled) setMyPic(res.assets[0].uri);
  };

  const contextData = {
    orders: orderArr,
    deleteOrder: (id) => setOrderArr(orderArr.filter(o => o.id !== id)),
    addOrder: (o) => setOrderArr([o, ...orderArr]),
    darkMode: dark,
    setDarkMode: setDark,
    themeAnim,
    userName: uName,
    kitchenMode: kMode,
    setKitchenMode: setKMode,
    persistOrders,
    setPersistOrders,
    userPhotos,
    changeAvatar,
    myPic,
    changeMyPic,
    login: async (u) => { setUName(u); setAuth(true); await AsyncStorage.setItem(STORAGE_KEYS.USER, u); },
    logout: async () => { setAuth(false); await AsyncStorage.removeItem(STORAGE_KEYS.USER); }
  };

  if (!isReady) return <ActivityIndicator style={{ flex: 1 }} color="#ff6347" />;

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AppStateContext.Provider value={contextData}>
          <PaperProvider theme={dark ? MD3DarkTheme : MD3LightTheme}>
            <NavigationIndependentTree>
              <NavigationContainer theme={dark ? DarkTheme : DefaultTheme}>
                <StatusBar barStyle={dark ? "light-content" : "dark-content"} />
                {auth ? <MainTabs /> : (
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
  authMain: { flex: 1, justifyContent: "center", padding: 30, backgroundColor: "#f5f5f5" },
  authHeader: { fontSize: 26, textAlign: "center", fontWeight: "bold", marginBottom: 35 },
  standardInput: { borderWidth: 1, borderColor: "#ccc", padding: 14, borderRadius: 10, marginBottom: 15, fontSize: 16 },
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
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.35)" },
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
});