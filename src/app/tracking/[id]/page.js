import OrderTracking from '@/components/OrderTracking';

export default async function TrackingPage({ params }) {
  const { id } = await params;
  return <OrderTracking orderId={id} />;
}
