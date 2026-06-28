"use client";

import { useRecords } from "lemma-sdk/react";
import { getLemmaClient } from "@/lib/lemma-client";
import { useState } from "react";
import type { RecordSort } from "lemma-sdk";

const CLASSIFICATION_COLORS: Record<string, string> = {
  Asset: "text-emerald-600 bg-emerald-50",
  Liability: "text-red-600 bg-red-50",
  Expense: "text-amber-600 bg-amber-50",
};

const RESOLUTION_COLORS: Record<string, string> = {
  Discovered: "text-zinc-600 bg-zinc-100",
  Notified: "text-blue-600 bg-blue-50",
  "In Progress": "text-amber-600 bg-amber-50",
  Resolved: "text-emerald-600 bg-emerald-50",
  Closed: "text-zinc-400 bg-zinc-50",
};

type SortField = "classification" | "institution_name" | "estimated_value" | "resolution_status" | "date_discovered";

export function EstateLedger() {
  const [sortField, setSortField] = useState<SortField>("date_discovered");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [classFilter, setClassFilter] = useState<string>("all");

  const client = getLemmaClient();

  const sort: RecordSort[] = [{ field: sortField, direction: sortDir }];

  const { records, isLoading, error } = useRecords({
    client,
    tableName: "Estate_Inventory",
    limit: 100,
    sort,
  });

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const sortArrow = (field: SortField) => {
    if (sortField !== field) return "";
    return sortDir === "asc" ? " \u25B2" : " \u25BC";
  };

  const filteredRecords = (records || []).filter((r: any) => {
    if (classFilter === "all") return true;
    return r.classification === classFilter;
  });

  if (error) {
    return (
      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Estate Ledger
        </h2>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Could not load estate data. Make sure the Lemma pod is running.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Estate Ledger
        </h2>
        <div className="flex items-center gap-2">
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="rounded-md border border-zinc-200 px-2 py-1 text-xs text-zinc-600"
          >
            <option value="all">All</option>
            <option value="Asset">Assets</option>
            <option value="Liability">Liabilities</option>
            <option value="Expense">Expenses</option>
          </select>
          <span className="text-xs text-zinc-400">
            {filteredRecords.length} entries
          </span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-100 text-xs text-zinc-500">
              <th
                className="cursor-pointer px-3 py-2.5 font-medium hover:text-zinc-800"
                onClick={() => toggleSort("classification")}
              >
                Type{sortArrow("classification")}
              </th>
              <th
                className="cursor-pointer px-3 py-2.5 font-medium hover:text-zinc-800"
                onClick={() => toggleSort("institution_name")}
              >
                Institution{sortArrow("institution_name")}
              </th>
              <th className="px-3 py-2.5 font-medium">Account</th>
              <th
                className="cursor-pointer px-3 py-2.5 font-medium hover:text-zinc-800"
                onClick={() => toggleSort("estimated_value")}
              >
                Value{sortArrow("estimated_value")}
              </th>
              <th
                className="cursor-pointer px-3 py-2.5 font-medium hover:text-zinc-800"
                onClick={() => toggleSort("resolution_status")}
              >
                Status{sortArrow("resolution_status")}
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-3 py-12 text-center text-zinc-400">
                  Loading...
                </td>
              </tr>
            ) : filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-12 text-center text-zinc-400">
                  No entries yet. Upload a document to get started.
                </td>
              </tr>
            ) : (
              filteredRecords.map((record: any) => (
                <tr
                  key={record.id}
                  className="border-b border-zinc-50 transition-colors last:border-0 hover:bg-zinc-50"
                >
                  <td className="px-3 py-2.5">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        CLASSIFICATION_COLORS[record.classification] || "text-zinc-600 bg-zinc-100"
                      }`}
                    >
                      {record.classification}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 font-medium text-zinc-800">
                    {record.institution_name}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-xs text-zinc-500">
                    {record.account_number || "-"}
                  </td>
                  <td className="px-3 py-2.5 text-zinc-700">
                    {record.estimated_value != null
                      ? `$${Number(record.estimated_value).toLocaleString()}`
                      : "-"}
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        RESOLUTION_COLORS[record.resolution_status] || "text-zinc-600 bg-zinc-100"
                      }`}
                    >
                      {record.resolution_status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
