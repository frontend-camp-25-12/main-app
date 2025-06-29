import { defineComponent, h, PropType, VNode } from "vue";
import { MatchRange } from "../../../../../share/plugins/type";

export default defineComponent({
  name: "TextHighlight",
  props: {
    text: {
      type: String,
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
      const { text, ranges } = props;
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