import RoleEntry from '@/components/RoleEntry';
import SystemSettings from '@/components/SystemSettings';

export default function AdminSystemSettingsPage() {
  return (
    <RoleEntry requiredRole="ADMIN">
      <SystemSettings />
    </RoleEntry>
  );
}