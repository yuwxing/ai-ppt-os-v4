import { createWorker } from 'tesseract.js';

let workerPromise = null;
let workerRef = null;

async function getWorker() {
  if (workerPromise) return workerPromise;
  workerPromise = (async () => {
    try {
      const worker = await createWorker(['chi_sim', 'eng'], 1, {
        logger: (m) => { /* 可选进度回调 */ },
      });
      workerRef = worker;
      return worker;
    } catch (e) {
      workerPromise = null;
      throw e;
    }
  })();
  return workerPromise;
}

export async function localOcrImage(dataUrl, onProgress) {
  const worker = await getWorker();
  try {
    const { data } = await worker.recognize(dataUrl);
    return (data.text || '').trim();
  } catch (e) {
    // 识别失败时重置 worker，下次重试
    try { await workerRef?.terminate(); } catch {}
    workerPromise = null;
    workerRef = null;
    throw e;
  }
}

export function resetOcrWorker() {
  if (workerRef) {
    try { workerRef.terminate(); } catch {}
  }
  workerRef = null;
  workerPromise = null;
}
