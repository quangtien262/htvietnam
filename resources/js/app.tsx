import '../css/app.css';
import '../css/admin.css';
import React from 'react';
import { createInertiaApp } from '@inertiajs/react';
import { InertiaProgress } from '@inertiajs/progress';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from "react-dom/client"

const appName = 'HTVN Admin';

createInertiaApp({
    title: (title) => `${appName}`,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.tsx`, import.meta.glob('./Pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
        // return render(<App {...props} />, el);
    },
});

InertiaProgress.init({
  color: '#0ac903ff',
  showSpinner: true,
  delay: 100
});
