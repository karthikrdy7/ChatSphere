function buildCreatedAtCursor(before, beforeId) {
  if (!before) {
    return beforeId ? { error: 'Message cursor timestamp is required when an identifier is supplied.' } : { filter: null };
  }

  const createdAt = new Date(before);
  if (Number.isNaN(createdAt.getTime())) {
    return { error: 'Message cursor must be a valid timestamp.' };
  }

  if (!beforeId) return { filter: { createdAt: { $lt: createdAt } } };
  return {
    filter: {
      $or: [
        { createdAt: { $lt: createdAt } },
        { createdAt, _id: { $lt: beforeId } },
      ],
    },
  };
}

module.exports = { buildCreatedAtCursor };
