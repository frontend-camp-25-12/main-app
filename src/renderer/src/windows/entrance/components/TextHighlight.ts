import { defineComponent, h, PropType, VNode, ComputedRef } from "vue";
import { MatchRange } from "../../../../../share/plugins/type";

export default defineComponent({
  name: "TextHighlight",
  props: {
    text: {
      type: [String, Object] as PropType<string | ComputedRef<string>>,
      required: true,
    },
    ranges: {
      type: Array as PropType<MatchRange>,
      required: false,
      default: () => [],
    },
  },
  setup(props) {
    return () => {
      let { text, ranges } = props;
      if (typeof text === 'object') text = text.value;
      if (!ranges || ranges.length === 0) return h('span', text);

      let curr = 0;
      const elements: VNode[] = [];
      for (const r of ranges) {
        const [start, end] = r;
        if (start > curr) {
          elements.push(h('span', text.slice(curr, start)));
        }
        elements.push(h('span', { class: 'highlight' }, text.slice(start, end)));
        curr = end;
      }
      if (curr < text.length) {
        elements.push(h('span', text.slice(curr)));
      }
      return elements;
    };
  }
});