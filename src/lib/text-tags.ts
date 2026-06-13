import { TextTag } from '@/types';

export const TEXT_TAGS: TextTag[] = [
  { label: '轻声', value: '（轻声）', target: 'text' },
  { label: '停顿', value: '[停顿]', target: 'text' },
  { label: '强调', value: '[强调]', target: 'text' },
  { label: '叹气', value: '[叹气]', target: 'text' },
  { label: '粤语', value: '（粤语）', target: 'text' },
  { label: '唱歌', value: '(唱歌)', target: 'text', presetOnly: true },
];
