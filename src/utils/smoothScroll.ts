export const smoothScrollTo = (element: HTMLElement | null, offset = 0) => {
  if (!element || typeof window === 'undefined') return;
  
  try {
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  } catch (error) {
    console.warn('Smooth scroll failed:', error);
  }
};

export const scrollToTop = () => {
  if (typeof window === 'undefined') return;
  
  try {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  } catch (error) {
    console.warn('Scroll to top failed:', error);
  }
};

export const scrollToElement = (id: string, offset = 80) => {
  if (typeof document === 'undefined') return;
  
  const element = document.getElementById(id);
  smoothScrollTo(element, offset);
};