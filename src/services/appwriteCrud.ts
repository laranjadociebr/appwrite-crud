import { ID, Query } from "react-native-appwrite";
import { appwriteConfig, databases } from "@/src/lib/appwrite";
import type {
  Cliente,
  Produto,
  SaleInput,
  Venda,
  Vendedor,
} from "@/src/types/entities";

/**
 * Tenta converter o campo de itens em array, independente de como veio do banco.
 */
export function parseSaleItems(venda: Venda): string[] {
  const rawItems = venda[appwriteConfig.fields.saleItems as keyof Venda] ?? venda.itens ?? venda["itens[]"];

  if (Array.isArray(rawItems)) {
    return rawItems.map((item) => String(item));
  }

  if (typeof rawItems !== "string" || rawItems.trim() === "") {
    return [];
  }

  try {
    const parsed = JSON.parse(rawItems);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item));
    }
  } catch {
    // Se não for JSON válido, seguimos com fallback.
  }

  return rawItems
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function listClientes() {
  const response = await databases.listDocuments<Cliente>(
    appwriteConfig.databaseId,
    appwriteConfig.collections.clientes,
    [Query.orderDesc("$createdAt"), Query.limit(100)],
  );

  return response.documents;
}

export async function createCliente(nome: string, telefone: string) {
  return databases.createDocument<Cliente>(
    appwriteConfig.databaseId,
    appwriteConfig.collections.clientes,
    ID.unique(),
    { nome, telefone },
  );
}

export async function listProdutos() {
  const response = await databases.listDocuments<Produto>(
    appwriteConfig.databaseId,
    appwriteConfig.collections.produtos,
    [Query.orderDesc("$createdAt"), Query.limit(100)],
  );

  return response.documents;
}

export async function createProduto(nome: string, preco: string) {
  return databases.createDocument<Produto>(
    appwriteConfig.databaseId,
    appwriteConfig.collections.produtos,
    ID.unique(),
    { nome, preco: parseFloat(preco) },
  );
}

export async function listVendedores() {
  const response = await databases.listDocuments<Vendedor>(
    appwriteConfig.databaseId,
    appwriteConfig.collections.vendedores,
    [Query.orderDesc("$createdAt"), Query.limit(100)],
  );

  return response.documents;
}

export async function createVendedor(nome: string, telefone: string) {
  return databases.createDocument<Vendedor>(
    appwriteConfig.databaseId,
    appwriteConfig.collections.vendedores,
    ID.unique(),
    { nome, telefone },
  );
}

export async function listVendas() {
  const response = await databases.listDocuments<Venda>(
    appwriteConfig.databaseId,
    appwriteConfig.collections.vendas,
    [Query.orderDesc("$createdAt"), Query.limit(100)],
  );

  return response.documents;
}

export async function createVenda(input: SaleInput) {
  const payload = {
    [appwriteConfig.fields.saleClient]: input.cliente,
    [appwriteConfig.fields.saleSeller]: input.vendedor,
    [appwriteConfig.fields.saleItems]: input.itens,
  };

  return databases.createDocument<Venda>(
    appwriteConfig.databaseId,
    appwriteConfig.collections.vendas,
    ID.unique(),
    payload,
  );
}

export async function updateVenda(vendaId: string, input: SaleInput) {
  const payload = {
    [appwriteConfig.fields.saleClient]: input.cliente,
    [appwriteConfig.fields.saleSeller]: input.vendedor,
    [appwriteConfig.fields.saleItems]: input.itens,
  };

  return databases.updateDocument<Venda>(
    appwriteConfig.databaseId,
    appwriteConfig.collections.vendas,
    vendaId,
    payload,
  );
}

export async function deleteVenda(vendaId: string) {
  return databases.deleteDocument(
    appwriteConfig.databaseId,
    appwriteConfig.collections.vendas,
    vendaId,
  );
}
