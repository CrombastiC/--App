import React from 'react';
import {
  TextInput as NativeTextInput,
  type TextInputProps as NativeTextInputProps,
} from 'react-native';
import { TextInput as PaperTextInput } from 'react-native-paper';

type PaperTextInputProps = React.ComponentProps<typeof PaperTextInput>;
type CompatTextInputProps = Omit<
  PaperTextInputProps,
  keyof NativeTextInputProps
> &
  NativeTextInputProps;

type CompatTextInput = React.ForwardRefExoticComponent<
  CompatTextInputProps & React.RefAttributes<NativeTextInput>
> &
  Pick<typeof PaperTextInput, 'Icon' | 'Affix'>;

/**
 * React Native 0.81 与 react-native-paper 5 的声明兼容层。
 * Paper 运行时会透传原生 TextInput 属性，但其声明未完整暴露这些属性。
 */
export const TextInput = PaperTextInput as unknown as CompatTextInput;
