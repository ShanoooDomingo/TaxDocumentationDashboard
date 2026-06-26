// Pure status evaluation for a package row. Order matters: the first unmet
// requirement is the one surfaced to the user.

const STATUSES = {
  mainForm:   { text: 'Pending Tax Return',       color: 'bg-red-100 text-red-700 border-red-200' },
  refFile:    { text: 'Pending Filing Reference', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  paymentFile:{ text: 'Pending Payment Details',  color: 'bg-purple-100 text-purple-700 border-purple-200' },
  attachment: { text: 'Pending SLSP/QAP',         color: 'bg-orange-100 text-orange-700 border-orange-200' },
  eSubReply:  { text: 'Pending eSub Reply',        color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  done:       { text: 'Completed',                 color: 'bg-green-100 text-green-700 border-green-200' },
};

export function evaluateStatus(pkg) {
  if (!pkg.mainForm) return STATUSES.mainForm;
  if (!pkg.refFile) return STATUSES.refFile;
  if (!pkg.paymentFile) return STATUSES.paymentFile;
  if (pkg.requiresAttachment && !pkg.attachment) return STATUSES.attachment;
  if (pkg.requiresAttachment && !pkg.eSubReply) return STATUSES.eSubReply;
  return STATUSES.done;
}

export function isComplete(pkg) {
  return evaluateStatus(pkg).text === STATUSES.done.text;
}
