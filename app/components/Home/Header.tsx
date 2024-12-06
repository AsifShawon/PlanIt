import { Image, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { FIREBASE_AUTH } from '../../../FirebaseConfig'

const Header = () => {
    const user = FIREBASE_AUTH.currentUser;
  return (
    <View style={styles.container}>
      <View>
        <Image style={styles.profileImage} source={require('../../../assets/user.png')} />
        </View>
    </View>
  )
}

export default Header

const styles = StyleSheet.create({
    container:{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 50,
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f2f2f2'
    },
    profileImage:{
        width: 50,
        height: 50,
        borderRadius: 50,
        margin: 10
    }
})