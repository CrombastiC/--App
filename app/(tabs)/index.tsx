import * as ImagePicker from 'expo-image-picker';
import { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import {
  Appbar,
  Avatar,
  Button,
  HelperText,
  SegmentedButtons,
  Snackbar,
  Surface,
  Text,
  TextInput,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useProfileStore } from '@/stores/profile-store';

const GENDER_OPTIONS = [
  { value: 'male', label: '男' },
  { value: 'female', label: '女' },
  { value: 'other', label: '其他' },
] as const;

export default function HomeScreen() {
  const profiles = useProfileStore((state) => state.profiles);
  const addProfile = useProfileStore((state) => state.addProfile);
  const [name, setName] = useState('');//表单名字
  const [age, setAge] = useState('');//表单年龄
  const [role, setRole] = useState('');//表单职位
  const [gender, setGender] = useState<typeof GENDER_OPTIONS[number]['value']>('male');//表单选择性别
  const [notes, setNotes] = useState('');//表单备注
  const [avatarUri, setAvatarUri] = useState<string | undefined>(undefined);//头像地址
  const [showForm, setShowForm] = useState(false);//是否显示表单
  const [hasSubmitted, setHasSubmitted] = useState(false);//是否提交过表单
  const [snackbarVisible, setSnackbarVisible] = useState(false);//提示条

  const hasErrors = useMemo(() => ({
    name: name.trim().length === 0,
    age: age.trim().length > 0 && Number.isNaN(Number(age)),
    role: role.trim().length === 0,
  }), [name, age, role]);

  const shouldValidate = hasSubmitted;

  const resetForm = () => {
    setName('');
    setAge('');
    setRole('');
    setGender('male');
    setNotes('');
    setAvatarUri(undefined);
    setHasSubmitted(false);
  };

  const handlePickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert('无法访问相册', '请在系统设置中授权访问照片以上传头像。');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled && result.assets.length > 0) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    setHasSubmitted(true);
    if (hasErrors.name || hasErrors.age || hasErrors.role) {
      return;
    }

    addProfile({
      name: name.trim(),
      age: age.trim(),
      role: role.trim(),
      gender,
      notes: notes.trim() || undefined,
      avatarUri,
    });

    setSnackbarVisible(true);
    resetForm();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Appbar.Header mode="small">
        <Appbar.Content title="个人信息录入" />
        <Appbar.Action
          icon="refresh"
          onPress={() => resetForm()}
          accessibilityLabel="重置表单"
        />
      </Appbar.Header>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content}>
          {!showForm ? (
            <Surface style={styles.introSurface} elevation={2}>
              <Text variant="titleLarge">录入新成员</Text>
              <Text variant="bodyMedium" style={styles.introText}>
                点击下方按钮开始填写表单。信息将在“人员列表”页面中展示。
              </Text>
              <Button
                mode="contained"
                onPress={() => {
                  setShowForm(true);
                  setHasSubmitted(false);
                }}
                style={styles.introButton}
              >
                开始填写
              </Button>
            </Surface>
          ) : (
            <Surface style={styles.surface} elevation={2}>
              <Text variant="titleMedium">基本信息</Text>
              <View style={styles.avatarRow}>
                {avatarUri ? (
                  <Avatar.Image size={72} source={{ uri: avatarUri }} />
                ) : (
                  <Avatar.Icon size={72} icon="account" />
                )}
                <View style={styles.avatarActions}>
                  <Button mode="outlined" onPress={handlePickAvatar}>
                    {avatarUri ? '重新选择' : '上传头像'}
                  </Button>
                  {avatarUri ? (
                    <Button onPress={() => setAvatarUri(undefined)}>移除头像</Button>
                  ) : null}
                </View>
              </View>

              <TextInput
                label="姓名"
                value={name}
                onChangeText={setName}
                mode="outlined"
                error={shouldValidate && hasErrors.name}
                placeholder="请输入姓名"
              />
              <HelperText type={shouldValidate && hasErrors.name ? 'error' : 'info'} visible>
                {shouldValidate && hasErrors.name ? '姓名不能为空' : '用于在统计列表中标识人员'}
              </HelperText>

              <TextInput
                label="年龄"
                value={age}
                onChangeText={setAge}
                mode="outlined"
                keyboardType="number-pad"
                error={shouldValidate && Boolean(hasErrors.age)}
                placeholder="请输入您的年龄"
              />
              <HelperText type={shouldValidate && hasErrors.age ? 'error' : 'info'} visible>
                {shouldValidate && hasErrors.age ? '年龄需为数字' : '支持不填，该字段为可选'}
              </HelperText>

              <TextInput
                label="职位"
                value={role}
                onChangeText={setRole}
                mode="outlined"
                error={shouldValidate && hasErrors.role}
                placeholder="请输入您的职位"
              />
              {shouldValidate && hasErrors.role && <HelperText type="error">职位不能为空</HelperText>}

              <Text variant="titleSmall">性别</Text>
              <SegmentedButtons
                value={gender}
                onValueChange={(value) => setGender(value as typeof gender)}
                buttons={GENDER_OPTIONS.map(({ value, label }) => ({ value, label }))}
              />

              <TextInput
                label="备注"
                value={notes}
                onChangeText={setNotes}
                mode="outlined"
                multiline
                numberOfLines={3}
                placeholder="补充说明（可选）"
              />

              <Button mode="contained" onPress={handleSubmit} style={styles.submitButton}>
                提交信息
              </Button>
            </Surface>
          )}

          <Surface style={styles.surface} elevation={1}>
            <Text variant="titleSmall">当前统计</Text>
            <Text variant="headlineSmall">共 {profiles.length} 人</Text>
            {profiles.length === 0 && (
              <Text variant="bodyMedium">提交后可在“列表”标签页查看列表。</Text>
            )}
          </Surface>
        </ScrollView>
      </KeyboardAvoidingView>
      <Snackbar visible={snackbarVisible} onDismiss={() => setSnackbarVisible(false)} duration={2000}>
        信息已提交，可在列表中查看
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 24,
  },
  introSurface: {
    padding: 24,
    borderRadius: 20,
    gap: 12,
  },
  introText: {
    color: '#546e7a',
  },
  introButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  surface: {
    padding: 16,
    borderRadius: 16,
    gap: 16,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarActions: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  submitButton: {
    marginTop: 8,
  },
});
