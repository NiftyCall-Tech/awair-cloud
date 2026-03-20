/** Common Awair `roomType` values — extend as needed for your deployment. */
export const roomTypeOptions = [
  { value: "LIVING_ROOM", label: "Living Room" },
  { value: "BEDROOM", label: "Bedroom" },
  { value: "OFFICE", label: "Office" },
  { value: "KITCHEN", label: "Kitchen" },
  { value: "COMMERCIAL_LOBBY", label: "Commercial Lobby" },
  { value: "OTHER", label: "Other" },
] as const;
