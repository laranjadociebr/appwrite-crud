import { Redirect } from "expo-router";

export default function IndexScreen() {
  // Redireciona automaticamente para a primeira aba.
  return <Redirect href="/(tabs)/vendas" />;
}