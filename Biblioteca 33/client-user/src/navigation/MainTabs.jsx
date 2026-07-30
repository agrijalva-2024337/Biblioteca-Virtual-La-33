// client-user/src/navigation/MainTabs.jsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, FONT_SIZE } from '../shared/constants/theme.js';
import { HomeScreen } from '../features/home/screens/HomeScreen.jsx';
import { GradesListScreen } from '../features/materials/screens/GradesListScreen.jsx';
import { GradeSubjectsScreen } from '../features/materials/screens/GradeSubjectsScreen.jsx';
import { SubjectFilesScreen } from '../features/materials/screens/SubjectFilesScreen.jsx';
import { MaterialDetailScreen } from '../features/materials/screens/MaterialDetailScreen.jsx';
import { UploadScreen } from '../features/upload/screens/UploadScreen.jsx';
import { NotificationsScreen } from '../features/notifications/screens/NotificationsScreen.jsx';
import { ProfileScreen } from '../features/profile/screens/ProfileScreen.jsx';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const MaterialsStack = createNativeStackNavigator();

const stackScreenOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: COLORS.background },
};

const headerOptions = {
  headerShown: true,
  headerStyle: { backgroundColor: COLORS.surface },
  headerTintColor: COLORS.text,
  headerTitleStyle: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: FONT_SIZE.lg,
  },
  headerShadowVisible: false,
};

const HomeStackNavigator = () => (
  <HomeStack.Navigator screenOptions={stackScreenOptions}>
    <HomeStack.Screen name="Home" component={HomeScreen} />
    <HomeStack.Screen name="MaterialDetail" component={MaterialDetailScreen} />
  </HomeStack.Navigator>
);

/** Jerarquía de carpetas: Grados → Asignaturas → Archivos → Detalle */
const MaterialsStackNavigator = () => (
  <MaterialsStack.Navigator screenOptions={stackScreenOptions}>
    <MaterialsStack.Screen name="GradesList" component={GradesListScreen} />
    <MaterialsStack.Screen name="GradeSubjects" component={GradeSubjectsScreen} />
    <MaterialsStack.Screen name="SubjectFiles" component={SubjectFilesScreen} />
    <MaterialsStack.Screen name="MaterialDetail" component={MaterialDetailScreen} />
  </MaterialsStack.Navigator>
);

const tabBarIcon =
  (name) =>
  ({ color, size }) =>
    <MaterialIcons name={name} size={size} color={color} />;

export const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.secondary,
      tabBarStyle: {
        backgroundColor: COLORS.surface,
        height: 60,
        borderTopColor: COLORS.border,
        borderTopWidth: 1,
      },
      tabBarLabelStyle: {
        fontSize: FONT_SIZE.xs,
        fontWeight: '600',
        marginBottom: 6,
      },
    }}
  >
    <Tab.Screen
      name="InicioTab"
      component={HomeStackNavigator}
      options={{
        title: 'Inicio',
        tabBarIcon: tabBarIcon('home'),
      }}
    />
    <Tab.Screen
      name="MaterialesTab"
      component={MaterialsStackNavigator}
      options={{
        title: 'Materiales',
        tabBarIcon: tabBarIcon('menu-book'),
      }}
    />
    <Tab.Screen
      name="SubirTab"
      component={UploadScreen}
      options={{
        title: 'Subir',
        tabBarIcon: tabBarIcon('cloud-upload'),
      }}
    />
    <Tab.Screen
      name="NotificacionesTab"
      component={NotificationsScreen}
      options={{
        title: 'Notificaciones',
        tabBarIcon: tabBarIcon('notifications'),
      }}
    />
    <Tab.Screen
      name="PerfilTab"
      component={ProfileScreen}
      options={{
        title: 'Perfil',
        tabBarIcon: tabBarIcon('person'),
        ...headerOptions,
        headerTitle: 'Perfil',
      }}
    />
  </Tab.Navigator>
);
