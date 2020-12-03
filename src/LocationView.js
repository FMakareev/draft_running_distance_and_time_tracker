import React from "react";
import { Text, View } from "react-native";
import { styles } from "./styles";

export const LocationView = ({ lat, lng, speed, title }) => {
  return (
    <React.Fragment>
      <Text style={styles.dataSmall}>{title}</Text>
      <View style={styles.line}>
        <View style={styles.dataCol}>
          <Text style={styles.dataSmall}>latitude:</Text>
          <Text style={styles.dataSmall}>{lat}</Text>
        </View>
        <View style={styles.dataCol}>
          <Text style={styles.dataSmall}>longitude:</Text>
          <Text style={styles.dataSmall}>{lng}</Text>
        </View>
        {speed && (
          <View style={styles.dataCol}>
            <Text style={styles.dataSmall}>speed:</Text>
            <Text style={styles.dataSmall}>{speed}</Text>
          </View>
        )}
      </View>
    </React.Fragment>
  );
};
