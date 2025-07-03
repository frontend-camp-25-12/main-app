import { onMounted, onUnmounted, ref } from "vue";
import { PluginView } from "../../utils/plugin";
import './plugin-number.css'

function usePluginNumber(
  open: (id: string, feature?: PluginView['feature']) => void,
  props: {
    plugins: PluginView[]
  }) {
  const showNumbers = ref(false);
  const handleAltKey = (event: KeyboardEvent) => {
    if (event.key === 'Alt') {
      showNumbers.value = event.type === 'keydown';
    }
  };

  const handleNumberKey = (event: KeyboardEvent) => {
    if (!showNumbers.value) return;
    const num = parseInt(event.key);
    if (!isNaN(num) && num > 0 && num <= props.plugins.length) {
      const plugin = props.plugins[num - 1];
      open(plugin.id, plugin.feature);
      showNumbers.value = false;
    }
  };

  onMounted(() => {
    window.addEventListener('keydown', handleAltKey);
    window.addEventListener('keyup', handleAltKey);
    window.addEventListener('keydown', handleNumberKey);
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', handleAltKey);
    window.removeEventListener('keyup', handleAltKey);
    window.removeEventListener('keydown', handleNumberKey);
  });

  return {
    showNumbers
  };
}

export default usePluginNumber;