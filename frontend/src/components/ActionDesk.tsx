"use client";

import { useRecords, useUpdateRecord } from "lemma-sdk/react";
import { getLemmaClient } from "@/lib/lemma-client";
import { useState } from "react";
import type { RecordSort } from "lemma-sdk";

const STATUS_COLORS: Record<string, string> = {
  Pending: "text-amber-600 bg-amber-50 border-amber-200",
  Approved: "text-blue-600 bg-blue-50 border-blue-200",
  Rejected: "text-red-600 bg-red-50 border-red-200",
  Executed: "text-emerald-600 bg-emerald-50 border-emerald-200",
};

const ACTION_ICONS: Record<string, string> = {
  "Close Account": "\u2299",
  "Notify Creditor": "\u2709",
  "Transfer Funds": "\u2194",
  "File Claim": "\u2696",
  "Cancel Subscription": "\u2716",
  Other: "\u2691",
};

function ActionCard({
  action,
  onApprove,
  onReject,
  isSubmitting,
}: {
  action: any;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isSubmitting: boolean;
}) {
  const draft = action.draft_payload || {};
  const statusColor =
    STATUS_COLORS[action.human_approval_status] || STATUS_COLORS.Pending;
  const icon = ACTION_ICONS[action.action_type] || ACTION_ICONS.Other;

  return (
    <div
      className={`rounded-lg border bg-white p-4 transition-shadow hover:shadow-sm ${
        action.human_approval_status === "Pending"
          ? "border-zinc-200"
          : "border-zinc-100 opacity-60"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <div>
            <h3 className="text-sm font-semibold text-zinc-800">
              {action.action_type}
            </h3>
            <p className="text-xs text-zinc-500">
              {draft.institution || draft.institution_name || "Unknown institution"}
            </p>
          </div>
        </div>
        <span
          className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${statusColor}`}
        >
          {action.human_approval_status}
        </span>
      </div>

      {draft.body && (
        <div className="mt-3 rounded-md bg-zinc-50 p-3">
          <pre className="whitespace-pre-wrap text-xs leading-relaxed text-zinc-600">
            {draft.body.substring(0, 500)}
            {draft.body.length > 500 ? "..." : ""}
          </pre>
        </div>
      )}

      {action.human_approval_status === "Pending" && (
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={() => onApprove(action.id)}
            disabled={isSubmitting}
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
          >
            {isSubmitting ? "Processing..." : "Approve"}
          </button>
          <button
            onClick={() => onReject(action.id)}
            disabled={isSubmitting}
            className="rounded-md border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      )}

      {action.feedback && (
        <p className="mt-2 text-xs italic text-zinc-400">
          Feedback: {action.feedback}
        </p>
      )}
    </div>
  );
}

export function ActionDesk() {
  const client = getLemmaClient();
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);

  const sort: RecordSort[] = [{ field: "created_at", direction: "desc" }];

  const { records, isLoading, error, refresh } = useRecords({
    client,
    tableName: "Action_Queue",
    limit: 50,
    sort,
  });

  const approveUpdater = useUpdateRecord({
    client,
    tableName: "Action_Queue",
  });

  const rejectUpdater = useUpdateRecord({
    client,
    tableName: "Action_Queue",
  });

  const handleApprove = async (id: string) => {
    setSelectedActionId(id);
    try {
      await approveUpdater.update(
        { human_approval_status: "Approved" },
        { recordId: id }
      );
      refresh();
    } catch (err) {
      console.error("Failed to approve action:", err);
    } finally {
      setSelectedActionId(null);
    }
  };

  const handleReject = async (id: string) => {
    setSelectedActionId(id);
    try {
      await rejectUpdater.update(
        { human_approval_status: "Rejected" },
        { recordId: id }
      );
      refresh();
    } catch (err) {
      console.error("Failed to reject action:", err);
    } finally {
      setSelectedActionId(null);
    }
  };

  const pendingCount = (records || []).filter(
    (r: any) => r.human_approval_status === "Pending"
  ).length;

  if (error) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Action Desk
          </h2>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Could not load actions. Make sure the Lemma pod is running.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Action Desk
        </h2>
        <span className="text-xs text-zinc-400">
          {pendingCount} pending
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {isLoading ? (
          <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-400">
            Loading actions...
          </div>
        ) : !records || records.length === 0 ? (
          <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-400">
            No actions yet. Actions will appear here when the Execution Worker drafts them.
          </div>
        ) : (
          records.map((action: any) => (
            <ActionCard
              key={action.id}
              action={action}
              onApprove={handleApprove}
              onReject={handleReject}
              isSubmitting={selectedActionId === action.id}
            />
          ))
        )}
      </div>
    </div>
  );
}
