import React from "react";
import { StatusBar } from "react-native";
import {
  NavigationContainer,
} from "@react-navigation/native";
import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";
import {
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import {
  Home,
  GitFork,
  PenTool,
  Newspaper,
  Flame,
} from "lucide-react-native";
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
// Main screens
import WelcomeScreen from "./screens/WelcomeScreen";
import UserLoginScreen from "./screens/UserLoginScreen";
import UserSignUpScreen from "./screens/UserSignUpScreen";
import HomeScreen from "./screens/HomeScreen";
import TreeScreen from "./screens/TreeScreen";
import WritersScreen from "./screens/WritersScreen";
import NewsScreen from "./screens/NewsScreen";
import MemorialScreen from "./screens/MemorialScreen";
import ContactScreen from "./screens/ContactScreen";
import GalleryScreen from "./screens/GalleryScreen";
import MunicipalityScreen from "./screens/MunicipalityScreen";
import AdContactScreen from "./screens/AdContactScreen";
// Admin screens
import AdminPanelScreen from "./screens/AdminPanelScreen";
import AdminManagementScreen from "./screens/AdminManagementScreen";
import ManageWritersScreen from "./screens/ManageWritersScreen";
import ManageTreeScreen from "./screens/ManageTreeScreen";
import ManageNewsScreen from "./screens/ManageNewsScreen";
import ManageGalleryScreen from "./screens/ManageGalleryScreen";
import ManageAdsScreen from "./screens/ManageAdScreen";
import ManageBllasanAboutScreen from "./screens/ManageBllasanAboutScreen";
// Writer / article screens
import AuthScreen from "./screens/AuthorsScreen";
import WriterProfileScreen from "./screens/WriterProfileScreen";
import WriterProfileCreateScreen from "./screens/WriterProfileCreateScreen";
import ArticleDetailsScreen from "./screens/ArticleDetailsScreen";
import WriterDashboardScreen from "./screens/WriterDashboardScreen";
import CreateArticleScreen from "./screens/CreateArticleScreen";
import EditArticleScreen from "./screens/EditArticleScreen";
import ChangePasswordScreen from "./screens/ChangePasswordScreen";
import BllasanAboutScreen from "./screens/BllasanAboutScreen";
import ManageQuickNewsScreen from "./screens/ManageQuickNewsScreen";
import WeatherScreen from "./screens/WeatherScreen";
import AiScreen from "./screens/AiScreen";
// Municipality
import MunicipalitySectionScreen from "./screens/MunicipalitySectionScreen";

// Admin login
import LoginAdminPanelScreen from "./screens/LoginAdmnPanelScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const COLORS = {
  background: "#0B1F33",
  tabBarBg: "#0B1F33",
  cardBorder: "#D4A017",
  primary: "#D4A017",
  textSub: "#AAB4BE",
};


function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.tabBarBg,
          borderTopColor: COLORS.cardBorder,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 6,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSub,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "سەرەکی",
          tabBarIcon: ({ color, size }) => (
            <Home color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="Tree"
        component={TreeScreen}
        options={{
          tabBarLabel: "شجرەنامە",
          tabBarIcon: ({ color, size }) => (
            <GitFork color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="Writers"
        component={WritersScreen}
        options={{
          tabBarLabel: "نووسەران",
          tabBarIcon: ({ color, size }) => (
            <PenTool color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="News"
        component={NewsScreen}
        options={{
          tabBarLabel: "هەواڵ",
          tabBarIcon: ({ color, size }) => (
            <Newspaper color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
  name="BllasanAbout"
  component={BllasanAboutScreen}
  options={{
    tabBarLabel: "بڵەسەن",
    tabBarIcon: ({ color, size }) => (
      <Home color={color} size={size} />
    ),
  }}
/>
    </Tab.Navigator>
  );
}

function RootStack() {
  return (
    <Stack.Navigator
      id="root"
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* =========================
          MAIN
      ========================== */}

      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{ headerShown: false }}
      />
<Stack.Screen
  name="UserLogin"
  component={UserLoginScreen}
  options={{ headerShown: false }}
/>

<Stack.Screen
  name="UserSignUp"
  component={UserSignUpScreen}
  options={{ headerShown: false }}
/>
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Contact"
        component={ContactScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Gallery"
        component={GalleryScreen}
        options={{ headerShown: false }}
      />
<Stack.Screen
  name="Memorial"
  options={{ headerShown: false }}
>
  {(props) => (
    <MemorialScreen
      {...props}
      isAdmin={false}
    />
  )}
</Stack.Screen>
      {/* =========================
          ADMIN LOGIN / PANEL
      ========================== */}

      <Stack.Screen
        name="AdminPanel"
        component={LoginAdminPanelScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="AdminPanelHome"
        component={AdminPanelScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="AdminManagement"
        component={AdminManagementScreen}
        options={{ headerShown: false }}
      />

      {/* =========================
          ADMIN MANAGEMENT
      ========================== */}

      <Stack.Screen
        name="ManageTree"
        component={ManageTreeScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="ManageWriters"
        component={ManageWritersScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="ManageNews"
        component={ManageNewsScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="ManageGallery"
        component={ManageGalleryScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="ManageGalleryScreen"
        component={ManageGalleryScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="ManageObituaries"
        options={{ headerShown: false }}
      >
        {(props) => (
          <MemorialScreen
            {...props}
            isAdmin={true}
          />
        )}
      </Stack.Screen>

      <Stack.Screen
        name="ManageDirectory"
        options={{ headerShown: false }}
      >
        {(props) => (
          <ContactScreen
            {...props}
            isAdmin={true}
          />
        )}
      </Stack.Screen>

      <Stack.Screen
        name="AdminMunicipality"
        options={{ headerShown: false }}
      >
        {(props) => (
          <MunicipalityScreen
            {...props}
            isAdmin={true}
          />
        )}
      </Stack.Screen>

      {/* =========================
          WRITERS / ARTICLES
      ========================== */}

      <Stack.Screen
        name="AuthScreen"
        component={AuthScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="WriterProfile"
        component={WriterProfileScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="WriterProfileCreate"
        component={WriterProfileCreateScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="WriterDashboard"
        component={WriterDashboardScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="ArticleDetails"
        component={ArticleDetailsScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="CreateArticle"
        component={CreateArticleScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="EditArticle"
        component={EditArticleScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ headerShown: false }}
      />
<Stack.Screen
  name="ManageQuickNews"
  component={ManageQuickNewsScreen}
/>
<Stack.Screen
  name="Weather"
  component={WeatherScreen}
  options={{ headerShown: false }}
/>

<Stack.Screen
  name="ManageAds"
  component={ManageAdsScreen}
  options={{ headerShown: false }}
/>
      {/* =========================
          MUNICIPALITY
      ========================== */}

      <Stack.Screen
        name="Municipality"
        component={MunicipalityScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
  name="AdContact"
  component={AdContactScreen}
  options={{ headerShown: false }}
/>
<Stack.Screen
  name="ManageBllasanAbout"
  component={ManageBllasanAboutScreen}
  options={{ headerShown: false }}
/>

      <Stack.Screen
        name="MunicipalitySection"
        component={MunicipalitySectionScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.background}
      />

      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <NavigationContainer>
          <RootStack />
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}