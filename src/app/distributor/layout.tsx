import DashboardLayout from '@/components/layout/DashboardLayout';

export default function DistributorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <DashboardLayout>{children}</DashboardLayout>;
}
