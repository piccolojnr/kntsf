import { CreditCard, FileText, House, User } from "lucide-react-native";

import { RoleTabsLayout } from "@/components/layout/role-tabs-layout";

export default function StudentLayout() {
  return (
    <RoleTabsLayout
      role="student"
      tabs={[
        { name: "index", title: "Home", icon: House },
        { name: "permits", title: "Permits", icon: FileText },
        { name: "card", title: "Card", icon: CreditCard },
        { name: "profile", title: "Profile", icon: User },
      ]}
    />
  );
}
