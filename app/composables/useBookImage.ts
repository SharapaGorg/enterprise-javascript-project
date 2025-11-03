export function useBookImage() {
  const getHighQualityImageUrl = (imageUrl: string | undefined): string => {
    if (!imageUrl) return '';
    
    // Remove curl edge effect
    let url = imageUrl.replace('&edge=curl', '');
    
    // For Google Books images, we can control quality with zoom parameter
    if (url.includes('books.google.com')) {
      // Check if zoom parameter exists
      if (url.includes('zoom=')) {
        // Replace with higher zoom level
        url = url.replace(/zoom=\d/, 'zoom=3');
      } else {
        // Add zoom parameter
        url += '&zoom=3';
      }
      
      // Also increase the print type quality
      if (!url.includes('printsec=')) {
        url += '&printsec=frontcover';
      }
      
      // Request specific image size
      if (!url.includes('img=')) {
        url += '&img=1';
      }
      
      // Request high quality
      if (!url.includes('source=')) {
        url += '&source=gbs_api';
      }
    }
    
    return url;
  };

  const getImageDimensions = (size: 'small' | 'medium' | 'large' = 'medium') => {
    const dimensions = {
      small: { width: 80, height: 120 },
      medium: { width: 120, height: 180 },
      large: { width: 200, height: 300 }
    };
    
    return dimensions[size];
  };

  return {
    getHighQualityImageUrl,
    getImageDimensions
  };
}