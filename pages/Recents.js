import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
} from "react-native";
import { useState, useEffect } from "react";
import * as Haptics from "expo-haptics";
import { apiKey } from "../Vars.js"; // File contains api key
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import * as Network from "expo-network";

export default function Recents({ navigation }) {
  let json = require("./Recents.json");
  const [isNetworkConnected, setIsNetworkConnected] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [recentsCount, setRecentsCount] = useState(json.recents.length);

  const network = async () => {
    const isInternetReachable = await (
      await Network.getNetworkStateAsync()
    ).isInternetReachable;
    setIsNetworkConnected(isInternetReachable);
  };

  useEffect(() => {
    network();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    json.recents = [];
    setRecentsCount(0);
    network();
    setRefreshing(false);
  };

  const displayWeather = (location) => {
    network();
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=imperial&APPID=${apiKey}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (typeof data.main !== "undefined") {
          Alert.alert(
            `${data.name}, ${data.sys.country}`,
            `Temperature: ${Math.round(data.main.temp)}ºF / ${Math.round(
              ((data.main.temp - 32) * 5) / 9
            )}ºC \n Weather: ${data.weather[0].main} \n Weather Description: ${data.weather[0].description[0].toUpperCase() +
            data.weather[0].description.substring(1)
            }`,
            [
              {
                text: "OK",
              },
            ]
          );
        }
        if (data.cod === 401) {
          Alert.alert(
            "Invalid API Key",
            "Looks like this API key is invalid. Please use a valid API key.",
            [
              {
                text: "OK",
              },
            ]
          );
        }
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <TouchableOpacity
            onPress={() =>
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy) &&
              navigation.navigate("Weather")
            }
          >
            <MaterialCommunityIcons
              style={styles.goBack}
              name="arrow-left"
              size={20}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerText}>Recents</Text>
        <View style={styles.invisible}>
          <TouchableOpacity>
            <MaterialCommunityIcons
              style={styles.goBack}
              name="arrow-left"
              size={20}
            />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTap={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            title="Refreshing..."
          />
        }
      >
        {isNetworkConnected ? (
          <>
            {recentsCount === 0 ? (
              <View style={styles.recents}>
                <Text style={styles.noRecentsText}>
                  Your recent searches will be here.
                </Text>
              </View>
            ) : (
              <View style={styles.recents}>
                {json.recents.map((item, key) => (
                  <TouchableOpacity
                    key={key}
                    style={styles.recentItem}
                    onPress={() =>
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy) &&
                      displayWeather([item.city, item.country])
                    }
                  >
                    <View style={styles.recentItemText}>
                      <Text style={styles.city}>{item.city}</Text>
                      <Text style={styles.country}>{item.country}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        ) : (
          <View style={styles.networkStats}>
            <MaterialCommunityIcons size={45} name="wifi-off" color="#ff8c00" />
            <Text>Please connect to the internet to receive weather data.</Text>
          </View>
        )}
      </ScrollView>
      <StatusBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
  },

  contentContainer: {
    flex: 1,
    alignItems: "center",
  },

  header: {
    marginBottom: "3%",
    width: "100%",
    padding: "3.5%",
    display: "block",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  headerText: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "300",
  },

  invisible: {
    opacity: "0",
  },

  recents: {
    marginTop: "5%",
    width: "90%",
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
  },

  noRecentsText: {
    fontSize: 16,
    fontWeight: "300",
  },

  recentItem: {
    padding: "5%",
    borderRadius: 10,
    marginLeft: "2%",
    marginRight: "2%",
    marginTop: "2%",
    marginBottom: "2%",
    width: "43%",
    backgroundColor: "#f4f4f4",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.17,
    shadowRadius: 3.05,
    elevation: 4,
    display: "flex",
    justifyContent: "center",
  },

  recentItemText: {
    display: "flex",
    flexDirection: "column",
    fontSize: 15,
    fontWeight: "300",
  },

  city: {
    fontSize: 18,
    marginBottom: "2%",
    fontWeight: "300",
  },

  country: {
    fontSize: 24,
    fontWeight: "300",
  },

  networkStats: {
    marginTop: "7%",
    height: "20%",
    width: "90%",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.17,
    shadowRadius: 3.05,
    elevation: 4,
    padding: "4.5%",
    backgroundColor: "#f2f2f2",
    borderRadius: 12,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-evenly",
  },
});
