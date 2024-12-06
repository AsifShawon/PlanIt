import { View, Text, StyleSheet} from 'react-native';
import Header from '../components/Home/Header';

export default function HomeScreen() {

  return (
    <View style={styles.container}>
      <Header />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    
  },

});
