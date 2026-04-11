import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  NavigationIndependentTree,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { createContext, useContext, useState } from "react";
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
} from "react-native";
import { Provider as PaperProvider, MD3DarkTheme, MD3LightTheme } from "react-native-paper";
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const initialUsers = [
  { username: "admin", password: "admin", displayName: "Адміністратор" },
  { username: "user", password: "user", displayName: "Користувач" },
];

const INITIAL_ORDERS = Array.from({ length: 20 }, (_, i) => ({
  id: i.toString(),
  orderNumber: `#${4200 + i}`,
  items: i % 2 === 0 ? "Маргарита, Пепероні" : "Чотири сири",
  type: i % 3 === 0 ? "Доставка" : "Самовивіз",
  time: `${10 + (i % 12)}:${i < 10 ? "0" + i : i}`,
  status: i % 2 === 0 ? "Готується" : "В черзі",
}));

const AppStateContext = createContext(null);

const AuthStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function LoginScreen({ navigation }) {
  const { login } = useContext(AppStateContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = () => {
    setErrorMsg("");
    const success = login(username.trim().toLowerCase(), password);
    if (!success) {
      setErrorMsg("Неправильні облікові дані");
    }
  };

  return (
    <View style={[styles.center, { backgroundColor: "#f5f5f5" }]}>
      <Text style={[styles.title, { color: "#000", marginBottom: 30 }]}>Pizza Orders</Text>

      {!!errorMsg && <Text style={{ color: "red", marginBottom: 10, fontSize: 16 }}>{errorMsg}</Text>}

      <TextInput
        placeholder="Логін"
        onChangeText={setUsername}
        style={[styles.input, { borderColor: "#ccc", color: "#000" }]}
        placeholderTextColor="#888"
      />
      <TextInput
        placeholder="Пароль"
        secureTextEntry
        onChangeText={setPassword}
        style={[styles.input, { borderColor: "#ccc", color: "#000" }]}
        placeholderTextColor="#888"
      />

      <TouchableOpacity onPress={handleLogin} style={styles.btn}>
        <Text style={{ color: "#fff", fontWeight: "bold" }}>Увійти</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Register")} style={{ marginTop: 15 }}>
        <Text style={{ color: "#ff6347" }}>Створити новий обліковий запис</Text>
      </TouchableOpacity>
    </View>
  );
}

function RegisterScreen({ navigation }) {
  const { register } = useContext(AppStateContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleRegister = () => {
    setErrorMsg("");
    if (!username || !password || !confirmPassword) {
      setErrorMsg("Заповніть всі поля");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Паролі не збігаються");
      return;
    }
    const success = register(username.trim().toLowerCase(), password);
    if (success) {
      Alert.alert("Успіх", "Обліковий запис створено!", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } else {
      setErrorMsg("Користувач з таким логіном вже існує");
    }
  };

  return (
    <View style={[styles.center, { backgroundColor: "#f5f5f5" }]}>
      <Text style={[styles.title, { color: "#000", marginBottom: 30 }]}>Реєстрація</Text>

      {!!errorMsg && <Text style={{ color: "red", marginBottom: 10, fontSize: 14 }}>{errorMsg}</Text>}

      <TextInput
        placeholder="Логін"
        onChangeText={setUsername}
        style={[styles.input, { borderColor: "#ccc", color: "#000" }]}
        placeholderTextColor="#888"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Пароль"
        secureTextEntry
        onChangeText={setPassword}
        style={[styles.input, { borderColor: "#ccc", color: "#000" }]}
        placeholderTextColor="#888"
      />
      <TextInput
        placeholder="Повторити пароль"
        secureTextEntry
        onChangeText={setConfirmPassword}
        style={[styles.input, { borderColor: "#ccc", color: "#000" }]}
        placeholderTextColor="#888"
      />

      <TouchableOpacity onPress={handleRegister} style={styles.btn}>
        <Text style={{ color: "#fff", fontWeight: "bold" }}>Зареєструватися</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 15 }}>
        <Text style={{ color: "#ff6347" }}>Повернутися до входу</Text>
      </TouchableOpacity>
    </View>
  );
}

function OrdersScreen({ navigation }) {
  const { orders, deleteOrder, darkMode, kitchenMode } = useContext(AppStateContext);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const filteredOrders = orders.filter(order => {
    if (kitchenMode) {
      return order.status === "Готується" || order.status === "В черзі";
    } else {
      return order.type === "Доставка";
    }
  });

  const OrderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedOrder(item);
        setModalVisible(true);
      }}
    >
      <View style={[styles.card, darkMode ? styles.darkCard : styles.lightCard]}>
        <Image
          source={{ uri: "https://cdn-icons-png.flaticon.com/512/3595/3595455.png" }}
          style={styles.cardImage}
        />
        <View style={styles.cardContent}>
          <Text style={[styles.cardTitle, darkMode ? styles.darkText : styles.lightText]}>
            {item.orderNumber}
          </Text>
          <Text style={darkMode ? styles.darkTextSub : styles.lightTextSub}>
            {item.items}
          </Text>
          <Text style={{ color: "#ff6347" }}>
            {item.time}
          </Text>
          <Text style={{ color: "#888" }}>
            {item.type} | {item.status}
          </Text>
          <TouchableOpacity onPress={() => deleteOrder(item.id)}>
            <Text style={{ color: "red", marginTop: 5 }}>Видалити</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, darkMode ? styles.darkContainer : styles.lightContainer]} edges={['left', 'right']}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />

      <View style={{ flex: 1, padding: 15 }}>
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <OrderItem item={item} />}
        />
      </View>

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.detailsModal}>
          <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
            Деталі замовлення
          </Text>
          {selectedOrder && (
            <>
              <Text style={{ fontSize: 16, marginVertical: 5 }}>Номер: {selectedOrder.orderNumber}</Text>
              <Text style={{ fontSize: 16, marginVertical: 5 }}>Піца: {selectedOrder.items}</Text>
              <Text style={{ fontSize: 16, marginVertical: 5 }}>Тип: {selectedOrder.type}</Text>
              <Text style={{ fontSize: 16, marginVertical: 5 }}>Статус: {selectedOrder.status}</Text>
              <Text style={{ fontSize: 16, marginVertical: 5 }}>Час: {selectedOrder.time}</Text>
            </>
          )}
          <TouchableOpacity
            onPress={() => setModalVisible(false)}
            style={{ marginTop: 30 }}
          >
            <Text style={{ color: "#ff6347", fontSize: 18, fontWeight: "bold" }}>Закрити</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function SettingsScreen() {
  const { userName, logout, darkMode, setDarkMode, setUserName, kitchenMode, setKitchenMode } = useContext(AppStateContext);
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(userName);

  const handleSaveName = () => {
    if (tempName.trim()) {
      setUserName(tempName);
      setIsEditing(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, darkMode ? styles.darkContainer : styles.lightContainer]} edges={['left', 'right']}>
      <View style={{ flex: 1, padding: 15 }}>
        <Text style={[styles.settingsTitle, darkMode ? styles.darkText : styles.lightText]}>
          Налаштування
        </Text>

        <View style={[styles.settingRow, { borderBottomWidth: 1, borderBottomColor: darkMode ? "#333" : "#eee", paddingBottom: 15, marginBottom: 15, flexDirection: "column", alignItems: "flex-start" }]}>
          <Text style={[darkMode ? styles.darkText : styles.lightText, { marginBottom: 10 }]}>Ім'я користувача:</Text>
          {isEditing ? (
            <View style={{ width: "100%", flexDirection: "row", gap: 10 }}>
              <TextInput
                value={tempName}
                onChangeText={setTempName}
                style={[styles.input, { flex: 1, marginBottom: 0, borderColor: darkMode ? "#555" : "#ccc", color: darkMode ? "#fff" : "#000" }]}
                placeholderTextColor={darkMode ? "#aaa" : "#888"}
              />
              <TouchableOpacity onPress={handleSaveName} style={{ padding: 10, backgroundColor: "#ff6347", borderRadius: 5, justifyContent: "center" }}>
                <Text style={{ color: "#fff", fontWeight: "bold" }}>✓</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsEditing(false)} style={{ padding: 10, backgroundColor: "#999", borderRadius: 5, justifyContent: "center" }}>
                <Text style={{ color: "#fff", fontWeight: "bold" }}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setIsEditing(true)} style={{ width: "100%" }}>
              <Text style={[darkMode ? styles.darkText : styles.lightText, { fontSize: 16, padding: 10, backgroundColor: darkMode ? "#1c1c1e" : "#f0f0f0", borderRadius: 5 }]}>
                {userName}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ПЕРЕНЕСЕНО СЮДИ */}
        <View style={styles.settingRow}>
          <Text style={darkMode ? styles.darkText : styles.lightText}>Режим кухні</Text>
          <Switch
            value={kitchenMode}
            onValueChange={setKitchenMode}
            trackColor={{ true: "#ff6347" }}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={darkMode ? styles.darkText : styles.lightText}>Темна тема</Text>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ true: "#ff6347" }}
          />
        </View>

        <View style={[styles.settingRow, { marginTop: 30 }]}>
          <TouchableOpacity
            style={[styles.btn, { flex: 1 }]}
            onPress={logout}
          >
            <Text style={{ color: "#fff", fontWeight: "bold", textAlign: "center" }}>
              Вийти з облікового запису
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

function AddScreen({ navigation }) {
  const { addOrder, darkMode } = useContext(AppStateContext);
  const [pizzaName, setPizzaName] = useState("");

  const handleAdd = () => {
    if (!pizzaName) {
      Alert.alert("Помилка", "Введіть назву замовлення");
      return;
    }
    const newOrder = {
      id: Date.now().toString(),
      orderNumber: "#" + Math.floor(Math.random() * 9000),
      items: pizzaName,
      type: "Самовивіз",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: "В черзі"
    };
    addOrder(newOrder);
    setPizzaName("");
    navigation.navigate("Orders");
  };

  return (
    <SafeAreaView style={[styles.container, darkMode ? styles.darkContainer : styles.lightContainer]} edges={['left', 'right']}>
      <View style={{ flex: 1, justifyContent: "center", padding: 15 }}>
        <Text style={[styles.settingsTitle, darkMode ? styles.darkText : styles.lightText]}>
          Додати замовлення
        </Text>
        <TextInput
          placeholder="Назва піци"
          placeholderTextColor={darkMode ? "#ccc" : "#888"}
          value={pizzaName}
          onChangeText={setPizzaName}
          style={[styles.input, darkMode ? styles.darkInput : styles.lightInput]}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAdd}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Додати</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ marginTop: 10 }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: "#ff6347", textAlign: "center", fontSize: 16 }}>
            Скасувати
          </Text>
        </TouchableOpacity>
      </View>
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
        tabBarStyle: {
          backgroundColor: darkMode ? "#1c1c1e" : "#fff",
          borderTopColor: darkMode ? "#333" : "#eee",
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Orders") iconName = "list";
          else if (route.name === "Add") iconName = "add-circle";
          else if (route.name === "Settings") iconName = "settings";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarLabelStyle: { fontSize: 12 }
      })}
    >
      <Tab.Screen name="Orders" component={OrdersScreen} options={{ title: "Замовлення" }} />
      <Tab.Screen name="Add" component={AddScreen} options={{ title: "Додати" }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: "Налаштування" }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [userName, setUserName] = useState("");
  const [users, setUsers] = useState(initialUsers);
  const [kitchenMode, setKitchenMode] = useState(true);

  const theme = darkMode ? MD3DarkTheme : MD3LightTheme;
  const navTheme = darkMode ? DarkNavTheme : LightNavTheme;

  const login = (user, pass) => {
    const validUser = users.find((u) => u.username === user && u.password === pass);
    if (validUser) {
      setUserName(validUser.displayName);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const register = (user, pass) => {
    const existingUser = users.find((u) => u.username === user);
    if (existingUser) return false;
    setUsers([...users, { username: user, password: pass, displayName: user }]);
    return true;
  };

  const stateValue = {
    orders,
    deleteOrder: (id) => setOrders(orders.filter((o) => o.id !== id)),
    addOrder: (o) => setOrders([o, ...orders]),
    userName, setUserName,
    darkMode, setDarkMode,
    kitchenMode, setKitchenMode,
    login, logout: () => setIsAuthenticated(false),
    register,
  };

  return (
    <SafeAreaProvider>
      <AppStateContext.Provider value={stateValue}>
        <PaperProvider theme={theme}>
          <NavigationIndependentTree>
            <NavigationContainer theme={navTheme}>
              {isAuthenticated ? (
                <MainTabs />
              ) : (
                <AuthStack.Navigator screenOptions={{ headerShown: false, animation: "fade" }}>
                  <AuthStack.Screen name="Login" component={LoginScreen} />
                  <AuthStack.Screen name="Register" component={RegisterScreen} />
                </AuthStack.Navigator>
              )}
            </NavigationContainer>
          </NavigationIndependentTree>
        </PaperProvider>
      </AppStateContext.Provider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  lightContainer: { backgroundColor: "#f5f5f5" },
  darkContainer: { backgroundColor: "#000" },
  center: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, textAlign: "center", marginBottom: 20 },
  input: {
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
  },
  btn: {
    backgroundColor: "#ff6347",
    padding: 15,
    alignItems: "center",
    borderRadius: 10,
  },
  card: {
    flexDirection: "row",
    padding: 15,
    marginVertical: 6,
    borderRadius: 10,
  },
  lightCard: { backgroundColor: "#fff" },
  darkCard: { backgroundColor: "#1c1c1e" },
  cardImage: { width: 50, height: 50 },
  cardContent: { marginLeft: 15, flex: 1 },
  cardTitle: { fontWeight: "bold", fontSize: 18 },
  lightText: { color: "#000" },
  darkText: { color: "#fff" },
  lightTextSub: { color: "#555" },
  darkTextSub: { color: "#aaa" },
  settingsTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },
  darkInput: { color: "#fff", borderColor: "#555" },
  lightInput: { color: "#000", borderColor: "#ccc" },
  addButton: {
    backgroundColor: "#ff6347",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  detailsModal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
});

const LightNavTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, primary: "#ff6347", background: "#ffffff" },
};

const DarkNavTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, primary: "#ff6347", background: "#121212" },
};