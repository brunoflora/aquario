// Ponto único de notificação "algo foi salvo localmente" — equivalente ao
// hook único que saveJSON() tinha no vanilla (que também disparava
// markCloudDirty). Desacoplado de React de propósito: o módulo de nuvem
// (useCloudSync) assina isto sem precisar estar no meio da árvore de
// contexto do estado local.

const listeners = new Set();

export function onPersist(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function emitPersist(tableKey) {
  listeners.forEach((cb) => cb(tableKey));
}
