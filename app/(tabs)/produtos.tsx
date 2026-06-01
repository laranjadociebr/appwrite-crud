import { useCallback, useEffect, useState } from "react";
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
  TextInput,
  View,
} from "react-native";
import type { Produto } from "@/src/types/entities";
import { listProdutos, createProduto } from "@/src/services/appwriteCrud";

export default function ProdutosScreen() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nome: "", preco: "" });

  const loadProdutos = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await listProdutos();
      setProdutos(data);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage("Não foi possível carregar os produtos.");
      console.error("Erro ao listar produtos:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadProdutos();
  }, [loadProdutos]);

  function openModal() {
    setForm({ nome: "", preco: "" });
    setModalVisible(true);
  }

  function closeModal() {
    setModalVisible(false);
    setForm({ nome: "", preco: "" });
  }

  async function handleSave() {
    if (!form.nome.trim() || !form.preco.trim()) {
      Alert.alert("Erro", "Preencha nome e preço");
      return;
    }

    try {
      setSaving(true);
      await createProduto(form.nome.trim(), form.preco.trim());
      closeModal();
      await loadProdutos();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar o produto.");
      console.error("Erro ao salvar produto:", error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Produtos</Text>
        <Pressable style={styles.primaryButton} onPress={openModal}>
          <Text style={styles.primaryButtonText}>+ Novo produto</Text>
        </Pressable>
      </View>

      <Text style={styles.subtitle}>
        Lista didática de produtos vindos da collection `produto`.
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#0B63F6" />
      ) : errorMessage ? (
        <Text style={styles.error}>{errorMessage}</Text>
      ) : (
        <FlatList
          data={produtos}
          keyExtractor={(item) => item.$id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadProdutos(true)}
            />
          }
          ListEmptyComponent={
            <Text style={styles.empty}>
              Nenhum produto encontrado na base.
            </Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.title}>{item.nome ?? "Sem nome"}</Text>
              <Text style={styles.meta}>Preço: {item.preco ?? "-"}</Text>
              <Text style={styles.meta}>Imagem: {item.imagem ?? "-"}</Text>
            </View>
          )}
        />
      )}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <ScrollView>
              <Text style={styles.modalTitle}>Novo produto</Text>

              <Text style={styles.label}>Nome</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite o nome"
                value={form.nome}
                onChangeText={(text) => setForm({ ...form, nome: text })}
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.label}>Preço</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite o preço"
                value={form.preco}
                onChangeText={(text) => setForm({ ...form, preco: text })}
                placeholderTextColor="#9CA3AF"
                keyboardType="decimal-pad"
              />

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
  subtitle: { fontSize: 14, marginBottom: 12, color: "#4A4A4A" },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E7E8EC",
  },
  title: { fontSize: 16, fontWeight: "700", marginBottom: 4, color: "#222" },
  meta: { fontSize: 13, color: "#575A65" },
  error: { color: "#A4161A", fontWeight: "600" },
  empty: { textAlign: "center", marginTop: 20, color: "#6B7280" },
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
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    backgroundColor: "#FFF",
    color: "#111827",
  },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: 8 },
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
