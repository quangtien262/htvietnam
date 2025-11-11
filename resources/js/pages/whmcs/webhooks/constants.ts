/**
 * Webhook Events Constants
 * Shared across WebhookCreate, WebhookEdit, and WebhookList components
 */

export const AVAILABLE_EVENTS = [
    // Invoice Events
    { label: 'Invoice Created', value: 'invoice.created' },
    { label: 'Invoice Paid', value: 'invoice.paid' },
    { label: 'Invoice Cancelled', value: 'invoice.cancelled' },
    { label: 'Invoice Refunded', value: 'invoice.refunded' },

    // Payment Events
    { label: 'Payment Received', value: 'payment.received' },
    { label: 'Payment Failed', value: 'payment.failed' },

    // Service Events
    { label: 'Service Created', value: 'service.created' },
    { label: 'Service Activated', value: 'service.activated' },
    { label: 'Service Suspended', value: 'service.suspended' },
    { label: 'Service Terminated', value: 'service.terminated' },
    { label: 'Service Cancelled', value: 'service.cancelled' },

    // Ticket Events
    { label: 'Ticket Created', value: 'ticket.created' },
    { label: 'Ticket Updated', value: 'ticket.updated' },
    { label: 'Ticket Replied', value: 'ticket.replied' },
    { label: 'Ticket Closed', value: 'ticket.closed' },

    // Client Events
    { label: 'Client Created', value: 'client.created' },
    { label: 'Client Updated', value: 'client.updated' },
];

export const EVENT_CATEGORIES = {
    invoice: 'Invoice Events',
    payment: 'Payment Events',
    service: 'Service Events',
    ticket: 'Ticket Events',
    client: 'Client Events',
};

export const getEventLabel = (value: string): string => {
    const event = AVAILABLE_EVENTS.find(e => e.value === value);
    return event ? event.label : value;
};

export const getEventsByCategory = (category: string) => {
    return AVAILABLE_EVENTS.filter(e => e.value.startsWith(category + '.'));
};
