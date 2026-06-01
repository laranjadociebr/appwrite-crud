import type { Models } from "react-native-appwrite";

export type Cliente = Models.Document & {
  nome?: string;
  telefone?: string;
};

export type Produto = Models.Document & {
  nome?: string;
  preco?: string;
  imagem?: string;
};

export type Vendedor = Models.Document & {
  nome?: string;
  telefone?: string;
};

export type Venda = Models.Document & {
  cliente?: string;
  vendedor?: string;
  itens?: string;
  "itens[]"?: string;
};

export type SaleInput = {
  cliente: string;
  vendedor: string;
  itens: string[];
};
