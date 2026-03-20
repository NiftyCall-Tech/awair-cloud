/** Device row from `GET /v1/{userSegment}/devices` */
export type AwairDevice = {
  deviceId: number;
  deviceUUID: string;
  deviceType: string;
  name?: string | null;
  roomType?: string | null;
  spaceType?: string | null;
  locationName?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  timezone?: string | null;
  macAddress?: string | null;
  preference?: string | null;
};

export type AwairDevicesResponse = {
  devices?: AwairDevice[];
};

/** `GET /v1/users/self` — shape follows python_awair AwairUser */
export type AwairUserResponse = {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  tier?: string | null;
  usages?: { scope: string; usage: number }[];
  permissions?: { scope: string; quota: number }[];
};

export type AwairSensorSample = { comp: string; value: number };

export type AwairAirDataRow = {
  timestamp: string;
  score: number;
  sensors: AwairSensorSample[];
  indices?: { comp: string; value: number }[];
};

export type AwairAirDataResponse = {
  data?: AwairAirDataRow[];
  errors?: { message?: string }[];
};
