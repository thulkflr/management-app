// services/authService.js
import { getSheetData } from '@/lib/googleSheets';

export const authService = {
    /**
     * Checks if a user email is in the allowed list and is active.
     * @param {string} email 
     * @returns {Promise<{isAllowed: boolean, userData: any}>}
     */
    async isUserAllowed(email) {
        if (!email) return { isAllowed: false, userData: null };

        try {
            const allowedUsers = await getSheetData('AllowedUsers');
            
            // Search for the user in the allowlist
            const user = allowedUsers.find(u => 
                u.email?.toLowerCase() === email.toLowerCase() && 
                u.active?.toString().toLowerCase() === 'true'
            );

            if (user) {
                return {
                    isAllowed: true,
                    userData: {
                        email: user.email,
                        name: user.full_name || user.name,
                        role: user.role || 'Member',
                    }
                };
            }

            return { isAllowed: false, userData: null };
        } catch (error) {
            console.error("Error checking allowlist:", error);
            // In case of error (like sheet not found), deny access for security
            return { isAllowed: false, userData: null };
        }
    }
};
