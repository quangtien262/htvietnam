/**
 * Utility functions for safe localStorage operations
 */

/**
 * Check localStorage available space (approximate)
 */
export const getLocalStorageSize = (): number => {
    let total = 0;
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            total += localStorage[key].length + key.length;
        }
    }
    return total;
};

/**
 * Get localStorage size in human-readable format
 */
export const getLocalStorageSizeFormatted = (): string => {
    const bytes = getLocalStorageSize();
    const kb = bytes / 1024;
    const mb = kb / 1024;

    if (mb >= 1) {
        return `${mb.toFixed(2)} MB`;
    } else if (kb >= 1) {
        return `${kb.toFixed(2)} KB`;
    } else {
        return `${bytes} bytes`;
    }
};

/**
 * Check if localStorage is available and has space
 * Most browsers limit localStorage to 5-10MB
 */
export const checkLocalStorageAvailable = (): boolean => {
    try {
        const test = '__storage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
};

/**
 * Get remaining localStorage space (approximate)
 * Typical limit: 5-10MB, we'll use 5MB as safe limit
 */
export const getLocalStorageRemaining = (): number => {
    const LIMIT = 5 * 1024 * 1024; // 5MB in bytes
    const used = getLocalStorageSize();
    return LIMIT - used;
};

/**
 * Check if there's enough space to store data
 */
export const hasEnoughSpace = (dataSize: number): boolean => {
    const remaining = getLocalStorageRemaining();
    // Keep at least 500KB buffer
    const BUFFER = 500 * 1024;
    return remaining > (dataSize + BUFFER);
};

/**
 * Safe localStorage setItem with size check
 */
export const safeSetItem = (key: string, value: string): boolean => {
    try {
        // Check if storage is available
        if (!checkLocalStorageAvailable()) {
            console.warn('localStorage is not available');
            return false;
        }

        // Estimate new size
        const currentValue = localStorage.getItem(key) || '';
        const currentSize = currentValue.length + key.length;
        const newSize = value.length + key.length;
        const deltaSize = newSize - currentSize;

        // Check if we have enough space
        if (deltaSize > 0 && !hasEnoughSpace(deltaSize)) {
            console.warn('Not enough localStorage space. Current usage:', getLocalStorageSizeFormatted());

            // Try to clean up old POS data (older than 7 days)
            cleanupOldPOSData();

            // Check again after cleanup
            if (!hasEnoughSpace(deltaSize)) {
                console.error('Still not enough space after cleanup');
                return false;
            }
        }

        localStorage.setItem(key, value);
        return true;
    } catch (e) {
        if (e instanceof DOMException && (
            e.code === 22 ||
            e.code === 1014 ||
            e.name === 'QuotaExceededError' ||
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED'
        )) {
            console.error('localStorage quota exceeded');
            // Try cleanup and retry once
            cleanupOldPOSData();
            try {
                localStorage.setItem(key, value);
                return true;
            } catch (retryError) {
                console.error('Still failed after cleanup');
                return false;
            }
        }
        console.error('Error saving to localStorage:', e);
        return false;
    }
};

/**
 * Clean up old POS data to free up space
 */
export const cleanupOldPOSData = (): void => {
    try {
        // Remove old held invoices (older than 7 days)
        const heldInvoices = localStorage.getItem('heldInvoices');
        if (heldInvoices) {
            try {
                const invoices = JSON.parse(heldInvoices);
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

                const filtered = invoices.filter((inv: any) => {
                    const timestamp = new Date(inv.timestamp);
                    return timestamp > sevenDaysAgo;
                });

                if (filtered.length < invoices.length) {
                    localStorage.setItem('heldInvoices', JSON.stringify(filtered));
                    console.log(`Cleaned up ${invoices.length - filtered.length} old held invoices`);
                }
            } catch (e) {
                console.error('Error cleaning up held invoices:', e);
            }
        }

        // Remove other old temporary data if needed
        const keysToCheck = Object.keys(localStorage);
        keysToCheck.forEach(key => {
            // Remove any keys with timestamp older than 30 days
            if (key.includes('_temp_') || key.includes('_cache_')) {
                try {
                    const data = JSON.parse(localStorage.getItem(key) || '{}');
                    if (data.timestamp) {
                        const thirtyDaysAgo = new Date();
                        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                        if (new Date(data.timestamp) < thirtyDaysAgo) {
                            localStorage.removeItem(key);
                            console.log(`Cleaned up old cache: ${key}`);
                        }
                    }
                } catch (e) {
                    // Ignore parse errors
                }
            }
        });
    } catch (e) {
        console.error('Error during cleanup:', e);
    }
};

/**
 * Get safe JSON string with size limit
 * Truncate if exceeds limit
 */
export const getSafeJSONString = (data: any, maxSizeKB: number = 100): string => {
    const json = JSON.stringify(data);
    const maxBytes = maxSizeKB * 1024;

    if (json.length > maxBytes) {
        console.warn(`Data size ${json.length} bytes exceeds limit ${maxBytes} bytes. Truncating...`);
        // For orders, we can limit the number of items
        if (Array.isArray(data)) {
            // Keep only most recent items
            const truncated = data.slice(0, Math.floor(data.length / 2));
            return JSON.stringify(truncated);
        }
        // For other data, just truncate
        return json.substring(0, maxBytes);
    }

    return json;
};

/**
 * Log localStorage usage info (for debugging)
 */
export const logStorageInfo = (): void => {
    console.group('📦 localStorage Info');
    console.log('Total size:', getLocalStorageSizeFormatted());
    console.log('Remaining space (approx):', (getLocalStorageRemaining() / 1024).toFixed(2), 'KB');
    console.log('Is available:', checkLocalStorageAvailable());

    // List all POS-related keys
    const posKeys = Object.keys(localStorage).filter(k => k.includes('pos_'));
    if (posKeys.length > 0) {
        console.log('POS keys:', posKeys.map(k => {
            const size = (localStorage.getItem(k)?.length || 0) / 1024;
            return `${k}: ${size.toFixed(2)} KB`;
        }));
    }
    console.groupEnd();
};
