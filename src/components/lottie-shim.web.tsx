// Web shim for lottie-react-native — the native module pulls in
// @lottiefiles/dotlottie-react which OOM-crashes Metro on this VPS.
// Lottie animations are native-only; on web we render nothing.
import React from 'react';
import { View } from 'react-native';

const LottieView = React.forwardRef((props: any, _ref: any) => {
  return <View style={props.style} />;
});

LottieView.displayName = 'LottieView';

export default LottieView;
