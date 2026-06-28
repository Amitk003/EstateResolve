import { IngestionDropzone } from "@/components/IngestionDropzone";
import { EstateLedger } from "@/components/EstateLedger";
import { ActionDesk } from "@/components/ActionDesk";

export default function Dashboard() {
  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
            EstateResolve
          </h1>
          <p className="text-sm text-zinc-500">
            Estate settlement workspace
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
          Pod connected
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-6 lg:flex-row">
        <div className="flex w-full flex-col gap-6 lg:w-80">
          <IngestionDropzone />
        </div>

        <div className="flex flex-1 flex-col gap-6">
          <EstateLedger />
        </div>

        <div className="flex w-full flex-col gap-6 lg:w-96">
          <ActionDesk />
        </div>
      </main>
    </div>
  );
}
