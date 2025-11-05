/**
 * 注册页面
 */

import { useRequest } from '@/hooks/use-request';
import { authService } from '@/services';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, Icon, Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  const [phone, setPhone] = useState('');//手机号
  const [username, setUsername] = useState('');//用户名
  const [password, setPassword] = useState('');//密码
  const [confirmPassword, setConfirmPassword] = useState('');//确认密码
  const [passwordVisible, setPasswordVisible] = useState(false);//密码可见性
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);//确认密码可见性

  const [phoneError, setPhoneError] = useState('');//手机号错误
  const [nicknameError, setNicknameError] = useState('');//昵称错误
  const [passwordError, setPasswordError] = useState('');//密码错误
  const [confirmPasswordError, setConfirmPasswordError] = useState('');//确认密码错误

  // 注册请求
  const { loading: registering, runAsync: registerAsync } = useRequest(
    authService.register,
    {
      manual: true,
    }
  );

  // 验证表单
  const validateForm = (): boolean => {
    let isValid = true;

    // 验证手机号
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phone) {
      setPhoneError('请输入手机号');
      isValid = false;
    } else if (!phoneRegex.test(phone)) {
      setPhoneError('请输入正确的手机号');
      isValid = false;
    } else {
      setPhoneError('');
    }

    // 验证昵称
    if (!username) {
      setNicknameError('请输入昵称');
      isValid = false;
    } else if (username.length < 2) {
      setNicknameError('昵称至少2个字符');
      isValid = false;
    } else if (username.length > 20) {
      setNicknameError('昵称最多20个字符');
      isValid = false;
    } else {
      setNicknameError('');
    }

    // 验证密码
    if (!password) {
      setPasswordError('请输入密码');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('密码至少6位');
      isValid = false;
    } else {
      setPasswordError('');
    }

    // 验证确认密码
    if (!confirmPassword) {
      setConfirmPasswordError('请确认密码');
      isValid = false;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError('两次密码不一致');
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }

    return isValid;
  };

  // 处理注册
  const handleRegister = async () => {
    if (validateForm()) {
      const [error, data] = await registerAsync({ phone, username, password });
      if (error) {
        Alert.alert('注册失败', '注册失败,请稍后重试');
      } else if (data) {
        // 注册成功后跳转到登录页并自动填充用户名密码
        Alert.alert('注册成功', '欢迎加入!即将跳转到登录页面...', [
          {
            text: '确定',
            onPress: () => {
              router.replace({
                pathname: '/auth/login',
                params: {
                  phone: phone,
                  password: password,
                },
              });
            },
          },
        ]);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={require('@/assets/images/cooker.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
          keyboardVerticalOffset={0}
        >
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* 顶部logo区域 */}
            <View style={styles.headerContainer}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backButton}
              >
                <Icon source="arrow-left" size={24} color="#333" />
              </TouchableOpacity>

              <View style={styles.logoContainer}>
                <Icon source="silverware-fork-knife" size={64} color="#FF7214" />
              </View>
              <Text style={styles.title}>用户注册</Text>
              <Text style={styles.subtitle}>创建您的餐厅账号</Text>
            </View>

            {/* 表单区域 */}
            <View style={styles.formContainer}>
              {/* 手机号 */}
              <TextInput
                label="手机号"
                value={phone}
                onChangeText={(text) => {
                  setPhone(text);
                  setPhoneError('');
                }}
                keyboardType="phone-pad"
                maxLength={11}
                error={!!phoneError}
                mode="outlined"
                style={styles.input}
                outlineColor="#E0E0E0"
                activeOutlineColor="#FF7214"
                left={<TextInput.Icon icon="phone" color="#FF7214" />}
              />
              {phoneError ? (
                <Text style={styles.errorText}>{phoneError}</Text>
              ) : null}

              {/* 昵称 */}
              <TextInput
                label="昵称"
                value={username}
                onChangeText={(text) => {
                  setUsername(text);
                  setNicknameError('');
                }}
                maxLength={20}
                error={!!nicknameError}
                mode="outlined"
                style={styles.input}
                outlineColor="#E0E0E0"
                activeOutlineColor="#FF7214"
                left={<TextInput.Icon icon="account" color="#FF7214" />}
              />
              {nicknameError ? (
                <Text style={styles.errorText}>{nicknameError}</Text>
              ) : null}

              {/* 密码 */}
              <TextInput
                label="密码"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setPasswordError('');
                }}
                secureTextEntry={!passwordVisible}
                error={!!passwordError}
                mode="outlined"
                style={styles.input}
                outlineColor="#E0E0E0"
                activeOutlineColor="#FF7214"
                left={<TextInput.Icon icon="lock" color="#FF7214" />}
                right={
                  <TextInput.Icon
                    icon={passwordVisible ? 'eye-off' : 'eye'}
                    onPress={() => setPasswordVisible(!passwordVisible)}
                  />
                }
              />
              {passwordError ? (
                <Text style={styles.errorText}>{passwordError}</Text>
              ) : null}

              {/* 确认密码 */}
              <TextInput
                label="确认密码"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setConfirmPasswordError('');
                }}
                onFocus={() => {
                  setTimeout(() => {
                    scrollViewRef.current?.scrollTo({ y: 200, animated: true });
                  }, 100);
                }}
                onBlur={() => {
                  setTimeout(() => {
                    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                  }, 100);
                }}
                secureTextEntry={!confirmPasswordVisible}
                error={!!confirmPasswordError}
                mode="outlined"
                style={styles.input}
                outlineColor="#E0E0E0"
                activeOutlineColor="#FF7214"
                left={<TextInput.Icon icon="lock-check" color="#FF7214" />}
                right={
                  <TextInput.Icon
                    icon={confirmPasswordVisible ? 'eye-off' : 'eye'}
                    onPress={() =>
                      setConfirmPasswordVisible(!confirmPasswordVisible)
                    }
                  />
                }
              />
              {confirmPasswordError ? (
                <Text style={styles.errorText}>{confirmPasswordError}</Text>
              ) : null}

              {/* 注册按钮 */}
              <Button
                mode="contained"
                onPress={handleRegister}
                loading={registering}
                disabled={registering}
                style={styles.registerButton}
                contentStyle={styles.registerButtonContent}
                buttonColor="#FF7214"
              >
                注册
              </Button>

              {/* 登录链接 */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>已有账号？</Text>
                <TouchableOpacity onPress={() => router.back()}>
                  <Text style={styles.loginLink}>立即登录</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6EAE3',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 200,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 100,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  input: {
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 12,
    marginBottom: 12,
    marginLeft: 4,
  },
  registerButton: {
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  registerButtonContent: {
    height: 48,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#666',
    fontSize: 14,
  },
  loginLink: {
    color: '#FF7214',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
});
