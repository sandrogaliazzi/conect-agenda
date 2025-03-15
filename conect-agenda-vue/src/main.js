/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from "@/plugins";

// Components
import App from "./App.vue";
import router from "./router";
// Composables
import { createApp } from "vue";
import { useAuth } from "./composables/auth";
import userDirective from "./directives/userDirective";

const app = createApp(App);

const { listenAuthState } = useAuth(router);
listenAuthState(); //

registerPlugins(app);

app.directive("user", userDirective);
app.mount("#app");
