export function useBookImage() {
  const getHighQualityImageUrl = (imageUrl: string | undefined): string => {
    if (!imageUrl) return '';
    
    // Ensure HTTPS
    let url = imageUrl.replace('http://', 'https://');
    
    // Remove curl edge effect if present
    url = url.replace('&edge=curl', '');
    
    // For Google Books images, we can control quality with zoom parameter
    if (url.includes('books.google.com') && url.includes('zoom=')) {
      // Only modify zoom if it's already present and low
      url = url.replace(/zoom=1/, 'zoom=2');
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

  const generatePlaceholderUrl = (title: string, isbn?: string) => {
    // Use a service like via.placeholder.com or return empty for local placeholder
    // You could also use services like covers.openlibrary.org
    if (isbn) {
      // Try OpenLibrary covers as a fallback
      return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
    }
    return '';
  };

  const getBookImageUrl = (book: { cover?: string; thumbnail?: string; title: string; isbn?: string }) => {
    const imageUrl = book.cover || book.thumbnail;
    if (imageUrl) {
      return getHighQualityImageUrl(imageUrl);
    }
    // Try to get a placeholder from OpenLibrary if we have ISBN
    if (book.isbn) {
      return generatePlaceholderUrl(book.title, book.isbn);
    }
    return '';
  };

  return {
    getHighQualityImageUrl,
    getImageDimensions,
    generatePlaceholderUrl,
    getBookImageUrl
  };
}