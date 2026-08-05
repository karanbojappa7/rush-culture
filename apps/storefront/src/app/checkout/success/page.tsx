import Link from "next/link";

type Props = {
  searchParams: Promise<{ order?: string }>;
};

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { order } = await searchParams;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-[1400px] flex-col items-start justify-center px-5 pt-28 pb-20 md:px-8">
      <p className="text-[12px] font-medium tracking-[0.14em] uppercase text-mute">
        Order confirmed
      </p>
      <h1 className="mt-2 font-display text-5xl font-extrabold tracking-tight text-ink md:text-7xl">
        You’re in.
      </h1>
      {order ? (
        <p className="mt-4 text-lg text-mute">
          Order <span className="font-semibold text-ink">{order}</span> is saved.
          Payment details are in the admin dashboard.
        </p>
      ) : (
        <p className="mt-4 text-lg text-mute">Your order is saved.</p>
      )}
      <Link href="/shop" className="btn-primary mt-8">
        Keep shopping
      </Link>
    </div>
  );
}
