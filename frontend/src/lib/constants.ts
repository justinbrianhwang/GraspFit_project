export const API_BASE_URL = import.meta.env.VITE_API_URL || '';
export const MODEL_PATH = '/models/grip_autoencoder.onnx';
export const MODEL_META_PATH = '/models/model_meta.json';
export const MEDIAPIPE_WASM_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm';
export const MEDIAPIPE_MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
export const SMOOTHING_BUFFER_SIZE = 5;
export const TARGET_FPS = 15;
export const MIN_HAND_CONFIDENCE = 0.5;
