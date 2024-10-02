/**
 * Show a Dialog as defined in informationDialog.tsx
 * @param headline The Headline of the dialog
 * @param text The text of the dialog
 */
export function showDialog(headline: string, text: string) {
  (document.getElementById('informationDialogHeadline') as HTMLDivElement).innerText = headline;
  (document.getElementById('informationDialogText') as HTMLDivElement).innerText = text;
  (document.getElementById('informationDialog') as HTMLDialogElement).showModal();
}
