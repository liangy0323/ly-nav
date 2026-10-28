/**
 * 将 HTTP(S) 网站地址转换为 Favicon.im 的大尺寸图标地址，不传递路径、查询参数和凭据。
 * 由图片元素直接加载，找不到图标时返回 404 以触发卡片兜底；无有效网站地址时返回空值。
 */
export const getWebsiteIcon = (href: string): string => {
  try {
    const url = new URL(href);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return '';
    return `https://a.favicon.im/${encodeURIComponent(url.hostname)}?larger=true&throw-error-on-404=true`;
  } catch {
    return '';
  }
};
