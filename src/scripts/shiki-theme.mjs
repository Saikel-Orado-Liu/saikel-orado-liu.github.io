/**
 * 自定义 Shiki 亮色主题 — 基于 github-light，仅修改基础文字色为项目主文本色。
 * 暗色主题使用内置 github-dark。
 */
import githubLight from '@shikijs/themes/github-light';

const projectLightText = '#392d16'; // color-mix(#1a1a1a, #E89800 15%)

const customLight = {
  ...githubLight,
  name: 'project-light',
  colors: {
    ...githubLight.colors,
    'editor.foreground': projectLightText,
  },
  tokenColors: githubLight.tokenColors.map(t => {
    if (t.settings?.foreground === '#24292e') {
      return { ...t, settings: { ...t.settings, foreground: projectLightText } };
    }
    return t;
  }),
};

export default customLight;
