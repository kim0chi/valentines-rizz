// Helper to get correct asset path for GitHub Pages
export const getAssetPath = (path: string) => {
  const basePath = process.env.NODE_ENV === 'production' ? '/valentines-rizz' : '';
  return `${basePath}${path}`;
};
