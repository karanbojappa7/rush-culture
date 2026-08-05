import Link from "next/link";
import { AdminShell } from "@/components/common/layout/admin-shell";
import {
  DataTable,
  DataTableCell,
  DataTableRow,
} from "@/components/common/ui/data-table";
import { ListToolbar } from "@/components/common/ui/list-toolbar";
import { PaginationNav } from "@/components/common/ui/pagination-nav";
import { ReviewModerationActions } from "@/components/meta/reviews/review-moderation-actions";
import { apiGet } from "@/base/api-server";
import { emptyPage, pageQuery, type PageResult } from "@/base/pagination";
import { getSessionUser, sessionLabel } from "@/base/session";

type Review = {
  id: string;
  displayName: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  isApproved: boolean;
  createdAt: string;
  customer?: { name: string | null; email: string } | null;
  product?: { id: string; name: string; slug: string } | null;
};

type Props = {
  searchParams: Promise<{
    page?: string;
    status?: string;
    q?: string;
    from?: string;
    to?: string;
  }>;
};

export default async function ReviewsAdminPage({ searchParams }: Props) {
  const { page = "1", status = "pending", q, from, to } = await searchParams;
  const [user, res] = await Promise.all([
    getSessionUser(),
    apiGet<PageResult<Review>>(
      `/api/reviews/admin${pageQuery({ page, limit: 20, status, q, from, to })}`,
    ),
  ]);
  const data = res.data ?? emptyPage<Review>();

  const filters = [
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "All", value: "all" },
  ];

  return (
    <AdminShell
      title="Reviews"
      userLabel={sessionLabel(user)}
      roleCode={user?.roleCode}
      permissions={user?.permissions}
      breadcrumbs={[
        { label: "Overview", href: "/" },
        { label: "Reviews" },
      ]}
    >
      <ListToolbar
        total={data.total}
        noun="reviews"
        placeholder="Search reviewer, product, comment…"
        filters={
          <div className="flex flex-wrap gap-1.5">
            {filters.map((filter) => {
              const active = status === filter.value;
              return (
                <Link
                  key={filter.label}
                  href={`/reviews${pageQuery({ status: filter.value, q, from, to })}`}
                  className={`cursor-pointer px-3 py-1.5 text-[11px] font-semibold tracking-[0.1em] uppercase transition-colors ${
                    active
                      ? "bg-ink text-white"
                      : "border border-line text-mute hover:border-ink/40 hover:text-ink"
                  }`}
                >
                  {filter.label}
                </Link>
              );
            })}
          </div>
        }
      />

      <DataTable
        columns={[
          { key: "product", header: "Product" },
          { key: "reviewer", header: "Reviewer" },
          { key: "rating", header: "Rating" },
          { key: "comment", header: "Comment" },
          { key: "when", header: "When" },
          { key: "actions", header: "" },
        ]}
        empty={
          q || status !== "all"
            ? "No reviews match your filters."
            : "No reviews yet."
        }
        isEmpty={data.items.length === 0}
      >
        {data.items.map((review) => (
          <DataTableRow key={review.id}>
            <DataTableCell className="font-medium">
              {review.product ? (
                <Link
                  href={`/products/${review.product.id}`}
                  className="hover:underline"
                >
                  {review.product.name}
                </Link>
              ) : (
                "—"
              )}
            </DataTableCell>
            <DataTableCell>
              <div>{review.displayName || review.customer?.name || "—"}</div>
              <div className="text-mute">{review.customer?.email}</div>
            </DataTableCell>
            <DataTableCell>
              <span className="tabular-nums">{review.rating}/5</span>
              {!review.isApproved ? (
                <span className="ml-2 text-[10px] tracking-[0.08em] uppercase text-mute">
                  pending
                </span>
              ) : null}
            </DataTableCell>
            <DataTableCell className="max-w-xs">
              {review.title ? (
                <div className="font-medium">{review.title}</div>
              ) : null}
              <div className="line-clamp-2 text-mute">
                {review.body || "—"}
              </div>
            </DataTableCell>
            <DataTableCell mute>
              {new Date(review.createdAt).toLocaleString("en-IN")}
            </DataTableCell>
            <DataTableCell align="right">
              <ReviewModerationActions
                id={review.id}
                isApproved={review.isApproved}
              />
            </DataTableCell>
          </DataTableRow>
        ))}
      </DataTable>
      <PaginationNav
        page={data.page}
        totalPages={data.totalPages}
        total={data.total}
        basePath="/reviews"
        searchParams={{ status, q, from, to }}
      />
    </AdminShell>
  );
}
