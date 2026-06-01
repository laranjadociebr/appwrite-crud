import { Client, Databases } from "react-native-appwrite";

/**
 * Configurações centralizadas do Appwrite.
 * Mantemos em um único lugar para facilitar manutenção e estudos.
 */
export const appwriteConfig = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT ?? "",
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID ?? "",
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID ?? "aula_db",
  collections: {
    clientes: process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_CLIENTES ?? "cliente",
    produtos: process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_PRODUTOS ?? "produto",
    vendedores: process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_VENDEDORES ?? "vendedor",
    vendas: process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_VENDAS ?? "venda",
  },
  fields: {
    saleClient: process.env.EXPO_PUBLIC_APPWRITE_FIELD_SALE_CLIENT ?? "cliente",
    saleSeller: process.env.EXPO_PUBLIC_APPWRITE_FIELD_SALE_SELLER ?? "vendedor",
    // Caso no seu Appwrite esteja como "itens[]", ajuste no .env.
    saleItems: process.env.EXPO_PUBLIC_APPWRITE_FIELD_SALE_ITEMS ?? "itens",
  },
};

/**
 * Cliente principal para chamadas HTTP ao Appwrite.
 */
export const appwriteClient = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId);

/**
 * SDK de Database com operações de CRUD.
 */
export const databases = new Databases(appwriteClient);
