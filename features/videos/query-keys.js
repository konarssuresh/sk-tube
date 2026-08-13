export const videoKeys = {
  all: ["videos"],
  byChannel: (channelId) => [...videoKeys.all, "byChannel", channelId],
};
