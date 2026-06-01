import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type {
  Cliente,
  Produto,
  SaleInput,
  Venda,
  Vendedor,
} from "@/src/types/entities";
import {
  createVenda,
  deleteVenda,
  listClientes,
  listProdutos,
  listVendedores,
  listVendas,
  parseSaleItems,
  updateVenda,
} from "@/src/services/appwriteCrud";

type FormState = {
  cliente: string;
  vendedor: string;
  itensSelecionados: string[];
};

const initialForm: FormState = {
  cliente: "",
  vendedor: "",
  itensSelecionados: [],
};

export default function VendasScreen() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Controle de modal e modo (criar/editar).
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSale, setEditingSale] = useState<Venda | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [selectorVisible, setSelectorVisible] = useState(false);
  const [selectorType, setSelectorType] = useState<"cliente" | "vendedor" | "produtos">("cliente");

  const produtosNomes = useMemo(() => {
    return produtos.map((produto) => produto.nome).filter(Boolean) as string[];
  }, [produtos]);

  const loadBaseData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Carregamos tudo em paralelo para reduzir tempo de espera.
      const [vendasData, clientesData, produtosData, vendedoresData] = await Promise.all([
        listVendas(),
        listClientes(),
        listProdutos(),
        listVendedores(),
      ]);

      setVendas(vendasData);
      setClientes(clientesData);
      setProdutos(produtosData);
      setVendedores(vendedoresData);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage("Erro ao carregar dados no Appwrite.");
      console.error("Erro ao carregar base:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadBaseData();
  }, [loadBaseData]);

  function openCreateModal() {
    setEditingSale(null);
    setForm(initialForm);
    // Recarrega produtos antes de abrir modal para pegar produtos novos
    (async () => {
      try {
        const produtosData = await listProdutos();
        setProdutos(produtosData);
      } catch (error) {
        console.error("Erro ao recarregar produtos:", error);
      }
      setModalVisible(true);
    })();
  }

  function openEditModal(venda: Venda) {
    setEditingSale(venda);
    setForm({
      cliente: venda.cliente ?? "",
      vendedor: venda.vendedor ?? "",
      itensSelecionados: parseSaleItems(venda),
    });
    setModalVisible(true);
  }

  function closeModal() {
    setModalVisible(false);
    setEditingSale(null);
    setForm(initialForm);
  }

  function buildPayload(): SaleInput | null {
    // Validação básica para manter os exemplos consistentes.
    if (!form.cliente || !form.vendedor || form.itensSelecionados.length === 0) {
      Alert.alert(
        "Campos obrigatórios",
        "Preencha cliente, vendedor e pelo menos um item.",
      );
      return null;
    }

    return {
      cliente: form.cliente.trim(),
      vendedor: form.vendedor.trim(),
      itens: form.itensSelecionados,
    };
  }

  function openSelector(type: "cliente" | "vendedor" | "produtos") {
    setSelectorType(type);
    setSelectorVisible(true);
  }

  function closeSelector() {
    setSelectorVisible(false);
  }

  function toggleProduto(nomeProduto: string) {
    setForm((prev) => {
      const alreadySelected = prev.itensSelecionados.includes(nomeProduto);
      if (alreadySelected) {
        return {
          ...prev,
          itensSelecionados: prev.itensSelecionados.filter(
            (item) => item !== nomeProduto,
          ),
        };
      }
      return {
        ...prev,
        itensSelecionados: [...prev.itensSelecionados, nomeProduto],
      };
    });
  }

  const selectorTitle = useMemo(() => {
    if (selectorType === "cliente") return "Selecione um cliente";
    if (selectorType === "vendedor") return "Selecione um vendedor";
    return "Selecione os produtos";
  }, [selectorType]);

  async function handleSave() {
    const payload = buildPayload();
    if (!payload) return;

    try {
      setSaving(true);

      // Se existe venda em edição, atualizamos. Caso contrário, criamos.
      if (editingSale) {
        await updateVenda(editingSale.$id, payload);
      } else {
        await createVenda(payload);
      }

      closeModal();
      await loadBaseData();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar a venda.");
      console.error("Erro ao salvar venda:", error);
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(venda: Venda) {
    debugDelete(venda).catch((err) => console.error("debugDelete error:", err));
  }

  async function debugDelete(venda: Venda) {
    try {
      setDeletingId(venda.$id);
      await deleteVenda(venda.$id);
      setVendas((prev) => prev.filter((v) => v.$id !== venda.$id));
      await loadBaseData();
      Alert.alert("OK", "Venda excluída com sucesso");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível excluir a venda.");
      console.error("Erro ao excluir venda:", error);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>CRUD de Vendas (didático)</Text>
        <Pressable style={styles.primaryButton} onPress={openCreateModal}>
          <Text style={styles.primaryButtonText}>+ Nova venda</Text>
        </Pressable>
      </View>

      <Text style={styles.helpText}>
        Fluxo: listar, criar, editar e excluir documentos da collection `venda`.
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#0B63F6" />
      ) : errorMessage ? (
        <Text style={styles.error}>{errorMessage}</Text>
      ) : (
        <FlatList
          data={vendas}
          keyExtractor={(item) => item.$id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadBaseData(true)}
            />
          }
          ListEmptyComponent={
            <Text style={styles.empty}>Nenhuma venda cadastrada.</Text>
          }
          contentContainerStyle={vendas.length === 0 ? styles.emptyContainer : undefined}
          renderItem={({ item }) => {
            const itens = parseSaleItems(item);

            return (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Cliente: {item.cliente ?? "-"}</Text>
                <Text style={styles.meta}>Vendedor: {item.vendedor ?? "-"}</Text>
                <Text style={styles.meta}>
                  Itens: {itens.length > 0 ? itens.join(", ") : "Sem itens"}
                </Text>

                <View style={styles.actions}>
                  <Pressable
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => openEditModal(item)}
                  >
                    <Text style={styles.actionText}>Editar</Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.actionButton,
                      styles.deleteButton,
                      deletingId === item.$id && styles.disabledButton,
                    ]}
                    onPress={() => handleDelete(item)}
                    disabled={deletingId === item.$id}
                  >
                    <Text style={styles.actionText}>
                      {deletingId === item.$id ? "Excluindo..." : "Excluir"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          }}
        />
      )}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <ScrollView>
              <Text style={styles.modalTitle}>
                {editingSale ? "Editar venda" : "Nova venda"}
              </Text>

              <Text style={styles.label}>Cliente</Text>
              <Pressable style={styles.inputLikeSelect} onPress={() => openSelector("cliente")}>
                <Text style={form.cliente ? styles.selectValue : styles.selectPlaceholder}>
                  {form.cliente || "Selecione um cliente"}
                </Text>
              </Pressable>
              <Text style={styles.hint}>
                Opções carregadas da collection `cliente`.
              </Text>

              <Text style={styles.label}>Vendedor</Text>
              <Pressable style={styles.inputLikeSelect} onPress={() => openSelector("vendedor")}>
                <Text style={form.vendedor ? styles.selectValue : styles.selectPlaceholder}>
                  {form.vendedor || "Selecione um vendedor"}
                </Text>
              </Pressable>

              <Text style={styles.label}>Produtos da venda</Text>
              <Pressable style={[styles.inputLikeSelect, styles.inputLikeMultiselect]} onPress={() => openSelector("produtos")}>
                <Text
                  style={
                    form.itensSelecionados.length > 0
                      ? styles.selectValue
                      : styles.selectPlaceholder
                  }
                >
                  {form.itensSelecionados.length > 0
                    ? form.itensSelecionados.join(", ")
                    : "Selecione um ou mais produtos"}
                </Text>
              </Pressable>
              <Text style={styles.hint}>
                Opções carregadas da collection `produto`.
              </Text>

              <View style={styles.modalActions}>
                <Pressable style={styles.ghostButton} onPress={closeModal}>
                  <Text style={styles.ghostButtonText}>Cancelar</Text>
                </Pressable>

                <Pressable
                  style={[styles.primaryButton, saving && styles.disabledButton]}
                  onPress={handleSave}
                  disabled={saving}
                >
                  <Text style={styles.primaryButtonText}>
                    {saving ? "Salvando..." : "Salvar"}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={selectorVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.selectorCard}>
            <Text style={styles.modalTitle}>{selectorTitle}</Text>
            <ScrollView style={styles.selectorScroll}>
              {selectorType === "cliente" &&
                clientes.map((cliente) => {
                  const nome = cliente.nome ?? "";
                  const selected = form.cliente === nome;
                  return (
                    <Pressable
                      key={cliente.$id}
                      style={[styles.selectorOption, selected && styles.selectorOptionSelected]}
                      onPress={() => {
                        setForm((prev) => ({ ...prev, cliente: nome }));
                        closeSelector();
                      }}
                    >
                      <Text style={styles.selectorOptionText}>{nome || "Sem nome"}</Text>
                    </Pressable>
                  );
                })}

              {selectorType === "vendedor" &&
                vendedores.map((vendedor) => {
                  const nome = vendedor.nome ?? "";
                  const selected = form.vendedor === nome;
                  return (
                    <Pressable
                      key={vendedor.$id}
                      style={[styles.selectorOption, selected && styles.selectorOptionSelected]}
                      onPress={() => {
                        setForm((prev) => ({ ...prev, vendedor: nome }));
                        closeSelector();
                      }}
                    >
                      <Text style={styles.selectorOptionText}>{nome || "Sem nome"}</Text>
                    </Pressable>
                  );
                })}

              {selectorType === "produtos" &&
                produtosNomes.map((nomeProduto) => {
                  const selected = form.itensSelecionados.includes(nomeProduto);
                  return (
                    <Pressable
                      key={nomeProduto}
                      style={[styles.selectorOption, selected && styles.selectorOptionSelected]}
                      onPress={() => toggleProduto(nomeProduto)}
                    >
                      <Text style={styles.selectorOptionText}>
                        {selected ? "✓ " : ""}{nomeProduto}
                      </Text>
                    </Pressable>
                  );
                })}
            </ScrollView>
            <View style={styles.modalActions}>
              <Pressable style={styles.ghostButton} onPress={closeSelector}>
                <Text style={styles.ghostButtonText}>Fechar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#F7F8FA" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#111827", flex: 1 },
  helpText: { color: "#4B5563", marginBottom: 12, fontSize: 13 },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardTitle: { fontSize: 15, fontWeight: "700", marginBottom: 4, color: "#111827" },
  meta: { fontSize: 13, color: "#4B5563" },
  actions: { flexDirection: "row", gap: 8, marginTop: 10 },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButton: { backgroundColor: "#DBEAFE" },
  deleteButton: { backgroundColor: "#FEE2E2" },
  actionText: { fontWeight: "600", color: "#1F2937" },
  primaryButton: {
    backgroundColor: "#0B63F6",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 100,
  },
  primaryButtonText: { color: "#FFF", fontWeight: "700" },
  disabledButton: { opacity: 0.6 },
  error: { color: "#A4161A", fontWeight: "600" },
  empty: { textAlign: "center", marginTop: 20, color: "#6B7280" },
  emptyContainer: { flexGrow: 1, justifyContent: "center" },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: 16,
  },
  modalCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    maxHeight: "85%",
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12, color: "#111827" },
  label: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 },
  inputLikeSelect: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    backgroundColor: "#FFF",
  },
  inputLikeMultiselect: { minHeight: 70, justifyContent: "center" },
  selectPlaceholder: { color: "#9CA3AF" },
  selectValue: { color: "#111827" },
  hint: { fontSize: 12, color: "#6B7280", marginBottom: 12 },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: 8 },
  selectorCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    maxHeight: "75%",
  },
  selectorScroll: { maxHeight: 360 },
  selectorOption: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  selectorOptionSelected: {
    backgroundColor: "#DBEAFE",
    borderColor: "#93C5FD",
  },
  selectorOptionText: { color: "#111827", fontWeight: "500" },
  ghostButton: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  ghostButtonText: { color: "#374151", fontWeight: "600" },
});
