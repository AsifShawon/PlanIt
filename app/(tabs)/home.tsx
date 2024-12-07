import { View, StyleSheet, ScrollView } from 'react-native';
import Header from '../components/Home/Header';
import PlansSlider from '../components/Home/PlanSection';
import PublicPlansSection from '../components/Home/publicPlan';
import CreatePlanSection from '../components/Home/section_3';

export default function HomeScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Header />
        <PlansSlider navigation={navigation} />
        <PublicPlansSection navigation={navigation} />
        <CreatePlanSection navigation={navigation} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#C1CB9C',
  },
  scrollView: {
    flex: 1,
  },
});