import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Image,
  Switch,
  StatusBar,
  SafeAreaView,
  TextInput,
  Modal
} from "react-native";

const INITIAL_ORDERS = Array.from({ length: 20 }, (_, i) => ({
  id: i.toString(),
  orderNumber: `#${4200 + i}`,
  items: i % 2 === 0 ? "Маргарита, Пепероні" : "Чотири сири",
  type: i % 3 === 0 ? "Доставка" : "Самовивіз",
  time: `${10 + (i % 12)}:${i < 10 ? "0" + i : i}`,
  status: i % 2 === 0 ? "Готується" : "В черзі"
}));

export default function App() {

  const [orders, setOrders] = useState(INITIAL_ORDERS);

  const [activeScreen, setActiveScreen] = useState("orders");

  const [darkMode, setDarkMode] = useState(false);
  const [kitchenMode, setKitchenMode] = useState(true);

  const [menuVisible, setMenuVisible] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const [pizzaName, setPizzaName] = useState("");

  const filteredOrders = orders.filter(order => {
    if (kitchenMode) {
      return order.status === "Готується" || order.status === "В черзі";
    } else {
      return order.type === "Доставка";
    }
  });

  const addOrder = () => {

    if (!pizzaName) return;

    const newOrder = {
      id: Date.now().toString(),
      orderNumber: "#" + Math.floor(Math.random() * 9000),
      items: pizzaName,
      type: "Самовивіз",
      time: "12:00",
      status: "В черзі"
    };

    setOrders([newOrder, ...orders]);

    setPizzaName("");
    setActiveScreen("orders");
  };

  const deleteOrder = (id) => {
    setOrders(orders.filter(o => o.id !== id));
  };

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

          <TouchableOpacity
            onPress={() => deleteOrder(item.id)}
          >
            <Text style={{ color: "red", marginTop: 5 }}>
              Видалити
            </Text>
          </TouchableOpacity>

        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, darkMode ? styles.darkContainer : styles.lightContainer]}>

      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />

      {/* Кнопка меню */}
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => setMenuVisible(true)}
      >
        <Text style={{ fontSize: 18, color: darkMode ? "#fff" : "#000" }}>☰ Меню</Text>
      </TouchableOpacity>


      {/* Екрани */}
      <View style={{ flex: 1, padding: 15 }}>

        {activeScreen === "orders" && (

          <FlatList
            data={filteredOrders}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <OrderItem item={item} />}
          />

        )}

        {activeScreen === "settings" && (

          <View>

            <Text style={[styles.settingsTitle, darkMode ? styles.darkText : styles.lightText]}>Налаштування</Text>

            <View style={styles.settingRow}>
              <Text style={darkMode ? styles.darkText : styles.lightText}>
                Темна тема
              </Text>

              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
              />
            </View>

            <View style={styles.settingRow}>
              <Text style={darkMode ? styles.darkText : styles.lightText}>
                Режим кухні
              </Text>

              <Switch
                value={kitchenMode}
                onValueChange={setKitchenMode}
              />
            </View>

          </View>

        )}

        {activeScreen === "add" && (

          <View>

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
              onPress={addOrder}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                Додати
              </Text>
            </TouchableOpacity>

          </View>

        )}

      </View>


      {/* МОДАЛЬНЕ МЕНЮ */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="slide"
      >

        <View style={[styles.menuModal, darkMode ? styles.darkMenu : styles.lightMenu]}>

          <TouchableOpacity onPress={() => {
            setActiveScreen("orders");
            setMenuVisible(false);
          }}>
            <Text style={[styles.menuItem, darkMode ? styles.darkMenuItem : styles.lightMenuItem]}>Замовлення</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => {
            setActiveScreen("add");
            setMenuVisible(false);
          }}>
            <Text style={[styles.menuItem, darkMode ? styles.darkMenuItem : styles.lightMenuItem]}>Додати</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => {
            setActiveScreen("settings");
            setMenuVisible(false);
          }}>
            <Text style={[styles.menuItem, darkMode ? styles.darkMenuItem : styles.lightMenuItem]}>Налаштування</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setMenuVisible(false)}>
            <Text style={{ marginTop: 20, color: "red" }}>Закрити</Text>
          </TouchableOpacity>

        </View>

      </Modal>


      {/* МОДАЛЬНЕ ВІКНО ДЕТАЛЕЙ */}
      <Modal
        visible={modalVisible}
        animationType="slide"
      >

        <View style={styles.detailsModal}>

          <Text style={{ fontSize: 24, fontWeight: "bold" }}>
            Деталі замовлення
          </Text>

          {selectedOrder && (
            <>
              <Text>Номер: {selectedOrder.orderNumber}</Text>
              <Text>Піца: {selectedOrder.items}</Text>
              <Text>Тип: {selectedOrder.type}</Text>
              <Text>Статус: {selectedOrder.status}</Text>
            </>
          )}

          <TouchableOpacity
            onPress={() => setModalVisible(false)}
          >
            <Text style={{ color: "blue", marginTop: 20 }}>
              Закрити
            </Text>
          </TouchableOpacity>

        </View>

      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: { flex: 1 },

  lightContainer: { backgroundColor: "#f5f5f5" },

  darkContainer: { backgroundColor: "#000" },

  menuButton: {
    padding: 15,
    backgroundColor: "#ff6347",
    alignItems: "center"
  },

  card: {
    flexDirection: "row",
    padding: 15,
    marginVertical: 6,
    borderRadius: 10
  },

  lightCard: { backgroundColor: "#fff" },

  darkCard: { backgroundColor: "#1c1c1e" },

  cardImage: { width: 50, height: 50 },

  cardContent: { marginLeft: 15 },

  cardTitle: { fontWeight: "bold", fontSize: 18 },

  lightText: { color: "#000" },

  darkText: { color: "#fff" },

  lightTextSub: { color: "#555" },

  darkTextSub: { color: "#aaa" },

  settingsTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20
  },

  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15
  },

  addButton: {
    backgroundColor: "#ff6347",
    padding: 15,
    borderRadius: 10,
    alignItems: "center"
  },

  menuModal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  menuItem: {
    fontSize: 22,
    marginVertical: 10
  },

  darkMenu: {
    backgroundColor: "#000"
  },

  lightMenu: {
    backgroundColor: "#fff"
  },

  darkMenuItem: {
    color: "#fff"
  },

  lightMenuItem: {
    color: "#000"
  },

  darkInput: {
    color: "#fff",
    borderColor: "#555"
  },

  lightInput: {
    color: "#000",
    borderColor: "#ccc"
  },
  detailsModal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }

});