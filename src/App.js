import React from "react";
import { Text, View, Button, FlatList } from "react-native";

import useInterval from "@use-it/interval";
import { useStopwatch } from "react-timer-hook";
import { styles } from "./styles";
import {
  getCurrentCoordinate,
  getDistanceBeatwenTwoPoint,
  msToHms
} from "./common";
import { LocationView } from "./LocationView";

const initialState = {
  allDistance: 0,
  distanceStack: [],
  timeLapStack: [],
  segmentStack: [],
  timerIsActive: "idol", // idol, play, pause
  currentPosition: { lat: 0, lng: 0 }
};

const App = () => {
  const [state, setState] = React.useState(initialState);

  const { seconds, minutes, hours, start, pause, reset } = useStopwatch({
    autoStart: false
  });

  /** имитация считывания позиции устройства */
  useInterval(() => {
    if (state.timerIsActive) {
      setState({
        ...state,
        currentPosition: getCurrentCoordinate()
      });
    }
  }, 1000);

  /** сброс */
  const resetState = () => {
    setState(initialState);
    reset();
  };

  /** Конвертер времени таймера в милисикунду */
  const timeToTimestamp = () => (seconds + minutes * 60 + hours * 3600) * 1000;

  const getPace = () => {
    let distance = state.distanceStack.length
      ? state.distanceStack[state.distanceStack.length - 1]
      : 1;
    let currentTime = state.timeLapStack.length
      ? state.timeLapStack[state.timeLapStack.length - 1]
      : 1;
    return 1000 / (distance / 1000 / (currentTime / 1000 / 60 / 60)) / 60;
  };

  /** фиксируем отрезок пути */
  const timeLockLap = () => {
    let currentTime = timeToTimestamp();

    let timeLapStackLength = state.timeLapStack.length;

    if (timeLapStackLength > 0) {
      currentTime = currentTime - state.timeLapStack[timeLapStackLength - 1];
    }

    let currentCoords = getCurrentCoordinate();

    let distance = null;

    let segmentStackLength = state.segmentStack.length;

    if (segmentStackLength > 0) {
      distance = getDistanceBeatwenTwoPoint(
        currentCoords,
        state.segmentStack[segmentStackLength - 1]
      );

      console.log(
        "timeLockLap: ",
        1000 / (distance / 1000 / (currentTime / 1000 / 60 / 60)) / 60
      );
    }

    setState({
      ...state,
      allDistance:
        distance != null ? state.allDistance + distance : state.allDistance,
      timeLapStack: [...state.timeLapStack, currentTime],
      segmentStack: [...state.segmentStack, currentCoords],
      distanceStack: [...state.distanceStack, ...(distance ? [distance] : [])]
    });
  };

  /** изменение состояния таймера и кнопок */
  const toggleTimer = () => {
    if (state.timerIsActive === "idol") {
      start();
      setState({
        ...state,
        segmentStack: [getCurrentCoordinate()],
        timerIsActive: "play"
      });
    } else if (state.timerIsActive === "pause") {
      start();
      setState({
        ...state,
        timerIsActive: "play"
      });
    } else if (state.timerIsActive === "play") {
      pause();
      setState({
        ...state,
        timerIsActive: "pause"
      });
    }
  };

  /** получить имя кнопки в зависимости от состояния */
  const titlePlayButton =
    state.timerIsActive === "idol" || state.timerIsActive === "pause"
      ? "Start"
      : "Stop";

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <LocationView
          title={"Initial location"}
          lat={state.segmentStack.length && state.segmentStack[0].lat}
          lng={state.segmentStack.length && state.segmentStack[0].lng}
        />
        <LocationView
          title={"Ongoing location"}
          lat={state.currentPosition.lat}
          lng={state.currentPosition.lng}
          speed={"9,5 m/s"}
        />
      </View>
      <View style={styles.container}>
        <View style={styles.line}>
          <View style={styles.dataCol}>
            <Text>time:</Text>
            <Text style={styles.data}>{msToHms(timeToTimestamp())}</Text>
          </View>
          <View style={styles.dataCol}>
            <Text>pace (min/km):</Text>
            <Text style={styles.data}>{getPace()}</Text>
          </View>
          <View style={styles.dataCol}>
            <Text>distance:</Text>
            <Text style={styles.data}>{state.allDistance}</Text>
          </View>
        </View>
      </View>
      <View style={styles.container}>
        <FlatList
          data={state.distanceStack}
          renderItem={({ item, index }) => {
            return (
              <View>
                <Text>{index}:</Text>
                <Text>distance: {item}</Text>
                <Text>time: {msToHms(state.timeLapStack[index])}</Text>
              </View>
            );
          }}
          keyExtractor={(item) => item.id}
        />
      </View>
      <View style={styles.container}>
        <Button onPress={toggleTimer} title={titlePlayButton} />
        <Button
          onPress={timeLockLap}
          disabled={
            state.timerIsActive === "idol" || state.timerIsActive === "pause"
          }
          title="Lap"
        />
        <Button
          onPress={resetState}
          disabled={state.timerIsActive === "idol"}
          title="Reset"
        />
      </View>
    </View>
  );
};

export default App;

/*
TODO
Initial state:
— Кнопка LAP inactive
— Кнопка Reset inactive

По нажатии на START:
— Кнопка LAP active
— Кнопка Reset active
— Менять значение title у кнопки на STOP
— Получаем начальные координаты
— Отображаем их в Initial location
— Получаем текущие координаты
— Отображаем их в Ongoing location
— Показываем speed в ongoing location 
nb! (если есть в faker, если нет - всё со скоростью игнорировать)
— Стартуем таймер
— Показываем время в time
— Записать в стек начальное время (00:00:00) и начальные координаты

По нажатии на LAP:
— Записывать в стек:
  — Настоящее время на момент нажатия
  — Настоящие координаты на момент нажатия
— Отобразить в FlatList
  — Номер круга (начать с первого)
  — Время круга
    Это Настоящее время минус прошлое время из стека
    Так, если мы засекаем первый круг когда на таймере 00:12:05,
    то время первого круга будет 00:12:05.
    А когда мы засекаем второй круг когда на таймере 00:22:05,
    то время второго круга равняется 00:22:05 - 00:12:05 = 00:10:00
  — Дистанция круга
    Это настоящая дистанция минус прошлая дистанция из стека.
    Логика как у времени круга

По нажатии на STOP:
— Кнопка LAP inactive
— Менять значение title у кнопки на START
— Остановить таймер на текущем значении
— Speed = 0
— Остановить дистанцию на текущем значении

По нажатии на Reset
— Таймер обнулить
— Дистанцию обнулить
— initial location обнулить
— Произвести логику кнопки STOP

*/
