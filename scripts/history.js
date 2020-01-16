/**
 * @param {App.Revision[]} revisions
 * @return {App.History}
 */
export function create(revisions=[]) {
  return { cursor: -1, revisions };
}

/**
 * @param {App.History} history
 * @param {number} cursor
 * @return {App.History}
 */
export function selectRevision(history, cursor) {
  return { ...history, cursor };
}

/**
 * @param {App.History} history
 * @return {App.History}
 */
export function undo(history) {
  return { ...history, cursor: history.cursor - 1 };
}

/**
 * @param {App.History} history
 * @return {App.History}
 */
export function redo(history) {
  return { ...history, cursor: history.cursor + 1 };
}

/**
 * @param {App.History} history
 * @return {Editor.Doc}
 */
export function getCurrentDoc(history) {
  let revision = getRevision(history, history.cursor);
  return revision.doc;
}

/**
 * @param {App.History} history
 * @param {number} id
 * @return {App.Revision}
 */
export function getRevision(history, id) {
  return history.revisions[id];
}

/**
 * @param {App.History} history
 * @return {boolean}
 */
export function canUndo(history) {
  return history.cursor > 0;
}

/**
 * @param {App.History} history
 * @return {boolean}
 */
export function canRedo(history) {
  return history.cursor < (history.revisions.length - 1);
}

/**
 * @param {App.History} history
 * @param {number} index
 * @return {boolean}
 */
export function isInFuture(history, index) {
  return index > history.cursor;
}

/**
 * @param {App.History} history
 * @param {Editor.Doc} doc
 * @param {App.Action} action
 * @return {App.History}
 */
export function addRevision(history, doc, action = null) {
  let currentRevision = getRevision(history, history.cursor);

  let newRevision = createRevision({
    id: history.cursor + 1,
    doc,
    action,
    timestamp: Date.now(),
  });

  // Discard revisions that have been undone.
  let revisions = history.revisions.slice(0, history.cursor + 1);

  // Merge new revision into current one if possible
  if (currentRevision && canBatch(currentRevision, newRevision)) {
    return editRevision(history, currentRevision.id, () => {
      return batch(currentRevision, newRevision);
    });
  }

  // Append if the revision can't be batched
  return {
    ...history,
    cursor: newRevision.id,
    revisions: [...revisions, newRevision],
  };
}

/**
 * @param {App.History} history
 * @param {App.Revision["id"]} revisionId
 * @param {(rev: App.Revision) => App.Revision} callback
 * @return {App.History}
 */
export function editRevision(history, revisionId, callback) {
  let revisions = history.revisions.map(rev => {
    if (rev.id === revisionId) {
      return callback(rev);
    } else {
      return rev;
    }
  });

  return { ...history, revisions };
}

/**
 * @param {App.Revision} revisionA
 * @param {App.Revision} revisionB
 * @return {boolean}
 */
function canBatch(revisionA, revisionB) {
  if (revisionA.action == null || revisionB.action == null) {
    return false;
  }

  if (revisionA.action.type !== revisionB.action.type) {
    return false;
  }

  let delta = revisionB.timestamp - revisionA.timestamp;

  return delta < 500;
}

/**
 * @param {App.Revision} revisionA
 * @param {App.Revision} revisionB
 * @return {App.Revision}
 */
function batch(revisionA, revisionB) {
  return {
    id: revisionA.id,
    doc: revisionB.doc,
    timestamp: revisionB.timestamp,
    action: revisionA.action,
    actions: [...revisionA.actions, ...revisionB.actions]
  };
}

/**
 * @param {Partial<App.Revision>} revision
 * @return {App.Revision}
 */
export function createRevision({
  id,
  doc,
  timestamp = Date.now(),
  action = null
}) {
  return {
    id,
    doc,
    action,
    timestamp,
    actions: action ? [action] : [],
  }
}
