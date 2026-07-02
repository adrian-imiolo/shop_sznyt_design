// Ambient types for the InPost easyPack widget loaded via <script> in index.html.
interface EasyPackPoint {
  name: string;
  address?: { line1?: string; city?: string };
}

interface EasyPackModal {
  closeModal: () => void;
}

interface EasyPack {
  init: (options: { defaultLocale: string }) => void;
  modalMap: (
    onSelect: (point: EasyPackPoint, modal: EasyPackModal) => void,
    options: { width: number; height: number },
  ) => void;
}

interface Window {
  easyPack?: EasyPack;
}
