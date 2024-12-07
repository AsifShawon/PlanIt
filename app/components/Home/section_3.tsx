import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Image } from 'expo-image'
import Ionicons from '@expo/vector-icons/Ionicons';

const CreatePlanSection = ({ navigation }: any) => {
    return (
        <View style={styles.container}>
            <Image
                source={require('../../../assets/planit.gif')}
                style={styles.gif}
            />
            <TouchableOpacity
                style={styles.createButton}
                onPress={() => navigation.navigate('CreatePlan')}
            >
                <View style={styles.icon_container}>
                    <Ionicons name="create-outline" size={80} style={styles.icon} />
                    <Text style={styles.buttonText}>Create Plan</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        flexDirection: 'row',
        marginVertical: 10,
        alignItems: 'center',
    },
    gif: {
        width: 200,
        height: 200,
        borderRadius: 12,
        marginRight: 16,
    },
    createButton: {
        backgroundColor: '#3A4646',
        padding: 16,
        paddingVertical: 24,
        paddingLeft: 24,
        paddingRight: 24,
        borderRadius: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        width: 150,
    },
    icon_container: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    icon: {
        color: '#ffffff',
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '600',
        textAlign: 'center',
    },
});

export default CreatePlanSection;