export * from "./authService";
export * from "./userService";
export * from "./gameService";
export * from "./progressService";
export * from "./themeService";
export * from "./translationService";
export * from "./pronunciationService";
export * from "./baseApi";

// Also export all services together for convenience
import { authService } from "./authService";
import { userService } from "./userService";
import { gameService } from "./gameService";
import { progressService } from "./progressService";
import { themeService } from "./themeService";
import { translationService } from "./translationService";
import { pronunciationService } from "./pronunciationService";

export const services = {
  auth: authService,
  user: userService,
  game: gameService,
  progress: progressService,
  theme: themeService,
  translation: translationService,
  pronunciation: pronunciationService,
};
