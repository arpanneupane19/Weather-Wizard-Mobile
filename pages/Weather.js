import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
  Linking,
} from "react-native";
import { useState, useEffect } from "react";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { WeatherConditions } from "../utils/WeatherConditions.js";
import * as Haptics from "expo-haptics";
import * as Network from "expo-network";
import { apiKey } from "../Vars.js"; // File contains api key
const degreesToDirection = require("degrees-to-direction");

export default function Weather({ navigation }) {
  const [isNetworkConnected, setIsNetworkConnected] = useState(false);
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState([{}]);
  const [unit, setUnit] = useState(true);
  const [searchBackgroundColor, setSearchBackgroundColor] = useState("#e3e3e3");
  const [time, setTime] = useState(
    new Date().toLocaleTimeString().replace(/(.*)\D\d+/, "$1")
  );
  const [refreshing, setRefreshing] = useState(false);

  let json = require("./Recents.json");

  const getDate = () => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const date = new Date();
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  const network = async () => {
    const isInternetReachable = await (
      await Network.getNetworkStateAsync()
    ).isInternetReachable;
    setIsNetworkConnected(isInternetReachable);
  };

  useEffect(() => {
    setInterval(() => {
      setTime(new Date().toLocaleTimeString().replace(/(.*)\D\d+/, "$1"));
    }, 60000);

    network();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setWeatherData([{}]);
    setCity("");
    network();
    setRefreshing(false);
  };

  const fetchWeather = () => {
    network();
    fetch(
      `http://api.openweathermap.org/data/2.5/weather?q=${city.trim()}&units=imperial&APPID=${apiKey}`
    )
      .then((response) => response.json())
      .then((data) => {
        setWeatherData(data);
        setCity("");
        // This conditional will add the location to the json array if it exists
        if (
          data.cod !== "404" &&
          data.main !== "undefined" &&
          city.trim() !== "" &&
          data.cod !== 401
        ) {
          json["recents"].push({ city: data.name, country: data.sys.country });
        }

        if (data.cod === "404") {
          Alert.alert(
            "City Not Found",
            "Looks like that city doesn't exist. Maybe try using this format? \n <City Name>, <Country Abbreviation>"
          );
        }

        if (data.cod === 401) {
          Alert.alert(
            "Invalid API Key",
            "Looks like this API key is invalid. Please use a valid API key."
          );
        }
      });
  };

  const openBrowser = (link) => {
    Linking.openURL(link);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar />

      <View style={styles.searchBar}>
        {/* Search Bar */}
        <TextInput
          style={[
            styles.searchBarInput,
            { backgroundColor: searchBackgroundColor },
            { borderColor: searchBackgroundColor },
          ]}
          placeholder="Enter a city..."
          onFocus={() => {
            setSearchBackgroundColor("#e6e6e6");
          }}
          onBlur={() => {
            setSearchBackgroundColor("#e3e3e3");
          }}
          onChangeText={(text) => setCity(text)}
          value={city}
          onSubmitEditing={() => fetchWeather()}
        />
      </View>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            title="Refreshing..."
          />
        }
      >
        <View style={styles.weatherCard}>
          <View style={styles.weatherCardItems}>
            {typeof weatherData.main !== "undefined" ? (
              <>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <MaterialCommunityIcons
                    size={45}
                    name={WeatherConditions[weatherData.weather[0].main].icon}
                    color={WeatherConditions[weatherData.weather[0].main].color}
                  />
                  <TouchableOpacity
                    onPress={() =>
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy) &&
                      setUnit(!unit)
                    }
                  >
                    <Text
                      style={[
                        styles.temperatureText,
                        {
                          color:
                            WeatherConditions[weatherData.weather[0].main]
                              .color,
                        },
                      ]}
                    >
                      {unit
                        ? `${Math.round(weatherData.main.temp)}°F`
                        : `${Math.round(
                          ((weatherData.main.temp - 32) * 5) / 9
                        )}ºC`}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.weatherDataInfo}>
                  <Text style={styles.cityText}>
                    {weatherData.name}, {weatherData.sys.country}
                  </Text>
                  <Text style={styles.weather}>
                    {weatherData.weather[0].main}
                  </Text>
                </View>

                <View style={styles.dateAndTime}>
                  <Text style={styles.dateText}>{getDate()}</Text>
                  <Text style={styles.timeText}>{time}</Text>
                </View>
              </>
            ) : (
              <>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <MaterialCommunityIcons
                    size={45}
                    name="weather-sunny"
                    color="#f7b733"
                  />
                </View>

                <View style={styles.weatherDataInfo}>
                  <Text style={styles.cityText}>Weather Wizard</Text>
                  {isNetworkConnected ? (
                    <Text style={styles.weather}>
                      Developed by{" "}
                      <Text
                        style={styles.myName}
                        onPress={() => openBrowser("https://arpanneupane.com")}
                      >
                        Arpan Neupane
                      </Text>
                      .
                    </Text>
                  ) : (
                    <Text style={styles.weather}>
                      Developed by Arpan Neupane.
                    </Text>
                  )}
                </View>

                <View style={styles.dateAndTime}>
                  <Text style={styles.dateText}>{getDate()}</Text>
                  <Text style={styles.timeText}>{time}</Text>
                </View>
              </>
            )}
          </View>
        </View>
        {typeof weatherData.main !== "undefined" ? (
          <View style={styles.extraData}>
            <View style={styles.minMax}>
              <Text style={styles.citysWeather}>
                {weatherData.name}'s Weather
              </Text>
              <Text
                style={[
                  styles.minMaxText,
                  {
                    color: WeatherConditions[weatherData.weather[0].main].color,
                  },
                ]}
              >
                {unit
                  ? `L: ${Math.round(
                    weatherData.main.temp_min
                  )}°F / H: ${Math.round(weatherData.main.temp_max)}°F`
                  : `L: ${Math.round(
                    ((weatherData.main.temp_min - 32) * 5) / 9
                  )}ºC / H: ${Math.round(
                    ((weatherData.main.temp_max - 32) * 5) / 9
                  )}ºC`}
              </Text>
            </View>
            <ScrollView contentContainerStyle={styles.extraItems}>
              <View style={styles.extraItem}>
                <Text style={{ color: "#c0c0c0" }}>FEELS LIKE</Text>
                <Text
                  style={[
                    styles.extraItemDetail,
                    {
                      color:
                        WeatherConditions[weatherData.weather[0].main].color,
                    },
                  ]}
                >
                  {unit
                    ? `${Math.round(weatherData.main.feels_like)}°F`
                    : `${Math.round(
                      ((weatherData.main.feels_like - 32) * 5) / 9
                    )}ºC`}
                </Text>
              </View>
              <View style={styles.extraItem}>
                <Text style={{ color: "#c0c0c0" }}>CLOUDINESS</Text>
                <Text style={styles.extraItemDetail}>
                  {weatherData.clouds.all}%
                </Text>
              </View>
              <View style={styles.extraItem}>
                <Text style={{ color: "#c0c0c0" }}>HUMIDITY</Text>
                <Text style={styles.extraItemDetail}>
                  {weatherData.main.humidity}%
                </Text>
              </View>
              <View style={styles.extraItem}>
                <Text style={{ color: "#c0c0c0" }}>WIND SPEED</Text>
                <Text style={styles.extraItemDetail}>
                  {unit
                    ? `${Math.round(weatherData.wind.speed)} MPH`
                    : `${Math.round(weatherData.wind.speed / 1.6)} KPH`}
                </Text>
              </View>
              <View style={styles.extraItem}>
                <Text style={{ color: "#c0c0c0" }}>AIR PRESSURE</Text>
                <Text style={styles.extraItemDetail}>
                  {weatherData.main.pressure}
                </Text>
              </View>
              <View style={styles.extraItem}>
                <Text style={{ color: "#c0c0c0" }}>WIND DIRECTION</Text>
                <Text style={styles.extraItemDetail}>
                  {degreesToDirection(weatherData.wind.deg)}
                </Text>
              </View>
              <View style={styles.extraItem}>
                <Text style={{ color: "#c0c0c0" }}>DESCRIPTION</Text>
                <Text style={styles.weatherDescription}>
                  {weatherData.weather[0].description[0].toUpperCase() +
                    weatherData.weather[0].description.substring(1)}
                </Text>
              </View>
            </ScrollView>
          </View>
        ) : (
          <>
            {!isNetworkConnected ? (
              <View style={styles.networkStats}>
                <MaterialCommunityIcons
                  size={45}
                  name="wifi-off"
                  color="#ff8c00"
                />
                <Text>
                  Please connect to the internet to receive weather data.
                </Text>
              </View>
            ) : (
              <></>
            )}
          </>
        )}
        {isNetworkConnected ? (
          <TouchableOpacity
            style={styles.recents}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              navigation.navigate("Recents");
            }}
          >
            <Text style={styles.recentsText}>View Recent Searches</Text>
          </TouchableOpacity>
        ) : (
          <></>
        )}
      </ScrollView>
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
    backgroundColor: "#f4f4f4",
    alignItems: "center",
  },

  searchBar: {
    marginTop: "6%",
    marginBottom: "6%",
    width: "90%",
    marginLeft: "auto",
    marginRight: "auto",
  },
  searchBarInput: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    padding: "3.5%",
    fontSize: 17,
    color: "#000",
  },

  weatherCard: {
    height: 170,
    width: "90%",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.17,
    shadowRadius: 3.05,
    elevation: 4,
    padding: "3.5%",
    backgroundColor: "#f2f2f2",
    borderRadius: 12,
  },

  weatherCardItems: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
  },

  temperatureText: {
    fontSize: 20,
    fontWeight: "300",
  },

  weatherDataInfo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  cityText: {
    fontSize: 23,
    fontWeight: "300",
    marginBottom: 5,
  },

  weather: {
    fontSize: 17,
    fontWeight: "200",
  },

  dateAndTime: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: "8%",
  },

  extraData: {
    marginTop: "7%",
    height: "49%",
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
  },

  minMax: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomColor: "#d0d0d0",
    borderBottomWidth: 1,
  },

  citysWeather: {
    fontSize: 15,
    marginBottom: 10,
  },
  minMaxText: {
    fontSize: 15,
    marginBottom: 10,
  },

  extraItems: {
    marginTop: "5%",
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
  },

  extraItem: {
    display: "flex",
    flexDirection: "column",
    width: "48%",
    height: 100,
    display: "flex",
    borderWidth: 1,
    borderColor: "#d0d0d0",
    borderRadius: 10,
    padding: "3.5%",
    marginRight: "1%",
    marginLeft: "1%",
    marginBottom: "2%",
  },

  extraItemDetail: {
    marginTop: "7%",
    fontSize: 30,
    fontWeight: "200",
  },

  weatherDescription: {
    marginTop: "6%",
    fontSize: 20,
    fontWeight: "200",
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

  recents: {
    marginTop: "7%",
    padding: "2.5%",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.17,
    shadowRadius: 3.05,
    elevation: 4,
    backgroundColor: "#f2f2f2",
    borderRadius: 12,
  },

  recentsText: {
    fontWeight: "300",
    fontSize: 16,
  },

  myName: {
    color: "#008cff",
  },
});
