// Ambient types for the InPost easyPack widget loaded via <script> in index.html.
// Point shape per InPost's Points API (which feeds the widget): `address` is
// display lines only (line2 = "post_code city"); structured fields, including
// the city, live in `address_details`.
interface EasyPackPoint {
  name: string;
  address?: { line1?: string; line2?: string };
  address_details?: {
    city?: string;
    province?: string;
    post_code?: string;
    street?: string;
    building_number?: string | null;
    flat_number?: string | null;
  };
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
