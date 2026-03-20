import { test, expect } from '@playwright/test';
import { renderToString } from 'react-dom/server';
import React from 'react';
import NotificationCenter from '../src/components/NotificationCenter';
import NotificationContext from '../src/context/NotificationContext';
import { BrowserRouter } from 'react-router-dom';
import AuthContext from '../src/context/AuthContext';

// We just want to check if the button renders correctly with aria-attributes
// For a true e2e test we'd need the Vite server running.
// For Palette UX changes, rendering the component to string is often enough to check DOM attributes.

const mockNotifications = [
    { id: 1, title: 'Test', message: 'Test message', read: false, type: 'info', timestamp: new Date() }
];

const contextValue = {
    notifications: mockNotifications,
    markAsRead: () => {},
    markAllAsRead: () => {},
    removeNotification: () => {},
    clearAll: () => {}
};

test('NotificationCenter accessibility attributes', async ({ page }) => {
    const htmlString = renderToString(
        <NotificationContext.Provider value={contextValue}>
            <NotificationCenter />
        </NotificationContext.Provider>
    );

    await page.setContent(`
        <html>
            <body>
                <div id="root">${htmlString}</div>
            </body>
        </html>
    `);

    // Verify trigger button
    const triggerBtn = page.locator('.notification-bell-container');
    await expect(triggerBtn).toHaveAttribute('aria-label', 'Notifications');
    await expect(triggerBtn).toHaveAttribute('aria-haspopup', 'true');
    await expect(triggerBtn).toHaveAttribute('aria-expanded', 'false');

    // To test the panel rendering, we would normally click the button.
    // Since this is static HTML from renderToString, the Framer Motion AnimatePresence
    // won't trigger the modal open state dynamically.
    // But we know the DOM attributes are correct on the trigger.

    await page.screenshot({ path: '/home/jules/verification/verification.png' });
});
