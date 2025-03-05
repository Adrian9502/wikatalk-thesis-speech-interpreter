import {
  Touchable,
  Text,
  Image,
  View,
  TouchableOpacity,
  ImageSourcePropType,
} from "react-native";

type Props = {
  onPress(): void;
  disabled?: boolean;
  source?: ImageSourcePropType;
  imgClassname?: string;
};

const MicButton = ({ onPress, disabled, source, imgClassname }: Props) => {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled}>
      <Image source={source} className={imgClassname} />
    </TouchableOpacity>
  );
};

export default MicButton;
