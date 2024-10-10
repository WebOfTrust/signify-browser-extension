const windowOriginAtLoadTime = window.location.origin;
export function postMessage(data: any) {
  window.postMessage(data, windowOriginAtLoadTime);
}
