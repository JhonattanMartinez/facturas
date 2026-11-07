// Tipos para Firestore según el diseño del AGENT.md

// Cliente: identificado por documento (NIT/CC sin puntos ni DV)
export interface Cliente {
  documento: string;
  dv: string;
  nombre: string;
  creadoEn: FirebaseFirestore.Timestamp;
  primerProcesoId: string;
}

// Ítem de una factura
export interface ItemFactura {
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

// Factura: usando hash de la imagen como ID
export interface Factura {
  numero: string;
  fecha: string; // yyyy-mm-dd (emisión)
  proveedor: string;
  nitProveedor: string;
  dvProveedor: string;
  clienteDocumento: string | null; // null si DV no pasa
  clienteNombre: string | null;
  subtotal: number;
  iva: number;
  impoconsumo: number | null;
  total: number;
  estado: "aceptada" | "revision" | "error";
  motivos: string[];
  archivo: string; // nombre del blob
  blobPathname: string; // ruta en Blob
  confianzaOcr: number; // 0-1
  procesoId: string;
  uid: string; // dueño del lote
  creadoEn: FirebaseFirestore.Timestamp;
  items: ItemFactura[];
  clienteDv: string | null; // DV leído del cliente
  dvProveedor: string | null; // DV leído del proveedor
  corregidaManualmente: boolean;
  corregidaPor: string | null;
  corregidaEn: FirebaseFirestore.Timestamp | null;
  motivosOriginales: string[];
  validacionesIgnoradas: string[];
}

// Índice único por número de factura
export interface IndiceNumero {
  hashArchivo: string;
}

// Estado del lote
export type EstadoProceso = "subiendo" | "ejecutando" | "terminado";

// Métricas por lote
export interface Metricas {
  aceptadas: { n: number; subtotal: number; iva: number; impoconsumo: number; total: number };
  revision: { n: number; subtotal: number; iva: number; impoconsumo: number; total: number };
  manuales: { n: number; subtotal: number; iva: number; impoconsumo: number; total: number };
  errores: number;
  duplicadas: number;
  clientesNuevos: number;
  proveedores: Record<string, { nombre: string; n: number; subtotal: number }>;
}

// Cola de archivos a procesar
export type ResultadoArchivo = "aceptada" | "revision" | "duplicada" | "error";

export interface ArchivoCola {
  blobPathname: string;
  nombre: string;
  estado: string;
  resultado: ResultadoArchivo;
  clienteNuevo: boolean;
  clienteExistente: boolean;
  hashArchivo: string;
  intentos: number;
  error: string | null;
  disponibleDesde: number; // timestamp, 0 = espera, MAX_SAFE_INTEGER = terminado
}

// Lote/proceso
export interface Proceso {
  uid: string;
  carpeta: string;
  estado: EstadoProceso;
  totalArchivos: number;
  inicio: FirebaseFirestore.Timestamp | null;
  fin: FirebaseFirestore.Timestamp | null;
  rutaExcel: string | null;
  finalizandoDesde: number | null; // timestamp para bloqueo de 2 min
  metricas: Metricas;
}