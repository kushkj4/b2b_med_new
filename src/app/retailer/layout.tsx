import DashboardLayout from '@/components/layout/DashboardLayout';

export default function RetailerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <DashboardLayout>{children}</DashboardLayout>;
}
