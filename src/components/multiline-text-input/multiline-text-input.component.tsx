import { memo, useId } from "react";
import { Platform } from "react-native";

import { AppTextInput } from "@/components/app-text-input";
import { InputAccessoryDoneBar } from "../input-accessory-done-bar";

import type { MultilineTextInputProps } from "./multiline-text-input.interface";

export const MultilineTextInput = memo(function MultilineTextInput(props: MultilineTextInputProps) {
  const inputAccessoryViewID = useId();

  return (
    <>
      <AppTextInput
        {...props}
        multiline
        returnKeyType="done"
        blurOnSubmit
        inputAccessoryViewID={Platform.OS === "ios" ? inputAccessoryViewID : undefined}
      />
      {Platform.OS === "ios" && <InputAccessoryDoneBar nativeID={inputAccessoryViewID} />}
    </>
  );
});
