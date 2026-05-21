"use client";

import { useCallback, useEffect, useState } from "react";
import { BottomNav, type Tab } from "@/components/BottomNav";
import { CompraTab } from "@/components/tabs/CompraTab";
import { FamilyTab } from "@/components/tabs/FamilyTab";
import { MenuTab } from "@/components/tabs/MenuTab";
import { readFamily, writeFamily, type Member } from "@/lib/family";
import {
  readCachedMenu,
  writeCachedMenu,
  type MenuResponse,
} from "@/lib/menuApi";

export default function App() {
  const [hydrated, setHydrated] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [menu, setMenu] = useState<MenuResponse | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<Tab>("familia");

  // Hidratar desde localStorage al montar
  useEffect(() => {
    const storedFamily = readFamily() ?? [];
    const storedMenu = readCachedMenu();
    setMembers(storedFamily);
    setMenu(storedMenu);
    // Si ya hay familia guardada, saltamos directamente al menú
    if (storedFamily.length > 0) setActiveTab("menu");
    setHydrated(true);
  }, []);

  // Persistir cambios en la familia
  useEffect(() => {
    if (!hydrated) return;
    writeFamily(members);
  }, [members, hydrated]);

  // Persistir el menú generado para que ambas pestañas lo compartan
  const updateMenu = useCallback((next: MenuResponse | null) => {
    setMenu(next);
    if (next) {
      writeCachedMenu(next);
    }
  }, []);

  // Antes de hidratar evitamos parpadeos sirviendo un esqueleto neutro
  if (!hydrated) {
    return <div className="min-h-dvh bg-white" />;
  }

  return (
    <div className="min-h-dvh bg-white">
      <div className="pb-20">
        {activeTab === "familia" && (
          <FamilyTab members={members} onChange={setMembers} />
        )}
        {activeTab === "menu" && (
          <MenuTab
            members={members}
            menu={menu}
            onMenuChange={updateMenu}
            onGoFamilia={() => setActiveTab("familia")}
          />
        )}
        {activeTab === "compra" && (
          <CompraTab
            members={members}
            menu={menu}
            checked={checked}
            onCheckedChange={setChecked}
            onGoMenu={() => setActiveTab("menu")}
            onGoFamilia={() => setActiveTab("familia")}
          />
        )}
      </div>

      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  );
}
