"use client";

import { useEffect } from 'react';

export default function IOSKeyboardFix() {
  useEffect(() => {
    // Only run on iOS devices
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (!isIOS) return;

    let initialViewportHeight = window.visualViewport?.height || window.innerHeight;
    let currentlyFocusedInput: HTMLInputElement | HTMLTextAreaElement | null = null;

    // Function to handle input focus
    const handleInputFocus = (event: FocusEvent) => {
      const target = event.target as HTMLInputElement | HTMLTextAreaElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        currentlyFocusedInput = target;
        
        // Force the input to be focusable
        target.style.pointerEvents = 'auto';
        (target.style as any).webkitUserSelect = 'text';
        target.style.userSelect = 'text';
        
        // Add a small delay to ensure the keyboard appears
        setTimeout(() => {
          target.focus();
          target.click();
          
          // Scroll the input into view
          target.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
        }, 100);

        // Prevent body from being non-scalable
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
          viewport.setAttribute('content', 
            'width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover'
          );
        }
      }
    };

    // Function to handle input blur
    const handleInputBlur = () => {
      currentlyFocusedInput = null;
    };

    // Function to handle viewport changes (keyboard open/close)
    const handleViewportChange = () => {
      if (!window.visualViewport) return;
      
      const currentHeight = window.visualViewport.height;
      const heightDifference = initialViewportHeight - currentHeight;
      
      // If height difference is significant, keyboard is likely open
      if (heightDifference > 150) {
        document.body.classList.add('keyboard-open');
        
        // If there's a focused input, scroll it into view
        if (currentlyFocusedInput) {
          setTimeout(() => {
            currentlyFocusedInput?.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center',
              inline: 'nearest'
            });
          }, 300);
        }
      } else {
        document.body.classList.remove('keyboard-open');
      }
    };

    // Function to ensure inputs are properly styled for iOS
    const setupInputs = () => {
      const inputs = document.querySelectorAll('input, textarea');
      inputs.forEach((input) => {
        const element = input as HTMLInputElement | HTMLTextAreaElement;
        
        // Ensure minimum font size to prevent zoom
        if (element.style.fontSize === '' || parseFloat(element.style.fontSize) < 16) {
          element.style.fontSize = '16px';
        }
        
        // Remove any iOS styling that might interfere
        (element.style as any).webkitAppearance = 'none';
        element.style.borderRadius = '0';
        
        // Ensure proper touch behavior
        (element.style as any).webkitTouchCallout = 'default';
        (element.style as any).webkitUserSelect = 'text';
        element.style.userSelect = 'text';
      });
    };

    // Set up event listeners
    document.addEventListener('focusin', handleInputFocus, true);
    document.addEventListener('focusout', handleInputBlur, true);
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
    } else {
      window.addEventListener('resize', handleViewportChange);
    }

    // Initial setup
    setupInputs();

    // Re-setup inputs when DOM changes (for dynamic content)
    const observer = new MutationObserver(() => {
      setupInputs();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Cleanup
    return () => {
      document.removeEventListener('focusin', handleInputFocus, true);
      document.removeEventListener('focusout', handleInputBlur, true);
      
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
      } else {
        window.removeEventListener('resize', handleViewportChange);
      }
      
      observer.disconnect();
      document.body.classList.remove('keyboard-open');
    };
  }, []);

  return null;
}