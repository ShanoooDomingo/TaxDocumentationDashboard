// Tiny shared state for the active form-type filter. Kept in its own module
// so both the sidebar and the table renderer can read it without a circular
// import between them.

let activeFormFilter = 'All';

export function getActiveFilter() { return activeFormFilter; }
export function setActiveFilter(value) { activeFormFilter = value; }
