import sharpService from 'astro/assets/services/sharp';

export default {
  validateOptions(options) {
    if (!options.format) options.format = 'avif';
    return options;
  },
  getURL: sharpService.getURL.bind(sharpService),
  parseURL: sharpService.parseURL.bind(sharpService),
  getHTMLAttributes: sharpService.getHTMLAttributes.bind(sharpService),
  getSrcSet: sharpService.getSrcSet.bind(sharpService),
  getRemoteSize: sharpService.getRemoteSize.bind(sharpService),
  async transform(inputBuffer, options, config) {
    const opts = { ...options };
    if (!opts.format) opts.format = 'avif';
    // 源格式与目标格式相同 → 直接透传（用户已预压缩 AVIF）
    if (opts.format === 'avif' && opts.src?.endsWith('.avif')) {
      return { data: inputBuffer, format: 'avif' };
    }
    return sharpService.transform(inputBuffer, opts, config);
  },
};
