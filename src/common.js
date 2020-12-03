import haversine from "haversine";

import faker from "faker";

const { ms, s, m, h, d } = require("time-convert");
export const msToHms = (_ms) =>
  ms
    .to(
      h,
      m,
      s
    )(_ms)
    .map((n) => (n < 10 ? "0" + n : n.toString())) // zero-pad
    .join(":");

export const getCurrentCoordinate = () => {
  return {
    lat: faker.address.latitude(),
    lng: faker.address.longitude()
  };
};

export const getDistanceBeatwenTwoPoint = (firstPoint, lastPoint) => {
  return haversine(
    {
      latitude: firstPoint.lat,
      longitude: firstPoint.lng
    },
    {
      latitude: lastPoint.lat,
      longitude: lastPoint.lng
    },
    {
      unit: "meter"
    }
  );
};
