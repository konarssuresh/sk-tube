export const authKeys = {
  all: ["auth"],
  login: () => [...authKeys.all, "login"],
  register: () => [...authKeys.all, "register"],
  logout: () => [...authKeys.all, "logout"],
  currentUser: () => [...authKeys.all, "current-user"],
};
